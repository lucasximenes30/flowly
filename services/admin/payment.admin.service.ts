import { prisma } from '@/lib/prisma'
import { cache } from 'react'
type PaymentStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'EXPIRED' | 'CANCELED'
const PaymentStatus = {
  PENDING: 'PENDING' as PaymentStatus,
  ACTIVE: 'ACTIVE' as PaymentStatus,
  FAILED: 'FAILED' as PaymentStatus,
  EXPIRED: 'EXPIRED' as PaymentStatus,
  CANCELED: 'CANCELED' as PaymentStatus,
}
import { startOfMonth, endOfMonth } from 'date-fns'

// Price per VIP slot used as fallback for estimated revenue when payment history is sparse
const PLAN_PRICE_CENTS = 4700 // R$ 47,00

export const getPaymentTransactions = cache(async ({
  userId,
  status,
  limit = 50,
  offset = 0,
}: {
  userId?: string
  status?: PaymentStatus
  limit?: number
  offset?: number
} = {}) => {
  const where: any = {}
  if (userId) where.userId = userId
  if (status) where.status = status

  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        provider: true,
        providerTransactionId: true,
        amount: true,
        paymentMethod: true,
        status: true,
        rawStatus: true,
        paidAt: true,
        expiresAt: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.paymentTransaction.count({ where }),
  ])

  return { transactions, total }
})

export const getPaymentTransactionsByUser = cache(async (userId: string) => {
  return prisma.paymentTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      provider: true,
      providerTransactionId: true,
      amount: true,
      paymentMethod: true,
      status: true,
      rawStatus: true,
      paidAt: true,
      expiresAt: true,
      createdAt: true,
    },
  })
})

export const getDashboardPaymentStats = cache(async () => {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [monthlyApproved, pendingCount, approvedCount, activeVipCount, activeProCount, activeProYearlyCount] =
    await Promise.all([
      // Sum of ACTIVE payments this month (real revenue)
      prisma.paymentTransaction.findMany({
        where: {
          status: PaymentStatus.ACTIVE,
          paidAt: { gte: monthStart, lte: monthEnd },
        },
        select: { amount: true },
      }),
      // Total PENDING transactions
      prisma.paymentTransaction.count({
        where: { status: PaymentStatus.PENDING },
      }),
      // ACTIVE transactions this month (count)
      prisma.paymentTransaction.count({
        where: {
          status: PaymentStatus.ACTIVE,
          paidAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      // VIP users count for estimated revenue fallback
      prisma.user.count({
        where: { plan: 'VIP', subscriptionStatus: 'ACTIVE', role: { notIn: ['ADMIN', 'COURTESY'] } },
      }),
      // PRO users count for estimated revenue fallback
      prisma.user.count({
        where: { plan: 'PRO', subscriptionStatus: 'ACTIVE', role: { notIn: ['ADMIN', 'COURTESY'] } },
      }),
      // PRO_YEARLY users count for estimated revenue fallback
      prisma.user.count({
        where: { plan: 'PRO_YEARLY', subscriptionStatus: 'ACTIVE', role: { notIn: ['ADMIN', 'COURTESY'] } },
      }),
    ])

  // Sum real payments
  const realRevenueCents = monthlyApproved.reduce((sum, tx) => {
    return sum + Math.round(Number(tx.amount ?? 0) * 100)
  }, 0)

  // Decide if revenue is real or estimated
  const isEstimated = monthlyApproved.length === 0
  const revenueCents = isEstimated
    ? (activeVipCount * 1990) + (activeProCount * 2990) + (activeProYearlyCount * 1999)
    : realRevenueCents

  return {
    monthlyRevenueCents: revenueCents,
    monthlyRevenueFormatted: (revenueCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    isEstimated,
    pendingCount,
    approvedCount,
  }
})
