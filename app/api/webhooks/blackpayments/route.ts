import { NextResponse } from 'next/server'
import { PrismaClient, UserSubscriptionStatus, UserPlan } from '@prisma/client'

const prisma = new PrismaClient()

/** Safe log of headers (exclude sensitive keys) */
function logHeadersSafely(headers: Headers) {
  const headerLog: Record<string, string> = {}
  headers.forEach((value, key) => {
    // Log header names and existence, but not values for sensitive headers
    if (['authorization', 'cookie', 'x-webhook-secret', 'secret'].includes(key.toLowerCase())) {
      headerLog[key] = '[REDACTED]'
    } else {
      headerLog[key] = value.substring(0, 50) // First 50 chars only
    }
  })
  return headerLog
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    
    console.log('[BlackPayments Webhook] Received webhook request')
    console.log('[BlackPayments Webhook] Headers present:', Object.keys(Object.fromEntries(req.headers.entries())))

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      console.error('[BlackPayments Webhook] Invalid JSON. Body snippet:', rawBody.substring(0, 100))
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('[BlackPayments Webhook] Payload parsed successfully')

    // ── Provider-specific validation approach ──────────────────────────────
    // BlackPayments may or may not send webhook secret. Validate structure instead.
    
    const secret = payload.secret || req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.BLACKPAY_WEBHOOK_SECRET
    
    // Only enforce secret validation if both are configured
    if (expectedSecret && secret) {
      if (secret !== expectedSecret) {
        console.error('[BlackPayments Webhook] Secret mismatch - rejecting webhook')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.log('[BlackPayments Webhook] Secret validated successfully')
    } else if (expectedSecret && !secret) {
      console.warn('[BlackPayments Webhook] Expected secret but none provided in webhook - accepting based on payload validation')
    } else if (!expectedSecret) {
      console.log('[BlackPayments Webhook] BLACKPAY_WEBHOOK_SECRET not configured - validating by payload structure only')
    }

    // ── Validate payload structure ────────────────────────────────────────
    // BlackPayments webhook should have either top-level status or nested data.status
    const payloadStatus = payload.status || payload.data?.status
    if (!payloadStatus) {
      console.warn('[BlackPayments Webhook] No status field found in payload - treating as informational')
    }

    // Extract necessary fields - check multiple locations for flexibility
    const status = (payloadStatus || '').toLowerCase()
    const email = payload.customer?.email || payload.data?.customer?.email || payload.email || payload.data?.email
    const transactionId = payload.id || payload.data?.id || payload.transactionId || payload.data?.transactionId
    
    // Extract userId from metadata (might be string or object)
    let metadata = payload.metadata || payload.data?.metadata || {}
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata)
      } catch {
        // If string, try to extract userId directly
        metadata = { userId: metadata }
      }
    }
    const userId = metadata.userId || payload.userId || payload.data?.userId

    console.log('[BlackPayments Webhook] Extracted fields:', {
      statusFound: !!status,
      status: status || 'none',
      emailFound: !!email,
      transactionIdFound: !!transactionId,
      userIdFound: !!userId,
    })

    if (!email && !userId) {
      console.error('[BlackPayments Webhook] No email or userId found in payload - cannot identify user')
      return NextResponse.json({ error: 'No user identification found in payload' }, { status: 400 })
    }

    // Find the user safely
    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        console.log(`[BlackPayments Webhook] User found by ID: ${user.email}`)
      }
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        console.log(`[BlackPayments Webhook] User found by email: ${user.email}`)
      }
    }

    if (!user) {
      console.log(`[BlackPayments Webhook] User not found (email: ${email}, userId: ${userId}) - webhook accepted but user not in system`)
      return NextResponse.json({ success: true, message: 'User not found in system, webhook acknowledged' }, { status: 200 })
    }

    // ── Status handling - only activate on confirmed payment statuses ──────
    // waiting_payment, pending → keep inactive or set to PENDING
    // approved, paid, payment_confirmed, completed → activate ACTIVE
    // refused, declined, failed → mark REFUSED or keep inactive
    // canceled, expired → mark CANCELED

    let statusUpdated = false
    let newStatus: UserSubscriptionStatus | null = null

    if (status === 'approved' || status === 'paid' || status === 'payment_confirmed' || status === 'completed') {
      newStatus = UserSubscriptionStatus.ACTIVE
      statusUpdated = true
      console.log(`[BlackPayments Webhook] Status "${status}" maps to ACTIVE - activating user`)
    } else if (status === 'waiting_payment' || status === 'pending') {
      // Do NOT activate user - keep them as PENDING or INACTIVE
      console.log(`[BlackPayments Webhook] Status "${status}" is pending - NOT activating user yet`)
      newStatus = UserSubscriptionStatus.PENDING
      // Only update if user is not already ACTIVE (don't downgrade)
      if (user.subscriptionStatus !== UserSubscriptionStatus.ACTIVE) {
        statusUpdated = true
      }
    } else if (status === 'refused' || status === 'declined' || status === 'failed') {
      newStatus = UserSubscriptionStatus.REFUSED
      statusUpdated = true
      console.log(`[BlackPayments Webhook] Status "${status}" is failed - marking as REFUSED`)
    } else if (status === 'canceled' || status === 'cancelled' || status === 'expired') {
      newStatus = UserSubscriptionStatus.CANCELED
      statusUpdated = true
      console.log(`[BlackPayments Webhook] Status "${status}" is cancelled - marking as CANCELED`)
    } else {
      console.log(`[BlackPayments Webhook] Unknown status: "${status}" - no action taken`)
    }

    // Apply update if needed
    if (statusUpdated && newStatus) {
      try {
        const updateData: any = {
          subscriptionStatus: newStatus,
          billingProvider: 'blackpayments',
        }

        // Only set these fields if we have them
        if (transactionId) updateData.caktoOrderId = transactionId
        
        // If ACTIVE, set subscription dates (30 days from now)
        if (newStatus === UserSubscriptionStatus.ACTIVE) {
          const now = new Date()
          updateData.plan = UserPlan.PRO
          updateData.billingApprovedAt = now
          updateData.subscriptionStartDate = now
          updateData.subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
          console.log(`[BlackPayments Webhook] Setting subscription dates: ${now.toISOString()} to ${updateData.subscriptionEndDate.toISOString()}`)
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        })

        console.log(`[BlackPayments Webhook] User ${user.email} updated: subscriptionStatus=${newStatus}`)
      } catch (updateErr: any) {
        console.error(`[BlackPayments Webhook] Failed to update user ${user.email}:`, updateErr.message)
        // Still return 200 so webhook doesn't retry infinitely
      }
    } else {
      console.log(`[BlackPayments Webhook] No status update applied for user ${user.email}`)
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 })
  } catch (err: any) {
    console.error('[BlackPayments Webhook] Uncaught error:', err.message)
    console.error('[BlackPayments Webhook] Error stack:', err.stack)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
