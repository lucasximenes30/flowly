import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTransactionsByUser, getUserBalance, getMonthlySummary } from '@/services/transaction.service'
import DashboardClient from './DashboardClient'

function serializeData(transactions: any[], balance: any, monthly: any) {
  const serializedTransactions = transactions.map((t) => ({
    id: t.id,
    title: t.title,
    amount: t.amount.toString(),
    type: t.type,
    category: t.category,
    date: t.date.toISOString(),
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

  const [transactions, balance, monthly] = await Promise.all([
    getTransactionsByUser(session.userId),
    getUserBalance(session.userId),
    getMonthlySummary(session.userId),
  ])

  const data = serializeData(transactions, balance, monthly)

  return (
    <DashboardClient
      session={session}
      transactions={data.transactions}
      balance={data.balance}
      monthly={data.monthly}
    />
  )
}
