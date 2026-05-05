import { NextResponse } from 'next/server'
import { PrismaClient, UserSubscriptionStatus, UserPlan, PaymentStatus } from '@prisma/client'
import { activateVipAccess } from '@/services/subscription.service'

const prisma = new PrismaClient()

/** Safe log of headers (exclude sensitive keys) */
function logHeadersSafely(headers: Headers) {
  const headerLog: Record<string, string> = {}
  headers.forEach((value, key) => {
    if (['authorization', 'cookie', 'x-webhook-secret', 'secret'].includes(key.toLowerCase())) {
      headerLog[key] = '[REDACTED]'
    } else {
      headerLog[key] = value.substring(0, 50)
    }
  })
  return headerLog
}

/** Map BlackPayments raw status to our PaymentStatus enum */
function mapToPaymentStatus(status: string): PaymentStatus {
  const s = status.toLowerCase()
  if (s === 'approved' || s === 'paid' || s === 'payment_confirmed' || s === 'completed') {
    return PaymentStatus.ACTIVE
  }
  if (s === 'waiting_payment' || s === 'pending') {
    return PaymentStatus.PENDING
  }
  if (s === 'refused' || s === 'declined' || s === 'failed') {
    return PaymentStatus.FAILED
  }
  if (s === 'canceled' || s === 'cancelled') {
    return PaymentStatus.CANCELED
  }
  if (s === 'expired') {
    return PaymentStatus.EXPIRED
  }
  return PaymentStatus.PENDING
}

/** Save or update a PaymentTransaction record — never throws */
async function upsertPaymentTransaction({
  userId,
  providerTransactionId,
  rawStatus,
  paymentStatus,
  amount,
  paymentMethod,
  paidAt,
  expiresAt,
}: {
  userId: string
  providerTransactionId: string | null
  rawStatus: string
  paymentStatus: PaymentStatus
  amount?: number | null
  paymentMethod?: string | null
  paidAt?: Date | null
  expiresAt?: Date | null
}) {
  try {
    if (providerTransactionId) {
      await prisma.paymentTransaction.upsert({
        where: { providerTransactionId },
        update: {
          status: paymentStatus,
          rawStatus,
          paidAt,
          expiresAt,
          updatedAt: new Date(),
        },
        create: {
          userId,
          provider: 'blackpayments',
          providerTransactionId,
          amount: amount != null ? amount : null,
          paymentMethod: paymentMethod ?? null,
          status: paymentStatus,
          rawStatus,
          paidAt,
          expiresAt,
        },
      })
    } else {
      // No transactionId — just create (no dedupe possible)
      await prisma.paymentTransaction.create({
        data: {
          userId,
          provider: 'blackpayments',
          providerTransactionId: null,
          amount: amount != null ? amount : null,
          paymentMethod: paymentMethod ?? null,
          status: paymentStatus,
          rawStatus,
          paidAt,
          expiresAt,
        },
      })
    }
    console.log(`[BlackPayments Webhook] PaymentTransaction saved: status=${paymentStatus}`)
  } catch (err: any) {
    console.error('[BlackPayments Webhook] Failed to save PaymentTransaction:', err.message)
    // Non-critical — do not rethrow
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    
    console.log('[BlackPayments Webhook] Received webhook request')

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      console.error('[BlackPayments Webhook] Invalid JSON. Body snippet:', rawBody.substring(0, 100))
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('[BlackPayments Webhook] Payload parsed successfully')

    const secret = payload.secret || req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.BLACKPAY_WEBHOOK_SECRET
    
    if (expectedSecret && secret) {
      if (secret !== expectedSecret) {
        console.error('[BlackPayments Webhook] Secret mismatch - rejecting webhook')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      console.log('[BlackPayments Webhook] Secret validated successfully')
    } else if (expectedSecret && !secret) {
      console.warn('[BlackPayments Webhook] Expected secret but none provided - accepting based on payload validation')
    } else if (!expectedSecret) {
      console.log('[BlackPayments Webhook] BLACKPAY_WEBHOOK_SECRET not configured - validating by payload structure only')
    }

    const payloadStatus = payload.status || payload.data?.status
    if (!payloadStatus) {
      console.warn('[BlackPayments Webhook] No status field found in payload - treating as informational')
    }

    const status = (payloadStatus || '').toLowerCase()
    const email = payload.customer?.email || payload.data?.customer?.email || payload.email || payload.data?.email
    const transactionId = payload.id || payload.data?.id || payload.transactionId || payload.data?.transactionId
    
    // Amount: may come as cents (integer) or as float
    const rawAmount = payload.amount || payload.data?.amount || payload.value || payload.data?.value
    const amount = rawAmount != null ? Number(rawAmount) / 100 : null // convert cents to BRL

    const paymentMethod = payload.paymentMethod || payload.data?.paymentMethod || 
                          payload.payment_method || payload.data?.payment_method || null
    
    let metadata = payload.metadata || payload.data?.metadata || {}
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata)
      } catch {
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

    // Find user
    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) console.log(`[BlackPayments Webhook] User found by ID: ${user.email}`)
    }
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } })
      if (user) console.log(`[BlackPayments Webhook] User found by email: ${user.email}`)
    }

    if (!user) {
      console.log(`[BlackPayments Webhook] User not found (email: ${email}, userId: ${userId}) - webhook acknowledged`)
      return NextResponse.json({ success: true, message: 'User not found in system, webhook acknowledged' }, { status: 200 })
    }

    const paymentStatus = mapToPaymentStatus(status)
    const isApproved = paymentStatus === PaymentStatus.ACTIVE
    const paidAt = isApproved ? new Date() : null
    const expiresAt = isApproved ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null

    let statusUpdated = false
    let newStatus: UserSubscriptionStatus | null = null

    if (isApproved) {
      newStatus = UserSubscriptionStatus.ACTIVE
      statusUpdated = true
      console.log(`[BlackPayments Webhook] Status "${status}" maps to ACTIVE - activating user`)
    } else if (status === 'waiting_payment' || status === 'pending') {
      console.log(`[BlackPayments Webhook] Status "${status}" is pending - NOT activating user yet`)
      newStatus = UserSubscriptionStatus.PENDING
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

    // Save PaymentTransaction (non-critical, runs regardless of user status change)
    await upsertPaymentTransaction({
      userId: user.id,
      providerTransactionId: transactionId || null,
      rawStatus: status || payloadStatus || 'unknown',
      paymentStatus,
      amount,
      paymentMethod,
      paidAt,
      expiresAt,
    })

    // Apply user status update if needed
    if (statusUpdated && newStatus) {
      try {
        if (newStatus === UserSubscriptionStatus.ACTIVE) {
          console.log(`[BlackPayments Webhook] Status is ACTIVE, activating user VIP access.`)
          await activateVipAccess({
            userId: user.id,
            transactionId: transactionId || undefined,
          })
        } else {
          const updateData: any = {
            subscriptionStatus: newStatus,
            billingProvider: 'blackpayments',
          }
          if (transactionId) updateData.caktoOrderId = transactionId

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })
          console.log(`[BlackPayments Webhook] User ${user.email} updated: subscriptionStatus=${newStatus}`)
        }
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
