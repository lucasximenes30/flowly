import { NextResponse } from 'next/server'
import { PrismaClient, UserSubscriptionStatus } from '@prisma/client'
import { activateVipAccess } from '@/services/subscription.service'
import { FacebookService } from '@/services/facebook.service'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  let signature = req.headers.get('x-webhook-signature')?.trim() || ''
  if (!signature) {
    signature = req.headers.get('x-abacatepay-signature')?.trim() || ''
  }

  if (!signature) {
    console.error('[AbacatePay Webhook] Missing signature headers')
  }

  const rawBody = await req.text()
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET

  // Fallback: check query parameter ?webhookSecret=...
  const url = new URL(req.url)
  const querySecret = url.searchParams.get('webhookSecret')
  let isQuerySecretMatch = false
  if (querySecret && secret && querySecret === secret) {
    isQuerySecretMatch = true
    console.log('[AbacatePay Webhook] Query param webhookSecret matched successfully.')
  }

  let isSignatureValid = false;

  // Signature verification using native Node.js crypto
  if (secret) {
    try {
      if (signature) {
        const expectedSignatureHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
        const expectedSignatureB64 = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')

        if (signature.length === expectedSignatureHex.length) {
          isSignatureValid = crypto.timingSafeEqual(
            Buffer.from(signature, 'utf8'),
            Buffer.from(expectedSignatureHex, 'utf8')
          )
        } else if (signature.length === expectedSignatureB64.length) {
          isSignatureValid = crypto.timingSafeEqual(
            Buffer.from(signature, 'utf8'),
            Buffer.from(expectedSignatureB64, 'utf8')
          )
        } else {
          console.error(`[AbacatePay Webhook] Signature length mismatch. Got ${signature.length} chars. Header value starts with: ${signature.substring(0, 15)}...`)
        }
      }

      if (!isSignatureValid && !isQuerySecretMatch) {
        console.warn('[AbacatePay Webhook] Invalid signature. Will fallback to strict API verification.')
      } else {
        console.log('[AbacatePay Webhook] Authorization verified successfully.')
      }
    } catch (err: any) {
      console.error('[AbacatePay Webhook] Signature validation error:', err.message)
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AbacatePay Webhook] [DEV-ONLY] Webhook secret not configured. Bypassing signature.')
      isSignatureValid = true;
    } else {
      console.warn('[AbacatePay Webhook] ABACATEPAY_WEBHOOK_SECRET is not configured. Will rely on strict API verification.')
    }
  }

  try {
    const event = JSON.parse(rawBody)
    console.log('[AbacatePay Webhook] Event received:', event.event)

    if (event.event === 'checkout.completed') {
      const checkout = event.data?.checkout
      
      if (!checkout) {
        console.error('[AbacatePay Webhook] No checkout data found in payload')
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
      }

      // The externalId format is now: {userId}_{timestamp}
      const rawExternalId = checkout.externalId || ''
      const userId = rawExternalId.split('_')[0]
      const transactionId = checkout.id
      const amountCents = checkout.amount || 0
      
      console.log(`[AbacatePay Webhook] Payment confirmed for user: ${userId}, transaction: ${transactionId}`)

      // Very important: Verify with AbacatePay API directly if the checkout is actually PAID
      // This protects against spoofed webhooks even if signature validation was bypassed
      try {
        const { AbacatePay } = await import('@abacatepay/sdk');
        // We only use the SDK for other stuff if needed, but for validation we use fetch
        
        let apiVerified = false;
        try {
          const res = await fetch(`https://api.abacatepay.com/v2/checkouts/list`, {
            headers: {
              'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            const list = data.data || [];
            const apiCheckout = list.find((c: any) => c.id === transactionId);
            if (apiCheckout && apiCheckout.status === 'PAID') {
               apiVerified = true;
            }
          }
        } catch (apiErr) {
          console.warn('[AbacatePay Webhook] SDK checkouts.list failed:', apiErr);
        }
        
        if (!isSignatureValid && !isQuerySecretMatch && !apiVerified) {
             console.error('[AbacatePay Webhook] Signature failed and no API verification possible. Rejecting.');
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      } catch (err: any) {
        console.warn('[AbacatePay Webhook] Could not verify via API:', err.message);
        if (!isSignatureValid && !isQuerySecretMatch) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      if (userId) {
        let planTier: 'VIP' | 'PRO' | 'PRO_YEARLY' = 'VIP';
        let usedUpgradeOffer: boolean | undefined = undefined;

        if (amountCents >= 23990) {
          planTier = 'PRO_YEARLY';
        } else if (amountCents >= 2990) {
          planTier = 'PRO';
        } else if (amountCents >= 2490) {
          planTier = 'PRO';
          usedUpgradeOffer = true;
        }

        // Upsert payment transaction
        await prisma.paymentTransaction.upsert({
          where: { providerTransactionId: transactionId },
          update: {
            status: 'ACTIVE',
            rawStatus: 'checkout.completed',
            paidAt: new Date(),
            updatedAt: new Date(),
          },
          create: {
            userId,
            provider: 'abacatepay',
            providerTransactionId: transactionId,
            amount: amountCents / 100,
            status: 'ACTIVE',
            rawStatus: 'checkout.completed',
            paidAt: new Date(),
          },
        })

        // Activate Subscription
        await activateVipAccess({
          userId: userId,
          transactionId: transactionId,
          planTier,
          usedUpgradeOffer,
        })
        
        // Also update billing provider info
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            billingProvider: 'abacatepay',
            subscriptionStatus: UserSubscriptionStatus.ACTIVE,
          }
        })
        
        // Dispara o evento de Purchase no CAPI
        try {
          // Extraindo IP e User Agent da requisição (nota: em webhooks, isso geralmente representa o servidor do gateway, 
          // mas estamos extraindo conforme solicitado para manter o padrão de leitura dos headers)
          const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? undefined
          const userAgent = req.headers.get('user-agent') ?? undefined
          
          await FacebookService.sendEvent('Purchase', {
            email: updatedUser.email,
            value: amountCents / 100,
            currency: 'BRL',
            clientIpAddress: ip,
            clientUserAgent: userAgent,
          }, req.url)
        } catch (e) {
          console.error('[AbacatePay Webhook] Falha ao enviar evento Purchase pro Meta CAPI:', e)
        }
      }
    }

    // We can also handle other events like checkout.cancelled if AbacatePay has them
    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 })
  } catch (err: any) {
    console.error('[AbacatePay Webhook] Signature verification failed or error processing:', err.message)
    return NextResponse.json({ error: 'Unauthorized or Error Processing' }, { status: 401 })
  }
}
