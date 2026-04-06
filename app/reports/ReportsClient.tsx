'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/i18n'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

interface Session { userId: string; email: string; name: string }
interface Balance { income: number; expense: number; balance: number }
interface Monthly { income: number; expense: number; balance: number; transactionCount: number }
interface Comparison {
  current: { year: number; month: number; income: number; expense: number; balance: number }
  previous: { year: number; month: number; income: number; expense: number; balance: number }
  comparison: { incomeChange: number; expenseChange: number; balanceChange: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f43f5e',
  Transport: '#f59e0b',
  Entertainment: '#8b5cf6',
  Shopping: '#ec4899',
  Bills: '#3b82f6',
  Health: '#10b981',
  General: '#6b7280',
  Salary: '#22c55e',
  Freelance: '#06b6d4',
  Investment: '#a855f7',
  Other: '#94a3b8',
  Alimentação: '#f43f5e',
  Transporte: '#f59e0b',
  Lazer: '#8b5cf6',
  Compras: '#ec4899',
  Contas: '#3b82f6',
  Saúde: '#10b981',
  Geral: '#6b7280',
  Salário: '#22c55e',
  Investimento: '#a855f7',
  Outro: '#94a3b8',
}

const CATEGORY_COLORS_LIGHT: Record<string, string> = {
  Food: '#fb7185',
  Transport: '#fbbf24',
  Entertainment: '#a78bfa',
  Shopping: '#f472b6',
  Bills: '#60a5fa',
  Health: '#34d399',
  General: '#9ca3af',
  Salary: '#4ade80',
  Freelance: '#22d3ee',
  Investment: '#c084fc',
  Other: '#cbd5e1',
  Alimentação: '#fb7185',
  Transporte: '#fbbf24',
  Lazer: '#a78bfa',
  Compras: '#f472b6',
  Contas: '#60a5fa',
  Saúde: '#34d399',
  Geral: '#9ca3af',
  Salário: '#4ade80',
  Investimento: '#c084fc',
  Outro: '#cbd5e1',
}

type Insights = { text: string; type: 'positive' | 'negative' | 'neutral' }[]

function generateInsights(
  categories: { category: string; amount: number }[],
  comparison: Comparison,
  t: (key: string) => string,
  formatCurrency: (value: number) => string,
): Insights {
  const insights: Insights = []

  if (categories.length > 0) {
    const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0)
    const topCategory = categories[0]
    const percentage = totalExpenses > 0 ? ((topCategory.amount / totalExpenses) * 100).toFixed(0) : '0'
    insights.push({
      text: `${t(`category.${topCategory.category}`) ?? topCategory.category} representa ${percentage}% dos seus gastos`,
      type: 'neutral',
    })
  }

  if (comparison.comparison.balanceChange >= 0) {
    insights.push({ text: `Seu saldo aumentou ${formatCurrency(Math.abs(comparison.comparison.balanceChange))} em relação ao mês anterior`, type: 'positive' })
  } else {
    insights.push({ text: `Seu saldo diminuiu ${formatCurrency(Math.abs(comparison.comparison.balanceChange))} em relação ao mês anterior`, type: 'negative' })
  }

  if (comparison.comparison.expenseChange > 0) {
    insights.push({ text: `Suas despesas aumentaram ${formatCurrency(comparison.comparison.expenseChange)} em relação ao mês anterior`, type: 'negative' })
  } else if (comparison.comparison.expenseChange < 0) {
    insights.push({ text: `Você reduziu ${formatCurrency(Math.abs(comparison.comparison.expenseChange))} nas despesas em relação ao mês anterior`, type: 'positive' })
  }

  if (comparison.comparison.incomeChange > 0) {
    insights.push({ text: `Sua receita aumentou ${formatCurrency(comparison.comparison.incomeChange)} em relação ao mês anterior`, type: 'positive' })
  }

  if (categories.length >= 2) {
    const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0)
    const top2 = categories.slice(0, 2).reduce((sum, c) => sum + c.amount, 0)
    const pct = totalExpenses > 0 ? ((top2 / totalExpenses) * 100).toFixed(0) : '0'
    insights.push({ text: `As 2 maiores categorias representam ${pct}% do total de gastos`, type: 'neutral' })
  }

  return insights
}

