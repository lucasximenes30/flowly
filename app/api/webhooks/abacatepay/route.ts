import { NextResponse } from 'next/server'
import { AbacatePay } from '@abacatepay/sdk'
import { PrismaClient, UserSubscriptionStatus } from '@prisma/client'
import { activateVipAccess } from '@/services/subscription.service'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const signature = req.headers.get('x-webhook-signature')
  
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await req.text()

  let abacate
  try {
    abacate = AbacatePay(process.env.ABACATEPAY_API_KEY!)
  } catch (err: any) {
    console.error('[AbacatePay Webhook] Failed to initialize SDK:', err.message)
    return NextResponse.json({ error: 'SDK Initialization Failed' }, { status: 500 })
  }

  try {
    const event = abacate.webhooks.verify(rawBody, signature)
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
