import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { BLACKPAY_CONFIG } from '@/services/blackpayments.service'
import { activateVipAccess } from '@/services/subscription.service'

const prisma = new PrismaClient()

/**
 * GET /api/subscription/status
 * Check current subscription status for the logged-in user.
 * Returns: { status, subscriptionStatus, canAccess, pendingTransactionId }
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        role: true,
        plan: true,
        billingApprovedAt: true,
        subscriptionEndDate: true,
        caktoOrderId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has access based on subscription status and role
    const isPaidActive = user.subscriptionStatus === 'ACTIVE'
    const isPrivileged = user.role === 'ADMIN' || user.role === 'COURTESY'
    const canAccess = isPaidActive || isPrivileged

    // Check if subscription has expired (if subscriptionEndDate is set)
    let isExpired = false
    if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
      isExpired = true
    }

    console.log('[Subscription/Status] User check:', {
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      role: user.role,
      isExpired,
      canAccess,
    })

    return NextResponse.json({
      ok: true,
      status: user.subscriptionStatus,
      role: user.role,
      plan: user.plan,
      canAccess,
      isExpired,
      billingApprovedAt: user.billingApprovedAt,
      subscriptionEndDate: user.subscriptionEndDate,
      pendingTransactionId: user.caktoOrderId,
    })
  } catch (err: any) {
    console.error('[Subscription/Status] Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/subscription/status
 * Check status of pending payment with BlackPayments.
 * If payment is approved, activate user.
 */
export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        caktoOrderId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user already ACTIVE, no need to check
    if (user.subscriptionStatus === 'ACTIVE') {
      console.log(`[Subscription/Check] User ${user.email} is already ACTIVE`)
      return NextResponse.json({ ok: true, status: 'already_active' })
    }

    // If no pending transaction, cannot check
    if (!user.caktoOrderId) {
      console.log(`[Subscription/Check] User ${user.email} has no pending transaction`)
      return NextResponse.json({
        ok: false,
        error: 'Nenhuma transação pendente encontrada',
        status: 'no_pending_transaction',
      })
    }

    // Check transaction status with BlackPayments API
    console.log(`[Subscription/Check] Checking transaction status: ${user.caktoOrderId}`)

    const authString = Buffer.from(
      `${BLACKPAY_CONFIG.publicKey}:${BLACKPAY_CONFIG.secretKey}`,
    ).toString('base64')

    // Find sale/transaction by ID (BlackPayments docs: /sales/:id or /transactions/:id are sometimes identical, prioritizing /sales)
    const checkResponse = await fetch(
      `${BLACKPAY_CONFIG.apiUrl}/sales/${user.caktoOrderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authString}`,
        },
      },
    )

    if (!checkResponse.ok) {
      console.error(`[Subscription/Check] BlackPayments API error: ${checkResponse.status}`)
      return NextResponse.json({
        ok: false,
        error: 'Não foi possível verificar o pagamento',
        status: 'api_error',
      })
    }

    const transactionData = await checkResponse.json()
    // Sometimes the status is inside data.status in BlackPayments responses
    const transactionStatus = (transactionData.status || transactionData.data?.status || 'unknown').toLowerCase()

    console.log(`[Subscription/Check] Transaction status: ${transactionStatus}`)

    // If payment is approved, activate user
    if (['approved', 'paid', 'payment_confirmed', 'completed'].includes(transactionStatus)) {
      await activateVipAccess({
        userId: user.id,
        transactionId: user.caktoOrderId,
      })

      console.log(`[Subscription/Check] User ${user.email} ACTIVATED`)

      return NextResponse.json({
        ok: true,
        status: 'approved',
        message: 'Pagamento confirmado! Seu acesso foi liberado.',
        canAccess: true,
      })
    }

    // If still waiting/pending, keep user blocked
    if (['waiting_payment', 'pending'].includes(transactionStatus)) {
      console.log(`[Subscription/Check] Transaction still ${transactionStatus} for user ${user.email}`)
      return NextResponse.json({
        ok: true,
        status: 'pending',
        message: 'Pagamento ainda não confirmado. Verifique novamente em alguns instantes.',
        canAccess: false,
      })
    }

    // Payment failed or expired
    return NextResponse.json({
      ok: false,
      status: transactionStatus,
      message: `O status do pagamento é: ${transactionStatus}.`,
      canAccess: false,
    })
  } catch (err: any) {
    console.error('[Subscription/Check] Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