export default function ReportsClient({
  session, balance, monthly, comparison,
}: {
  session: Session
  balance: Balance
  monthly: Monthly
  comparison: Comparison
}) {
  const router = useRouter()
  const { t, locale } = useApp()

  const isBRL = locale === 'pt-BR'

  // Rate
  const [rate, setRate] = useState(5.5)
  const [rateLoading, setRateLoading] = useState(true)

  useEffect(() => {
    setRateLoading(true)
    setRateError(false)
    getExchangeRate().then((r) => { setRate(r); setRateLoading(false) }).catch(() => { setRateError(true); setRateLoading(false) })
  }, [locale])

  const [rateError, setRateError] = useState(false)

  const formatCurrency = useCallback((value: number) => {
    if (isBRL) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    const usd = value / rate
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd)
  }, [isBRL, rate])

  const formatDate = (dateStr: string) => {
    const loc = isBRL ? 'pt-BR' : 'en-US'
    return new Date(dateStr).toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Month selector
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  useEffect(() => {
    const loadMonths = async () => {
      const res = await fetch('/api/transactions/monthly?type=available')
      if (res.ok) {
        const data = await res.json()
        setAvailableMonths(data.months)
        const now = new Date()
        const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        setSelectedMonth(data.months.includes(cur) ? cur : data.months[0] || cur)
      }
    }
    loadMonths()
  }, [])

  // Chart data
  const [categoryData, setCategoryData] = useState<{ category: string; amount: number }[]>([])
  const [trendData, setTrendData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [chartsLoading, setChartsLoading] = useState(false)

  useEffect(() => {
    if (!selectedMonth) return
    setChartsLoading(true)
    const [year, month] = selectedMonth.split('-').map(Number)

    Promise.all([
      fetch(`/api/transactions/monthly?type=categories&year=${year}&month=${month}`).then(async (r) => r.ok ? r.json() : { categories: [] }),
      fetch('/api/transactions/monthly?type=trend').then(async (r) => r.ok ? r.json() : { trend: [] }),
    ]).then(([catData, trendDataResp]) => {
      setCategoryData(catData.categories || [])
      setTrendData(trendDataResp.trend || [])
      setChartsLoading(false)
    })
  }, [selectedMonth])

  // Monthly summary for selected month
  const [monthlySummary, setMonthlySummary] = useState<{ income: number; expense: number; balance: number; transactionCount: number } | null>(null)

  useEffect(() => {
    if (!selectedMonth) return
    const [year, month] = selectedMonth.split('-').map(Number)
    fetch(`/api/transactions/monthly?type=summary&year=${year}&month=${month}`)
      .then(async (r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.summary) {
          setMonthlySummary({
            income: Number(data.summary.income),
            expense: Number(data.summary.expense),
            balance: Number(data.summary.balance),
            transactionCount: data.summary.transactionCount,
          })
        }
      })
  }, [selectedMonth])

  const getMonthName = (monthNumber: number): string => {
    const keys = ['month.january','month.february','month.march','month.april','month.may','month.june','month.july','month.august','month.september','month.october','month.november','month.december']
    return t(keys[monthNumber - 1])
  }

  const insights = useMemo(() => {
    const comp = comparison ?? {
      current: { year: 0, month: 0, income: 0, expense: 0, balance: 0 },
      previous: { year: 0, month: 0, income: 0, expense: 0, balance: 0 },
      comparison: { incomeChange: 0, expenseChange: 0, balanceChange: 0 },
    }
    return generateInsights(categoryData, comp, t, formatCurrency)
  }, [categoryData, comparison, t, formatCurrency])

  const displaySummary = monthlySummary ?? monthly

  const pieColors = isBRL ? CATEGORY_COLORS : CATEGORY_COLORS_LIGHT

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300 reports-page-enter">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
              title={isBRL ? 'Voltar ao Dashboard' : 'Back to Dashboard'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">Flowly</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              {isBRL ? `Olá` : `Hi`}, {session.name}
            </span>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium"
            >
              {isBRL ? 'Dashboard' : 'Dashboard'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Title + Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {isBRL ? 'Relatórios Financeiros' : 'Financial Reports'}
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              {isBRL ? 'Análise mensal dos seus gastos' : 'Monthly analysis of your expenses'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Month Filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field w-48"
            >
              {availableMonths.length === 0 && <option value={selectedMonth}>{selectedMonth}</option>}
              {availableMonths.map((m) => {
                const [y, mo] = m.split('-').map(Number)
                return <option key={m} value={m}>{getMonthName(mo)} {y}</option>
              })}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-xs/5 font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              {isBRL ? 'Receita' : 'Income'}
            </p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              +{formatCurrency(displaySummary.income)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs/5 font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              {isBRL ? 'Despesas' : 'Expenses'}
            </p>
            <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400 mt-2">
              -{formatCurrency(displaySummary.expense)}
            </p>
          </div>
          <div className="card">
            <p className="text-xs/5 font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              {isBRL ? 'Saldo' : 'Balance'}
            </p>
            <p className={`text-2xl font-semibold mt-2 ${displaySummary.balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(displaySummary.balance)}
            </p>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {isBRL ? 'Insights' : 'Insights'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    insight.type === 'positive'
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40'
                      : insight.type === 'negative'
                      ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/40'
                      : 'bg-surface-50 border-surface-200 dark:bg-surface-800/50 dark:border-surface-700/60'
                  }`}
                >
                  <div className="mt-0.5">
                    {insight.type === 'positive' ? (
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : insight.type === 'negative' ? (
                      <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-surface-500 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm ${
                    insight.type === 'positive'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : insight.type === 'negative'
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-surface-700 dark:text-surface-300'
                  }`}>
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        {chartsLoading ? (
          <div className="card flex items-center justify-center py-16">
            <svg className="w-8 h-8 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
              <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
            </svg>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Donut */}
              <div className="card">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  {isBRL ? 'Despesas por Categoria' : 'Expenses by Category'}
                </h2>
                {categoryData.length === 0 ? (
                  <div className="py-12 text-center text-sm text-surface-400 dark:text-surface-500">
                    {isBRL ? 'Nenhuma despesa neste mês' : 'No expenses this month'}
                  </div>
                ) : (
                  <>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={3}
                            strokeWidth={0}
                          >
                            {categoryData.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={pieColors[entry.category] || pieColors['Other']} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: isBRL ? '#16171d' : '#fff',
                              border: 'none',
                              borderRadius: '12px',
                              color: isBRL ? '#f1f3f7' : '#16171d',
                              fontSize: '13px',
                            }}
                            wrapperStyle={{ outline: 'none' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                      {categoryData.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[item.category] || pieColors['Other'] }} />
                          <span className="text-xs text-surface-600 dark:text-surface-400">
                            {t(`category.${item.category}`) ?? item.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Trend Bar Chart */}
              <div className="card">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  {isBRL ? 'Receitas vs Despesas' : 'Income vs Expenses'}
                </h2>
                {trendData.length === 0 || trendData.every(d => d.income === 0 && d.expense === 0) ? (
                  <div className="py-12 text-center text-sm text-surface-400 dark:text-surface-500">
                    {isBRL ? 'Sem dados suficientes' : 'Not enough data'}
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isBRL ? '#282a32' : '#e2e5ed'} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: isBRL ? '#8f93a1' : '#7a7d8b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: isBRL ? '#8f93a1' : '#7a7d8b' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: isBRL ? '#16171d' : '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            color: isBRL ? '#f1f3f7' : '#16171d',
                            fontSize: '13px',
                          }}
                          wrapperStyle={{ outline: 'none' }}
                        />
                        <Bar
                          dataKey="income"
                          name={isBRL ? 'Receita' : 'Income'}
                          fill="#22c55e"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="expense"
                          name={isBRL ? 'Despesa' : 'Expense'}
                          fill="#f43f5e"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="card bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 border border-brand-200/50 dark:border-brand-800/30">
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-5">
                {isBRL ? 'Comparação Mensal' : 'Monthly Comparison'}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Income Change */}
                <div className="p-4 rounded-xl bg-white/50 dark:bg-surface-900/30">
                  <p className="text-xs text-surface-600 dark:text-surface-400 mb-1">
                    {isBRL ? 'Variação de Receita' : 'Income Change'}
                  </p>
                  <p className={`text-lg font-semibold ${
                    comparison.comparison.incomeChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {comparison.comparison.incomeChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(comparison.comparison.incomeChange))}
                  </p>
                </div>
                {/* Expense Change */}
                <div className="p-4 rounded-xl bg-white/50 dark:bg-surface-900/30">
                  <p className="text-xs text-surface-600 dark:text-surface-400 mb-1">
                    {isBRL ? 'Variação de Despesa' : 'Expense Change'}
                  </p>
                  <p className={`text-lg font-semibold ${
                    comparison.comparison.expenseChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {comparison.comparison.expenseChange <= 0 ? '-' : '+'}{formatCurrency(Math.abs(comparison.comparison.expenseChange))}
                  </p>
                </div>
                {/* Balance Change */}
                <div className="p-4 rounded-xl bg-white/50 dark:bg-surface-900/30">
                  <p className="text-xs text-surface-600 dark:text-surface-400 mb-1">
                    {isBRL ? 'Variação de Saldo' : 'Balance Change'}
                  </p>
                  <p className={`text-lg font-semibold ${
                    comparison.comparison.balanceChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {comparison.comparison.balanceChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(comparison.comparison.balanceChange))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

const cacheKey = 'flowly_exchange_rate'
const cacheTimeKey = 'flowly_exchange_rate_time'
let cachedRate: { value: number; time: number } | null = null

async function getExchangeRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.time < 5 * 60 * 1000) return cachedRate.value
  try {
    const res = await fetch('https://v6.exchangerate-api.com/v6/latest/USD')
    const data = await res.json()
    const rate = Number(data.conversion_rates?.BRL)
    if (rate > 0) { cachedRate = { value: rate, time: Date.now() }; return rate }
  } catch { /* fallback */ }
  return cachedRate?.value ?? 5.5
}
