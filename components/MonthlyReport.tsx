'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/i18n'

interface MonthData {
  income: number
  expense: number
  balance: number
  transactionCount: number
}

interface MonthComparison {
  current: MonthData & { year: number; month: number }
  previous: MonthData & { year: number; month: number }
  comparison: {
    incomeChange: number
    expenseChange: number
    balanceChange: number
  }
}

interface MonthlyReportProps {
  formatCurrency: (value: number) => string
  formatConverted?: (value: number) => string | null
}

export default function MonthlyReport({ formatCurrency, formatConverted }: MonthlyReportProps) {
  const { t } = useApp()
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [comparison, setComparison] = useState<MonthComparison | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentMonth = useCallback(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }, [])

  // Fetch available months on component mount
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const res = await fetch('/api/transactions/monthly?type=available')
        if (res.ok) {
          const data = await res.json()
          setAvailableMonths(data.months)
          const current = getCurrentMonth()
          // Use current month even if not in available months yet (for new users)
          setSelectedYearMonth(current)
          if (data.months.length > 0 && !data.months.includes(current)) {
            setAvailableMonths(prev => [current, ...prev])
          }
        }
      } catch (error) {
        console.error('Failed to fetch available months:', error)
        setSelectedYearMonth(getCurrentMonth())
      }
    }
    fetchAvailableMonths()
  }, [getCurrentMonth])

  // Fetch comparison data when selected month changes
  useEffect(() => {
    if (!selectedYearMonth) return

    const [year, month] = selectedYearMonth.split('-')
    const fetchComparison = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/transactions/monthly?type=comparison&refYear=${year}&refMonth=${month}`
        )
        if (res.ok) {
          const data = await res.json()
          setComparison(data)
        }
      } catch (error) {
        console.error('Failed to fetch comparison:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [selectedYearMonth])

  const getMonthNames = (monthNumber: number): string => {
    const monthNames = [
      'month.january', 'month.february', 'month.march', 'month.april',
      'month.may', 'month.june', 'month.july', 'month.august',
      'month.september', 'month.october', 'month.november', 'month.december',
    ]
    return t(monthNames[monthNumber - 1])
  }

  const formatMonthLabel = (yearMonth: string): string => {
    const [year, month] = yearMonth.split('-')
    return `${getMonthNames(parseInt(month))} ${year}`
  }

  const getComparisonIcon = (value: number) => {
    if (value > 0)
      return <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3.293 7.293m3.414-3.414L7 4m10 0v12m0 0l3.293-3.293m-3.414 3.414L17 20" /></svg>
    if (value < 0)
      return <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8V4m0 0L3.293.293M7 4L3.707.707M17 8v12m0 0l3.293-3.293m-3.414 3.414L17 20" /></svg>
    return null
  }

  if (!comparison) return null

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            {t('monthly.selectMonth')}
          </label>
          <select
            value={selectedYearMonth}
            onChange={(e) => setSelectedYearMonth(e.target.value)}
            className="input-field w-48"
            disabled={loading}
          >
            {availableMonths.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthLabel(ym)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-8">
          <div className="animate-spin">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
            </svg>
          </div>
        </div>
      ) : (
        <>
          {/* Comparison Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Selected Month */}
            <div className="card border-l-4 border-brand-600">
              <p className="text-sm font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                {selectedYearMonth === getCurrentMonth() ? t('monthly.currentMonth') : t('monthly.selectedMonth') ?? 'Mês Selecionado'}
              </p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mb-4">
                {getMonthNames(comparison.current.month)} {comparison.current.year}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {t('dashboard.monthlyIncome')}
                  </span>
                  <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(comparison.current.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {t('dashboard.monthlyExpenses')}
                  </span>
                  <span className="text-base font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrency(comparison.current.expense)}
                  </span>
                </div>
                <div className="border-t border-surface-200 dark:border-surface-700/60 pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {t('dashboard.currentBalance')}
                  </span>
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {formatCurrency(comparison.current.balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Previous Month */}
            <div className="card border-l-4 border-surface-300 dark:border-surface-700">
              <p className="text-sm font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                {t('monthly.previousMonth')}
              </p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mb-4">
                {getMonthNames(comparison.previous.month)} {comparison.previous.year}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {t('dashboard.monthlyIncome')}
                  </span>
                  <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(comparison.previous.income)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {t('dashboard.monthlyExpenses')}
                  </span>
                  <span className="text-base font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrency(comparison.previous.expense)}
                  </span>
                </div>
                <div className="border-t border-surface-200 dark:border-surface-700/60 pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {t('dashboard.currentBalance')}
                  </span>
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {formatCurrency(comparison.previous.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="card bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 border border-brand-200/50 dark:border-brand-800/30">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              {t('monthly.comparison')}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Income Change */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-surface-900/30">
                <div className="mt-1">{getComparisonIcon(comparison.comparison.incomeChange)}</div>
                <div className="flex-1">
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                    {t('monthly.incomeChange')}
                  </p>
                  <p className={`text-sm font-semibold ${
                    comparison.comparison.incomeChange >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {comparison.comparison.incomeChange >= 0 ? '+' : ''}
                    {formatCurrency(Math.abs(comparison.comparison.incomeChange))}
                  </p>
                </div>
              </div>

              {/* Expense Change */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-surface-900/30">
                <div className="mt-1">{getComparisonIcon(-comparison.comparison.expenseChange)}</div>
                <div className="flex-1">
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                    {t('monthly.expenseChange')}
                  </p>
                  <p className={`text-sm font-semibold ${
                    comparison.comparison.expenseChange <= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {comparison.comparison.expenseChange <= 0 ? '-' : '+'}
                    {formatCurrency(Math.abs(comparison.comparison.expenseChange))}
                  </p>
                </div>
              </div>

              {/* Balance Change */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-surface-900/30">
                <div className="mt-1">{getComparisonIcon(comparison.comparison.balanceChange)}</div>
                <div className="flex-1">
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                    {t('monthly.balanceChange')}
                  </p>
                  <p className={`text-sm font-semibold ${
                    comparison.comparison.balanceChange >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {comparison.comparison.balanceChange >= 0 ? '+' : ''}
                    {formatCurrency(Math.abs(comparison.comparison.balanceChange))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
