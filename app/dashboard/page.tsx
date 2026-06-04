import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUserBalance } from '@/services/transaction.service'
import { getHabitsByUser } from '@/services/habit.service'
import { getActiveWorkoutPlanByUser } from '@/services/workoutPlan.service'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Painel Central',
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Check subscription status and expiration
  const prisma = require('@/lib/prisma').prisma || new (require('@prisma/client').PrismaClient)()
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      subscriptionStatus: true,
      subscriptionEndDate: true,
      role: true,
      plan: true,
      createdAt: true,
      subscriptionExpiresAt: true,
      canUseGoals: true,
      canUseNotes: true,
      canUseAgenda: true,
    },
  })

  if (!user) redirect('/login')

  // Check if subscription has expired
  const isPaidActive = user.subscriptionStatus === 'ACTIVE'
  const isPrivileged = user.role === 'ADMIN' || user.role === 'COURTESY'
  const isTrial = user.plan === 'FREE_TRIAL'
  
  let isExpired = false;
  if (isTrial) {
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    if (user.subscriptionExpiresAt) {
      if (now > new Date(user.subscriptionExpiresAt).getTime()) isExpired = true;
    } else if (user.createdAt) {
      if (now > new Date(user.createdAt).getTime() + oneDayInMs) isExpired = true;
    }
  } else {
    isExpired = user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)
  }

  // Redirect if inactive or if VIP access expired
  if ((!isPaidActive && !isTrial) || (user.subscriptionStatus === 'ACTIVE' && isExpired) || (isTrial && isExpired)) {
    if (!isPrivileged) {
      redirect('/login?error=inactive')
    }
  }

  // Fetch unified stats in parallel
  const [balance, habits, workoutPlan] = await Promise.all([
    getUserBalance(session.userId).catch(() => ({ income: 0, expense: 0, balance: 0 })),
    getHabitsByUser(session.userId).catch(() => []),
    getActiveWorkoutPlanByUser(session.userId).catch(() => null),
  ])

  return (
    <DashboardClient
      session={{
        ...session,
        plan: user.plan,
        createdAt: user.createdAt?.toISOString() || null,
        subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() || null,
        canUseGoals: user.canUseGoals,
        canUseNotes: user.canUseNotes,
        canUseAgenda: user.canUseAgenda,
      }}
      balance={{
        income: Number(balance.income),
        expense: Number(balance.expense),
        balance: Number(balance.balance),
      }}
      habitsCount={habits.length}
      activeWorkoutPlanName={workoutPlan?.name || null}
    />
  )
}
