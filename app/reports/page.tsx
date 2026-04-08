import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUserBalance, getMonthSummary, getMonthComparison } from '@/services/transaction.service'
import ReportsClient from './ReportsClient'

function serializeData(balance: any, monthly: any, comparison: any) {
  return {
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
    comparison: {
      ...comparison,
      current: { ...comparison.current, income: Number(comparison.current.income), expense: Number(comparison.current.expense), balance: Number(comparison.current.balance) },
      previous: { ...comparison.previous, income: Number(comparison.previous.income), expense: Number(comparison.previous.expense), balance: Number(comparison.previous.balance) },
    },
  }
}

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const now = new Date()
  const [balance, monthly, comparison] = await Promise.all([
    getUserBalance(session.userId),
    getMonthSummary(session.userId, now.getFullYear(), now.getMonth() + 1),
    getMonthComparison(session.userId, now.getFullYear(), now.getMonth() + 1),
  ])

  const data = serializeData(balance, monthly, comparison)

  return (
    <ReportsClient
      session={session}
      balance={data.balance}
      monthly={data.monthly}
      comparison={data.comparison}
    />
  )
}
