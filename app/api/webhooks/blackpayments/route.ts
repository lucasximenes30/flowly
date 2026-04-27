import { NextResponse } from 'next/server'
import { PrismaClient, UserSubscriptionStatus, UserPlan } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    
    console.log('--- BLACKPAYMENTS WEBHOOK RECEIVED ---');

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      console.error('[BlackPayments Webhook] Invalid JSON. Body snippet:', rawBody.substring(0, 100))
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Temporary logs as requested in Step 9
    console.log("Payment received:", payload)

    // Validate Secret if provided
    const secret = payload.secret || req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.BLACKPAY_WEBHOOK_SECRET
    
    if (expectedSecret && secret !== expectedSecret) {
      console.error(`[BlackPayments Webhook] Unauthorized: Secret mismatch`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    } else if (!expectedSecret) {
      console.warn('[BlackPayments Webhook] BLACKPAY_WEBHOOK_SECRET is not set. Accepting without signature verification.');
    }

    // Extract necessary fields
    const status = payload.status?.toLowerCase()
    const email = payload.customer?.email || payload.email
    const transactionId = payload.id || payload.transactionId
    const metadata = payload.metadata || {}
    const userId = typeof metadata === 'string' ? metadata : metadata.userId

    if (!email && !userId) {
      console.error('[BlackPayments Webhook] No email or userId found in payload data');
      return NextResponse.json({ error: 'No user identification found in payload data' }, { status: 400 })
    }

    // Find the user safely
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    if (!user) {
      console.log(`[BlackPayments Webhook] User with email ${email} or id ${userId} not found in database. Ignoring safely to prevent breaking existing users.`);
      return NextResponse.json({ success: true, message: 'User not found, skipped' }, { status: 200 })
    }

    // Handle Statuses
    if (status === "approved" || status === "paid") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: UserSubscriptionStatus.ACTIVE,
          plan: UserPlan.PRO,
          billingProvider: 'blackpayments',
          caktoOrderId: transactionId, // Reusing existing fields or we could add a new one, but to not break schema we use existing for generic ids if needed
          billingApprovedAt: new Date()
        }
      });
      console.log(`[BlackPayments Webhook] User ${user.email} updated to ACTIVE and PRO.`);
    } else if (status === "pending") {
      // Pending should keep inactive if they are inactive, or move to pending. 
      // Safe approach: only set to INACTIVE if they are not already ACTIVE to avoid downgrading by mistake.
      if (user.subscriptionStatus !== UserSubscriptionStatus.ACTIVE) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: UserSubscriptionStatus.INACTIVE
          }
        });
        console.log(`[BlackPayments Webhook] User ${user.email} status set to INACTIVE (pending payment).`);
      }
    } else if (status === "refused") {
      console.log(`[BlackPayments Webhook] Payment refused for ${user.email}. Doing nothing.`);
    } else {
      console.log(`[BlackPayments Webhook] Unknown or unhandled status: ${status}.`);
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    console.error('[BlackPayments Webhook] Uncaught error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
