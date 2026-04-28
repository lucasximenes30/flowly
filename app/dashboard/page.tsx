import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTransactionsByUser, getUserBalance, getMonthlySummary } from '@/services/transaction.service'
import { getCardsByUser } from '@/services/card.service'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard',
}

function serializeData(transactions: any[], balance: any, monthly: any) {
  const serializedTransactions = transactions.map((t) => ({
    id: t.id,
    title: t.title,
    amount: t.amount.toString(),
    installmentAmount: t.installmentAmount ? Number(t.installmentAmount) : undefined,
    type: t.type,
    category: t.category,
    date: t.date.toISOString(),
    isInstallment: t.isInstallment,
    totalInstallments: t.totalInstallments,
    purchaseDate: t.purchaseDate?.toISOString(),
    dueDay: t.dueDay,
    isRecurring: t.isRecurring,
    recurringDay: t.recurringDay,
    isActive: t.isActive,
    endDate: t.endDate?.toISOString(),
    cardId: t.cardId ?? undefined,
  }))

  return {
    transactions: serializedTransactions,
    balance: {
      income: Number(balance.income),
      expense: Number(balance.expense),
      balance: Number(balance.balance),
    },
    monthly: {
      income: Number(monthly.income),
      expense: Number(monthly.expense),
      balance: Number(monthly.balance),
      transactionCount: monthly.transactionCount,
    },
  }
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
    },
  })

  if (!user) redirect('/login')

  // Check if subscription has expired
  const isPaidActive = user.subscriptionStatus === 'ACTIVE'
  const isPrivileged = user.role === 'ADMIN' || user.role === 'COURTESY' || user.role === 'LEGACY'
  const isExpired = user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)

  // Redirect if inactive or if VIP access expired
  if (!isPaidActive || (user.subscriptionStatus === 'ACTIVE' && isExpired)) {
    if (!isPrivileged) {
      redirect('/login?error=inactive')
    }
  }

  const [transactions, balance, monthly, cards] = await Promise.all([
    getTransactionsByUser(session.userId),
    getUserBalance(session.userId),
    getMonthlySummary(session.userId),
    getCardsByUser(session.userId),
  ])

  const data = serializeData(transactions, balance, monthly)

  return (
    <DashboardClient
      session={session}
      transactions={data.transactions}
      balance={data.balance}
      monthly={data.monthly}
      cards={cards}
    />
  )
}
