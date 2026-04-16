import { NextResponse } from 'next/server'
import { PrismaClient, UserSubscriptionStatus } from '@prisma/client'
import { verifyCaktoWebhookSignature } from '@/lib/cakto'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    
    // Basic verification stub (could check headers like x-cakto-signature in future if Cakto provides it)
    const token = req.headers.get('x-cakto-token') || req.headers.get('authorization')?.split(' ')[1]
    if (!verifyCaktoWebhookSignature(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Safety log for debugging payloads during setup. Remove sensitive PII if needed.
    if (process.env.NODE_ENV === 'development') {
      console.log('Cakto Webhook Payload:', JSON.stringify(payload, null, 2))
    }

    // Cakto webhook events typically follow a pattern like 'payment.approved', 'subscription.renewed', etc.
    const event = payload.event || payload.type
    // We assume data is inside `data` or at the root level depending on the version of the API
    const data = payload.data || payload

    if (!event || !data) {
       return NextResponse.json({ error: 'Malformed payload' }, { status: 400 })
    }

    const email = data.customer?.email || data.user?.email || data.email
    if (!email) {
      // Some events might not contain an email. If they don't, we can't tie it to a user right now.
      return NextResponse.json({ error: 'No email found in payload' }, { status: 400 })
    }

    const orderId = data.id || data.transactionId || data.orderId
    const subscriptionId = data.subscription?.id || data.subscriptionId

    // Simple mapping logic
    let targetStatus: UserSubscriptionStatus | null = null
    const eventLower = event.toLowerCase()

    if (
      eventLower.includes('payment.approved') || 
      eventLower.includes('subscription.renewed') ||
      eventLower.includes('subscription.created')
    ) {
      targetStatus = UserSubscriptionStatus.ACTIVE
    } else if (
      eventLower.includes('payment.refused') || 
      eventLower.includes('renewal.refused')
    ) {
      targetStatus = UserSubscriptionStatus.REFUSED // Or PAST_DUE
    } else if (
      eventLower.includes('subscription.canceled') || 
      eventLower.includes('subscription.cancelled')
    ) {
      targetStatus = UserSubscriptionStatus.CANCELED
    } else if (
      eventLower.includes('payment.generated') ||
      eventLower.includes('payment.pending')
    ) {
      targetStatus = UserSubscriptionStatus.PENDING
    } else if (eventLower.includes('subscription.past_due')) {
        targetStatus = UserSubscriptionStatus.PAST_DUE
    }

    // Attempt to detect if the "workout" extra module was purchased.
    // This looks at offers, products, or tags within the payload.
    const hasWorkoutModule = JSON.stringify(data).toLowerCase().includes('treino')

    // Find the user by their checkout email
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // If user does not exist but payment is approved, we MUST create a skeleton user 
      // so they can claim their account (e.g. via "Forgot Password").
      if (targetStatus === UserSubscriptionStatus.ACTIVE) {
        const randomPassword = crypto.randomBytes(16).toString('hex')
        const hashedPassword = await bcrypt.hash(randomPassword, 10)
        
        user = await prisma.user.create({
          data: {
            email,
            name: data.customer?.name || data.user?.name || data.name || 'Usuário Vynta',
            password: hashedPassword,
            subscriptionStatus: UserSubscriptionStatus.ACTIVE,
            billingProvider: 'cakto',
            hasWorkoutModule,
            caktoOrderId: orderId,
            caktoSubscriptionId: subscriptionId,
            billingEmail: email,
            billingApprovedAt: new Date()
          }
        })
      }
    } else {
      // If user exists, we update their status if the event warrants a status change.
      if (targetStatus) {
        await prisma.user.update({
          where: { email },
          data: {
            subscriptionStatus: targetStatus,
            billingProvider: 'cakto',
            ...(orderId ? { caktoOrderId: orderId } : {}),
            ...(subscriptionId ? { caktoSubscriptionId: subscriptionId } : {}),
            // Defaulting hasWorkoutModule to true only if detected in *this* payload. 
            // Might need adjustments if partial payloads overwrite this.
            ...(hasWorkoutModule ? { hasWorkoutModule: true } : {}),
            ...(targetStatus === UserSubscriptionStatus.ACTIVE ? { billingApprovedAt: new Date() } : {})
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
