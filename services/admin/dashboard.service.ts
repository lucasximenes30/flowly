import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { startOfDay, endOfDay, addDays } from 'date-fns'
import { UserPlan } from '@prisma/client'

export const getDashboardStats = cache(async () => {
  const [totalUsers, activeVip, activePro, activeProYearly, pendingPayments, expiredSubs, trialUsers, upgradeConversions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { plan: 'VIP', subscriptionStatus: 'ACTIVE' },
    }),
    prisma.user.count({
      where: { plan: 'PRO', subscriptionStatus: 'ACTIVE' },
    }),
    prisma.user.count({
      where: { plan: 'PRO_YEARLY', subscriptionStatus: 'ACTIVE' },
    }),
    prisma.user.count({
      where: {
        plan: { in: ['VIP', 'PRO', 'PRO_YEARLY'] },
        subscriptionStatus: { in: ['INACTIVE', 'PENDING'] },
      },
    }),
    prisma.user.count({
      where: {
        plan: { in: ['VIP', 'PRO', 'PRO_YEARLY'] },
        OR: [
          { subscriptionStatus: { in: ['PAST_DUE', 'CANCELED'] } },
          { subscriptionEndDate: { lt: new Date() } }
        ]
      },
    }),
    prisma.user.count({
      where: { plan: 'FREE_TRIAL' },
    }),
    prisma.user.count({
      where: { usedUpgradeOffer: true },
    }),
  ])

  return {
    totalUsers,
    activeVip,
    activePro,
    activeProYearly,
    pendingPayments,
    expiredSubs,
    trialUsers,
    upgradeConversions,
  }
})

export const getExpiringUsers = cache(async () => {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const in3DaysStart = startOfDay(addDays(now, 1))
  const in3DaysEnd = endOfDay(addDays(now, 3))

  const in7DaysStart = startOfDay(addDays(now, 4))
  const in7DaysEnd = endOfDay(addDays(now, 7))

  const baseWhere = {
    plan: { in: ['VIP', 'PRO', 'PRO_YEARLY'] as UserPlan[] },
    role: { notIn: ['ADMIN', 'COURTESY'] as any },
    subscriptionStatus: 'ACTIVE' as const,
  }

  const [today, in3Days, in7Days] = await Promise.all([
    prisma.user.findMany({
      where: {
        ...baseWhere,
        subscriptionExpiresAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        plan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
      orderBy: {
        subscriptionExpiresAt: 'asc',
      },
    }),
    prisma.user.findMany({
      where: {
        ...baseWhere,
        subscriptionExpiresAt: {
          gte: in3DaysStart,
          lte: in3DaysEnd,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        plan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
      orderBy: {
        subscriptionExpiresAt: 'asc',
      },
    }),
    prisma.user.findMany({
      where: {
        ...baseWhere,
        subscriptionExpiresAt: {
          gte: in7DaysStart,
          lte: in7DaysEnd,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        plan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
      orderBy: {
        subscriptionExpiresAt: 'asc',
      },
    }),
  ])

  return {
    today,
    in3Days,
    in7Days,
  }
})

export const getUsersGrowth = cache(async (days: number = 30) => {
  const now = new Date()
  const startDate = startOfDay(addDays(now, -days))

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const growthMap = new Map<string, number>()
  for (let i = days; i >= 0; i--) {
    const d = startOfDay(addDays(now, -i))
    const dateKey = d.toISOString().split('T')[0]
    growthMap.set(dateKey, 0)
  }

  users.forEach((u) => {
    const dateKey = u.createdAt.toISOString().split('T')[0]
    if (growthMap.has(dateKey)) {
      growthMap.set(dateKey, growthMap.get(dateKey)! + 1)
    }
  })

  return Array.from(growthMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))
})

export const getUsersDistribution = cache(async () => {
  const users = await prisma.user.findMany({
    select: { role: true, plan: true },
  })

    const dist = { VIP: 0, PRO: 0, PRO_YEARLY: 0, COURTESY: 0, ADMIN: 0, FREE: 0 }
  users.forEach((u) => {
    if (u.role === 'ADMIN') dist.ADMIN++
    else if (u.role === 'COURTESY') dist.COURTESY++
    else if (u.plan === 'VIP') dist.VIP++
    else if (u.plan === 'PRO') dist.PRO++
    else if (u.plan === 'PRO_YEARLY') dist.PRO_YEARLY++
    else dist.FREE++
  })

  return [
    { name: 'VIP', value: dist.VIP, color: '#3b82f6' }, // blue-500
    { name: 'PRO', value: dist.PRO, color: '#10b981' }, // emerald-500
    { name: 'PRO Anual', value: dist.PRO_YEARLY, color: '#f59e0b' }, // amber-500
    { name: 'Cortesia', value: dist.COURTESY, color: '#8b5cf6' }, // violet-500
    { name: 'Admin', value: dist.ADMIN, color: '#ef4444' }, // red-500
    { name: 'Free', value: dist.FREE, color: '#64748b' }, // slate-500
  ].filter((item) => item.value > 0)
})
