import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

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

    // Check if subscription has expired (if subscriptionEndDate is set)
    let isExpired = false
    if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
      isExpired = true
    }

    // Check if user has access based on subscription status and role
    const isPaidActive = user.subscriptionStatus === 'ACTIVE'
    const isPrivileged = user.role === 'ADMIN' || user.role === 'COURTESY'
    const canAccess = (isPaidActive && !isExpired) || isPrivileged

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
        subscriptionEndDate: true,
        caktoOrderId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isExpired = user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)

    // If user already ACTIVE and NOT expired, no need to check BlackPayments/AbacatePay
    if (user.subscriptionStatus === 'ACTIVE' && !isExpired) {
      console.log(`[Subscription/Check] User ${user.email} is already ACTIVE and not expired`)
      
      // Fix session if it's out of sync
      if (session.subscriptionStatus !== 'ACTIVE') {
        const { setSession } = await import('@/lib/auth')
        session.subscriptionStatus = 'ACTIVE'
        await setSession(session)
      }
      
      return NextResponse.json({ ok: true, status: 'already_active', canAccess: true })
    }

    // Check transaction status from our DB using the latest transaction for the user
    console.log(`[Subscription/Check] Checking latest transaction status in DB for user: ${user.email}`)

    const tx = await prisma.paymentTransaction.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (!tx) {
      return NextResponse.json({
        ok: false,
        error: 'Nenhuma transação pendente encontrada',
        status: 'no_pending_transaction',
      })
    }

    const isOldTx = tx.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)

    if (isOldTx && isExpired) {
      // The user is expired and their last transaction is over 24h old.
      // Do not activate based on an old transaction.
      return NextResponse.json({
        ok: false,
        error: 'Nenhuma transação recente encontrada',
        status: 'no_pending_transaction',
        canAccess: false,
      })
    }

    const transactionStatus = tx.status.toLowerCase()

    console.log(`[Subscription/Check] Transaction status: ${transactionStatus}`)

    // If payment is approved, activate user
    if (['approved', 'paid', 'payment_confirmed', 'completed'].includes(transactionStatus)) {
      await activateVipAccess({
        userId: user.id,
        transactionId: tx.providerTransactionId || tx.id,
      })

      // Update session cookie!
      const { setSession } = await import('@/lib/auth')
      session.subscriptionStatus = 'ACTIVE'
      await setSession(session)

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
