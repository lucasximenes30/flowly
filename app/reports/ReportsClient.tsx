'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/i18n'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import AdvancedReports from '@/components/AdvancedReports'

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

type AIInsight = { text: string; type: 'positive' | 'negative' | 'tip' }
type StaticInsight = { text: string; type: 'positive' | 'negative' | 'tip' }

function generateStaticFallbackInsights(
  categories: { category: string; amount: number }[],
  comparison: Comparison,
  formatCurrency: (value: number) => string,
): StaticInsight[] {
  const insights: StaticInsight[] = []

  if (categories.length > 0) {
    const total = categories.reduce((s, c) => s + c.amount, 0)
    const top = categories[0]
    const pct = total > 0 ? ((top.amount / total) * 100).toFixed(0) : '0'
    insights.push({ text: `${top.category} representa ${pct}% dos seus gastos`, type: 'tip' })
  }

  const balChange = comparison.comparison.balanceChange
  if (balChange >= 0) {
    insights.push({ text: `Seu saldo aumentou ${formatCurrency(Math.abs(balChange))} em relação ao mês anterior`, type: 'positive' })
  } else {
    insights.push({ text: `Seu saldo diminuiu ${formatCurrency(Math.abs(balChange))} em relação ao mês anterior`, type: 'negative' })
  }

  if (comparison.comparison.expenseChange > 0) {
    insights.push({ text: `Suas despesas aumentaram ${formatCurrency(comparison.comparison.expenseChange)} em relação ao mês anterior`, type: 'negative' })
  } else if (comparison.comparison.expenseChange < 0) {
    insights.push({ text: `Você reduziu ${formatCurrency(Math.abs(comparison.comparison.expenseChange))} nas despesas em relação ao mês anterior`, type: 'positive' })
  }

  if (comparison.comparison.incomeChange > 0) {
    insights.push({ text: `Sua receita aumentou ${formatCurrency(comparison.comparison.incomeChange)} em relação ao mês anterior`, type: 'positive' })
  }

  return insights.slice(0, 5)
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

  // Update Document Title Dynamically
  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number)
      document.title = `${getMonthName(month)} ${year} | ${t('reports.title')} | Flowly`
    } else {
      document.title = `${t('reports.title')} | Flowly`
    }
  }, [selectedMonth, t])

  // AI Insights
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)

  useEffect(() => {
    if (!selectedMonth) return
    setInsightsLoading(true)
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: locale }),
    })
      .then(async (r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.insights) setAiInsights(data.insights)
        else setAiInsights(generateStaticFallbackInsights(categoryData, comparison, formatCurrency))
        setInsightsLoading(false)
      })
      .catch(() => {
        setAiInsights(generateStaticFallbackInsights(categoryData, comparison, formatCurrency))
        setInsightsLoading(false)
      })
  }, [selectedMonth])

  const displaySummary = monthlySummary ?? monthly

  const pieColors = isBRL ? CATEGORY_COLORS : CATEGORY_COLORS_LIGHT

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300 reports-page-enter">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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
            <span className="hidden sm:inline text-sm text-surface-500 dark:text-surface-400">
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

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Title + Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
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
              className="input-field w-full sm:w-52 py-2.5 transition-all duration-200 focus:ring-brand-500/30"
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="card group relative overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-surface-200 dark:hover:border-surface-700">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                {isBRL ? 'Receita' : 'Income'}
              </p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(displaySummary.income)}
              </p>
            </div>
          </div>
          <div className="card group relative overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-surface-200 dark:hover:border-surface-700">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-900/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                {isBRL ? 'Despesas' : 'Expenses'}
              </p>
              <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
                -{formatCurrency(displaySummary.expense)}
              </p>
            </div>
          </div>
          <div className="card group relative overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:border-surface-200 dark:hover:border-surface-700">
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity pointer-events-none opacity-0 group-hover:opacity-100 ${displaySummary.balance >= 0 ? 'from-brand-50/50 to-transparent dark:from-brand-900/10' : 'from-rose-50/50 to-transparent dark:from-rose-900/10'}`} />
            <div className="relative">
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                {isBRL ? 'Saldo' : 'Balance'}
              </p>
              <p className={`text-2xl font-semibold ${displaySummary.balance >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(displaySummary.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="card">
          <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>{isBRL ? 'Insights com IA' : 'AI Insights'}</span>
            {insightsLoading && (
              <svg className="w-4 h-4 text-surface-400 animate-spin ml-auto shrink-0" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
              </svg>
            )}
          </h2>
          {aiInsights.length === 0 && !insightsLoading ? (
            <div className="py-8 text-center text-sm text-surface-400 dark:text-surface-500">
              {isBRL ? 'Adicione transações para receber insights' : 'Add transactions to receive insights'}
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    insight.type === 'positive'
                      ? 'bg-emerald-50/80 border-emerald-200/70 dark:bg-emerald-900/20 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/25 hover:shadow-sm'
                      : insight.type === 'negative'
                      ? 'bg-rose-50/80 border-rose-200/70 dark:bg-rose-900/20 dark:border-rose-800/50 hover:bg-rose-50 dark:hover:bg-rose-900/25 hover:shadow-sm'
                      : 'bg-violet-50/80 border-violet-200/70 dark:bg-violet-900/20 dark:border-violet-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/25 hover:shadow-sm'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.type === 'positive' ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    ) : insight.type === 'negative' ? (
                      <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-800/40 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-800/40 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    insight.type === 'positive'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : insight.type === 'negative'
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-violet-700 dark:text-violet-300'
                  }`}>
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

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
              <div className="card relative overflow-hidden transition-all duration-200">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  {isBRL ? 'Despesas por Categoria' : 'Expenses by Category'}
                </h2>
                {categoryData.length === 0 ? (
                  <div className="py-14 text-center text-sm text-surface-400 dark:text-surface-500">
                    {isBRL ? 'Nenhuma despesa neste mês' : 'No expenses this month'}
                  </div>
                ) : (
                  <>
                    <div style={{ width: '100%', height: 260 }} className="opacity-100 animate-fade-in mb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={2.5}
                            strokeWidth={0}
                          >
                            {categoryData.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={pieColors[entry.category] || pieColors['Other']} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value, name) => [formatCurrency(Number(value)), t(`category.${name}`) ?? name]}
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
                    
                    <div className="flex flex-col gap-2 mt-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {categoryData.map((item, i) => {
                        const total = categoryData.reduce((acc, curr) => acc + curr.amount, 0);
                        const percent = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0';
                        return (
                          <div key={i} className="flex flex-row items-center justify-between gap-3 text-sm p-2 rounded-lg bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="h-3 w-3 rounded-full ring-2 ring-transparent ring-offset-1 dark:ring-offset-surface-900 flex-shrink-0" style={{ backgroundColor: pieColors[item.category] || pieColors['Other'], ringColor: pieColors[item.category] || pieColors['Other'] }} />
                              <span className="text-surface-700 dark:text-surface-300 font-medium truncate" title={t(`category.${item.category}`) ?? item.category}>
                                {t(`category.${item.category}`) ?? item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-surface-500 dark:text-surface-400 font-medium">{percent}%</span>
                              <span className="text-surface-900 dark:text-surface-100 font-semibold text-right min-w-[70px]">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Trend Bar Chart */}
              <div className="card relative overflow-hidden transition-all duration-200">
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  {isBRL ? 'Receitas vs Despesas' : 'Income vs Expenses'}
                </h2>
                {trendData.length === 0 || trendData.every(d => d.income === 0 && d.expense === 0) ? (
                  <div className="py-14 text-center text-sm text-surface-400 dark:text-surface-500">
                    {isBRL ? 'Sem dados suficientes' : 'Not enough data'}
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 280 }} className="opacity-100 animate-fade-in">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-surface-200 dark:text-surface-700/60" />
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
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            backgroundColor: isBRL ? '#16171d' : '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            color: isBRL ? '#f1f3f7' : '#16171d',
                            fontSize: '13px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
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
            <div className="card relative overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100/40 dark:from-brand-900/20 dark:to-brand-800/8 border-brand-200/50 dark:border-brand-800/30 transition-all duration-200 hover:shadow-card-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
              <div className="relative">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-5">
                  {isBRL ? 'Comparação Mensal' : 'Monthly Comparison'}
                </p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  {/* Income Change */}
                  <div className="group flex flex-col rounded-xl bg-white/70 dark:bg-surface-900/40 p-4 transition-all duration-200 hover:bg-white dark:hover:bg-surface-800/50 ring-1 ring-transparent hover:ring-emerald-200/50 dark:hover:ring-emerald-800/20">
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
                      {isBRL ? 'Variação de Receita' : 'Income Change'}
                    </p>
                    <p className={`text-lg font-semibold ${
                      comparison.comparison.incomeChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {comparison.comparison.incomeChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(comparison.comparison.incomeChange))}
                    </p>
                  </div>
                  {/* Expense Change */}
                  <div className="group flex flex-col rounded-xl bg-white/70 dark:bg-surface-900/40 p-4 transition-all duration-200 hover:bg-white dark:hover:bg-surface-800/50 ring-1 ring-transparent hover:ring-emerald-200/50 dark:hover:ring-emerald-800/20">
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
                      {isBRL ? 'Variação de Despesa' : 'Expense Change'}
                    </p>
                    <p className={`text-lg font-semibold ${
                      comparison.comparison.expenseChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {comparison.comparison.expenseChange <= 0 ? '-' : '+'}{formatCurrency(Math.abs(comparison.comparison.expenseChange))}
                    </p>
                  </div>
                  {/* Balance Change */}
                  <div className="group flex flex-col rounded-xl bg-white/70 dark:bg-surface-900/40 p-4 transition-all duration-200 hover:bg-white dark:hover:bg-surface-800/50 ring-1 ring-transparent hover:ring-emerald-200/50 dark:hover:ring-emerald-800/20">
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
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
            </div>
          </>
        )}

        {/* Advanced Reports Section */}
        <AdvancedReports formatCurrency={formatCurrency} isBRL={isBRL} />
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
