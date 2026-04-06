import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getTransactionsByMonth,
  getMonthSummary,
  getMonthComparison,
  getAvailableMonths,
  getExpensesByCategory,
  getMonthlyTrend,
} from '@/services/transaction.service'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') // 'summary', 'transactions', 'comparison', 'available'
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  try {
    if (type === 'transactions' && year && month) {
      const transactions = await getTransactionsByMonth(
        session.userId,
        parseInt(year),
        parseInt(month)
      )
      return NextResponse.json({ transactions })
    }

    if (type === 'summary' && year && month) {
      const summary = await getMonthSummary(
        session.userId,
        parseInt(year),
        parseInt(month)
      )
      return NextResponse.json({ summary })
    }

    if (type === 'comparison') {
      const comparison = await getMonthComparison(session.userId)
      return NextResponse.json(comparison)
    }

    if (type === 'available') {
      const months = await getAvailableMonths(session.userId)
      return NextResponse.json({ months })
    }

    if (type === 'categories' && year && month) {
      const categories = await getExpensesByCategory(
        session.userId,
        parseInt(year),
        parseInt(month)
      )
      return NextResponse.json({ categories })
    }

    if (type === 'trend') {
      const trend = await getMonthlyTrend(session.userId)
      return NextResponse.json({ trend })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error in monthly route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monthly data' },
      { status: 500 }
    )
  }
}
