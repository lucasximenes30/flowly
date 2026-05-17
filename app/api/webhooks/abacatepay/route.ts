import { NextResponse } from 'next/server'
import { PrismaClient, UserSubscriptionStatus } from '@prisma/client'
import { activateVipAccess } from '@/services/subscription.service'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const signature = req.headers.get('x-webhook-signature')
  
  if (!signature) {
    console.error('[AbacatePay Webhook] Missing x-webhook-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await req.text()
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET

  // Signature verification using native Node.js crypto
  if (secret) {
    try {
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(rawBody)
      const expectedSignature = hmac.digest('base64')

      const isBufferMatch = crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      )

      if (!isBufferMatch) {
        console.error('[AbacatePay Webhook] Invalid signature verification')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.log('[AbacatePay Webhook] Signature verified successfully.')
    } catch (err: any) {
      console.error('[AbacatePay Webhook] Signature validation error:', err.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    // If no secret is configured in development, we allow bypassing verification
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AbacatePay Webhook] [DEV-ONLY] Webhook secret not configured in .env. Bypassing signature verification.')
    } else {
      console.error('[AbacatePay Webhook] ABACATEPAY_WEBHOOK_SECRET is not configured. Rejecting request.')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
  }

  try {
    const event = JSON.parse(rawBody)
    console.log('[AbacatePay Webhook] Event received:', event.event)

    if (event.event === 'billing.paid') {
      const billing = event.data as any
      // The customer externalId is where we stored user.id in the checkout
      const userId = billing.customer?.metadata?.userId || billing.metadata?.userId || billing.externalId
      const transactionId = billing.id
      const amountCents = billing.amount || 0
      
      console.log(`[AbacatePay Webhook] Payment confirmed for user: ${userId}, transaction: ${transactionId}`)

      if (userId) {
        // Upsert payment transaction
        await prisma.paymentTransaction.upsert({
          where: { providerTransactionId: transactionId },
          update: {
            status: 'ACTIVE',
            rawStatus: 'billing.paid',
            paidAt: new Date(),
            updatedAt: new Date(),
          },
          create: {
            userId,
            provider: 'abacatepay',
            providerTransactionId: transactionId,
            amount: amountCents / 100,
            status: 'ACTIVE',
            rawStatus: 'billing.paid',
            paidAt: new Date(),
          },
        })

        // Activate VIP
        await activateVipAccess({
          userId: userId,
          transactionId: transactionId,
        })
        
        // Also update billing provider info
        await prisma.user.update({
          where: { id: userId },
          data: {
            billingProvider: 'abacatepay',
            subscriptionStatus: UserSubscriptionStatus.ACTIVE,
          }
        })
      }
    }

    // We can also handle other events like billing.cancelled if AbacatePay has them, 
    // but the task specifies billing.paid

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 })
  } catch (err: any) {
    console.error('[AbacatePay Webhook] Signature verification failed or error processing:', err.message)
    return NextResponse.json({ error: 'Unauthorized or Error Processing' }, { status: 401 })
  }
}
