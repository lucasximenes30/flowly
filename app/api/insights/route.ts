import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getMonthSummary, getMonthComparison, getExpensesByCategory, getMonthlyTrend } from '@/services/transaction.service'
import { generateAIInsights } from '@/services/insights.service'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let requestData = {}
  try {
    requestData = await request.json()
  } catch (e) {}

  const language = (requestData as any).language || 'pt-BR'

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const prevMonthDate = new Date(year, month - 2, 1)
  const prevYear = prevMonthDate.getFullYear()
  const prevMonth = prevMonthDate.getMonth() + 1

  const [currentSummary, previousSummary, categoryData, trendData] = await Promise.all([
    getMonthSummary(session.userId, year, month),
    getMonthSummary(session.userId, prevYear, prevMonth),
    getExpensesByCategory(session.userId, year, month),
    getMonthlyTrend(session.userId),
  ])

  try {
    const insights = await generateAIInsights({
      monthlyIncome: currentSummary.income,
      monthlyExpense: currentSummary.expense,
      monthlyBalance: currentSummary.balance,
      topCategories: categoryData,
      previousIncome: previousSummary.income,
      previousExpense: previousSummary.expense,
      previousBalance: previousSummary.balance,
      trend: trendData,
      language: language as string,
    })

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('[Insights API] Failed to generate insights:', error)
    const errorMessage =
      language === 'pt-BR'
        ? 'A geração de insights está temporariamente indisponível. Tente novamente em instantes.'
        : 'Insights generation is temporarily unavailable. Please try again shortly.'

    return NextResponse.json({ error: errorMessage }, { status: 503 })
  }
}
