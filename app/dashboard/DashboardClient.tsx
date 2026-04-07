'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/i18n'
import MonthlyReport from '@/components/MonthlyReport'
import EditTransactionModal from '@/components/EditTransactionModal'
import CategorySelect from '@/components/CategorySelect'
import SettingsPanel from '@/components/SettingsPanel'
import NotificationDropdown from '@/components/NotificationDropdown'
import * as Lucide from 'lucide-react'
import { getInstallmentInfo, formatShortDate, isInstallmentActiveInMonth, getInstallmentForMonth } from '@/lib/installments'

interface Session { userId: string; email: string; name: string }
interface Transaction { id: string; title: string; amount: string; installmentAmount?: number; type: 'INCOME' | 'EXPENSE'; category: string; date: string; isInstallment?: boolean; totalInstallments?: number; purchaseDate?: string; dueDay?: number; _activeInstallment?: number; isRecurring?: boolean; recurringDay?: number; _recurringStatus?: { isRecurring: boolean; day: number | null; status: 'DUE' | 'PAID' | 'UPCOMING'; daysUntil: number | null }; isActive?: boolean; endDate?: string }
interface Balance { income: number; expense: number; balance: number }
interface Monthly { income: number; expense: number; balance: number; transactionCount: number }

// Cache de taxa de câmbio (atualiza a cada 5 min)
const cacheKey = 'flowly_exchange_rate'
const cacheTimeKey = 'flowly_exchange_rate_time'
let cachedRate: { value: number; time: number } | null = null

async function getExchangeRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.time < 5 * 60 * 1000) {
    return cachedRate.value
  }
  try {
    const res = await fetch('https://v6.exchangerate-api.com/v6/latest/USD')
    const data = await res.json()
    const rate = Number(data.conversion_rates?.BRL)
    if (rate > 0) {
      cachedRate = { value: rate, time: Date.now() }
      return rate
    }
  } catch { /* fallback */ }
  return cachedRate?.value ?? 5.5
}

export default function DashboardClient({
  session, transactions, balance, monthly,
}: {
  session: Session
  transactions: Transaction[]
  balance: Balance
  monthly: Monthly
}) {
  const router = useRouter()
  const { t, locale } = useApp()

  // Loading animation
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Exchange rate
  const [rate, setRate] = useState<number>(5.5)
  const [rateLoading, setRateLoading] = useState(true)
  const [rateError, setRateError] = useState(false)

  useEffect(() => {
    setRateLoading(true)
    setRateError(false)
    getExchangeRate().then((r) => {
      setRate(r)
      setRateLoading(false)
    }).catch(() => {
      setRateError(true)
      setRateLoading(false)
    })
  }, [locale])

  const isBRL = locale === 'pt-BR'

  const formatCurrency = useCallback((value: number) => {
    if (isBRL) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }
    const inUSD = value / rate
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inUSD)
  }, [isBRL, rate])

  const formatConverted = useCallback((value: number) => {
    if (isBRL) return null
    const convertedBRL = value
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(convertedBRL)
  }, [isBRL, rate])

  const formatDate = (dateStr: string) => {
    const loc = isBRL ? 'pt-BR' : 'en-US'
    return new Date(dateStr).toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Delete transaction
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch { /* ignore */ }
    setDeletingId(null)
    setDeleteConfirmId(null)
  }

  // Edit transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editSuccess, setEditSuccess] = useState(false)

  const handleEditSave = () => {
    setEditSuccess(true)
    router.refresh()
    setTimeout(() => setEditSuccess(false), 2000)
  }

  // Add transaction
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Installment fields
  const [isInstallment, setIsInstallment] = useState(false)
  const [totalInstallments, setTotalInstallments] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDay, setDueDay] = useState('')

  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState('')

  // Mutual exclusion: can't be both installment and recurring
  const toggleInstallment = (value: boolean) => {
    setIsInstallment(value)
    if (value) setIsRecurring(false)
  }
  const toggleRecurring = (value: boolean) => {
    setIsRecurring(value)
    if (value) setIsInstallment(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          type,
          category: category.trim() || 'General',
          date,
          isInstallment,
          totalInstallments: isInstallment ? parseInt(totalInstallments) : null,
          purchaseDate: isInstallment ? purchaseDate : null,
          dueDay: isInstallment ? parseInt(dueDay) : null,
          isRecurring,
          recurringDay: isRecurring ? parseInt(recurringDay) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error ?? t('transaction.failed'))
        return
      }

      setTitle(''); setAmount(''); setCategory('')
      setDate(new Date().toISOString().split('T')[0])
      setIsInstallment(false); setTotalInstallments(''); setPurchaseDate(new Date().toISOString().split('T')[0]); setDueDay('')
      setIsRecurring(false); setRecurringDay('')
      setShowForm(false)
      router.refresh()
    } catch {
      setFormError(t('transaction.networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  // Profile name display only
  const [profileName, setProfileName] = useState(session.name)

  // Month filter for transaction history
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(currentYM)
  const [sortDesc, setSortDesc] = useState(true) // true = most recent first

  // Filter transactions for selected month
  const filteredMonthTransactions = useMemo(() => {
    if (transactions.length === 0) return []
    const [yStr, mStr] = selectedMonth.split('-')
    const year = parseInt(yStr)
    const month = parseInt(mStr)

    return transactions.filter((txn) => {
      // Normal transactions — date must be within month
      if (!txn.isInstallment && !txn.isRecurring) {
        const d = new Date(txn.date)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      }

      // Installment — show if active in this month
      if (txn.isInstallment && txn.totalInstallments && txn.purchaseDate) {
        return isInstallmentActiveInMonth(new Date(txn.purchaseDate), txn.totalInstallments, year, month)
      }

      // Recurring — show if isActive and endDate hasn't passed this month
      if (txn.isRecurring) {
        if (!txn.isActive) return false
        if (txn.endDate) {
          const end = new Date(txn.endDate)
          return end.getFullYear() > year || (end.getFullYear() === year && end.getMonth() + 1 >= month)
        }
        return true
      }

      return false
    }).sort((a, b) => {
      const dateA = a.isRecurring ? now : new Date(a.date)
      const dateB = b.isRecurring ? now : new Date(b.date)
      return sortDesc ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime()
    }).map((txn) => {
      // Inject _activeInstallment for the selected month
      if (txn.isInstallment && txn.totalInstallments && txn.purchaseDate) {
        return {
          ...txn,
          _activeInstallment: getInstallmentForMonth(new Date(txn.purchaseDate), txn.totalInstallments, year, month),
        }
      }
      return txn
    })
  }, [transactions, selectedMonth, sortDesc])

  // Get last 6 months for selector
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = (() => {
        const monthName = d.toLocaleDateString(isBRL ? 'pt-BR' : 'en-US', { month: 'long' })
        const year = d.getFullYear()
        return `${monthName} de ${year}`
      })()
      opts.push({ value: ym, label })
    }
    return opts
  }, [isBRL])

  // Cancel recurring
  const [cancelRecurringId, setCancelRecurringId] = useState<string | null>(null)
  const [cancelRecurringMessage, setCancelRecurringMessage] = useState('')
  const [isCancellingRecurring, setIsCancellingRecurring] = useState(false)
  const [cancelRecurringModalOpen, setCancelRecurringModalOpen] = useState(false)

  const handleCancelRecurring = async (id: string) => {
    setIsCancellingRecurring(true)
    try {
      const res = await fetch(`/api/transactions/${id}/cancel-recurring`, { method: 'POST' })
      const data = await res.json()
      setCancelRecurringMessage(data.message ?? '')
      if (res.ok) {
        setCancelRecurringId(null)
        setCancelRecurringModalOpen(false)
        router.refresh()
      }
    } catch {
      setCancelRecurringMessage(isBRL ? 'Erro de rede' : 'Network error')
    } finally {
      setIsCancellingRecurring(false)
    }
  }

  // Confirmation modals
  const [showDeleteConfirm1, setShowDeleteConfirm1] = useState(false)
  const [showDeleteConfirm2, setShowDeleteConfirm2] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

  // Manage categories - handled inside SettingsPanel

  // Listen for delete account trigger from SettingsPanel
  useEffect(() => {
    const handler = () => setShowDeleteConfirm1(true)
    window.addEventListener('flowly:deleteAccount', handler)
    return () => window.removeEventListener('flowly:deleteAccount', handler)
  }, [])

  // Listen for name updates from SettingsPanel
  useEffect(() => {
    const handler = (e: Event) => {
      const name = (e as CustomEvent<string>).detail
      setProfileName(name)
    }
    window.addEventListener('flowly:nameUpdated', handler)
    return () => window.removeEventListener('flowly:nameUpdated', handler)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'EXCLUIR' && deleteConfirmText.trim() !== 'DELETE') {
      setDeleteMessage(isBRL ? 'Digite EXCLUIR para confirmar' : 'Type DELETE to confirm')
      return
    }
    setIsDeletingAccount(true)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setDeleteMessage(data.error ?? 'Erro ao excluir conta')
        return
      }
      setDeleteMessage(t('settings.accountDeleted'))
      setTimeout(() => router.push('/login'), 1000)
    } catch {
      setDeleteMessage('Erro de rede')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  // ── Loading screen ──
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-brand-800 dark:border-t-brand-400" />
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {isBRL ? 'Carregando...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300 animate-dashboard-fade">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">Flowly</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              {isBRL ? `Olá` : `Hi`}, {profileName}
            </span>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
              title={t('settings.title')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 010 .255c-.007.378.138.75.43.992l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Notification bell */}
            <NotificationDropdown transactions={transactions} isBRL={isBRL} />

            <button onClick={handleLogout} className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors">
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg dark:shadow-brand-700/20">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm/6 font-medium text-white/70">{t('dashboard.currentBalance')}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-semibold tracking-tight">{formatCurrency(balance.balance)}</p>
                {!isBRL && (
                  <span className="text-sm font-medium text-white/50">
                    ≈ {formatConverted(balance.balance)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push('/reports')}
              className="shrink-0 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/25 hover:scale-[1.03] active:scale-[0.98]"
            >
              {isBRL ? 'Ver relatórios' : 'View reports'}
            </button>
          </div>
          <div className="mt-6 flex items-center justify-between gap-8">
            <div className="flex gap-8">
              <div className="space-y-0.5">
                <p className="text-xs/5 font-medium text-white/60">{t('dashboard.totalIncome')}</p>
                <p className="text-lg font-semibold text-white/90">{formatCurrency(balance.income)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs/5 font-medium text-white/60">{t('dashboard.totalExpenses')}</p>
                <p className="text-lg font-semibold text-white/90">{formatCurrency(balance.expense)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowForm((prev) => !prev)
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
              }}
              className="shrink-0 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/25 hover:scale-[1.03] active:scale-[0.98]"
            >
              {showForm ? (isBRL ? 'Cancelar' : 'Cancel') : (isBRL ? 'Nova Transação' : 'New Transaction')}
            </button>
          </div>
        </div>

        {/* Monthly Report Section */}
        <MonthlyReport
          formatCurrency={formatCurrency}
          formatConverted={formatConverted}
        />

        {/* Exchange rate notice (EN only) */}
        {!isBRL && rateLoading && (
          <div className="card bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/40 py-3">
            <p className="text-sm text-amber-700 dark:text-amber-400">{isBRL ? 'Carregando taxa de câmbio...' : 'Loading exchange rate...'}</p>
          </div>
        )}

        {/* Transactions Section */}
        <div className="card">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {isBRL ? 'Transações' : 'Transactions'}
            </h2>
          </div>

          {/* Add Transaction Form */}
          {showForm && (
            <div ref={formRef}>
            <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-surface-200 bg-surface-50 p-5 dark:bg-surface-800/50 dark:border-surface-700/60 transition-all duration-500">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">{t('transaction.title')}</label>
                  <input type="text" required className="input-field" placeholder={t('transaction.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">{t('transaction.amount')}</label>
                  <input type="number" required min="0.01" step="0.01" className="input-field" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">{t('transaction.type')}</label>
                  <select value={type} onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')} className="input-field">
                    <option value="EXPENSE">{t('dashboard.expense')}</option>
                    <option value="INCOME">{t('dashboard.income')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">{t('transaction.category')}</label>
                  <CategorySelect value={category} onChange={setCategory} type={type} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">{t('transaction.date')}</label>
                  <input type="date" required className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                {/* Installment toggle */}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setIsInstallment(!isInstallment)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                      isInstallment
                        ? 'border-brand-300 bg-brand-50 dark:border-brand-700/50 dark:bg-brand-900/20'
                        : 'border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Lucide.ReceiptText className={`w-4 h-4 ${isInstallment ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'}`} />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                        {isBRL ? 'É parcelado?' : 'Installment?'}
                      </span>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center ${
                      isInstallment ? 'bg-brand-600 justify-end' : 'bg-surface-300 dark:bg-surface-600 justify-start'
                    }`}>
                      <div className="w-4 h-4 rounded-full bg-white mx-1 shadow-sm transition-transform" />
                    </div>
                  </button>
                </div>
                {/* Installment fields */}
                {isInstallment && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">
                        {isBRL ? 'Quantas parcelas?' : 'How many installments?'}
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="48"
                        className="input-field"
                        placeholder="12"
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">
                        {isBRL ? 'Dia do vencimento' : 'Payment day'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="input-field"
                        placeholder="12"
                        value={dueDay}
                        onChange={(e) => setDueDay(e.target.value)}
                      />
                      <p className="text-xs text-surface-400 mt-1">
                        {isBRL ? 'Ex: Se paga dia 12 todo mês, selecione 12' : 'e.g., if you pay on the 12th every month, select 12'}
                      </p>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">
                        {isBRL ? 'Data da compra' : 'Purchase date'}
                      </label>
                      <input
                        type="date"
                        className="input-field"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Recurring toggle */}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => toggleRecurring(!isRecurring)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${
                      isRecurring
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/50 dark:bg-emerald-900/20'
                        : 'border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Lucide.Repeat className={`w-4 h-4 ${isRecurring ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'}`} />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-200">
                        {isBRL ? 'Pagamento recorrente?' : 'Recurring payment?'}
                      </span>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center ${
                      isRecurring ? 'bg-emerald-600 justify-end' : 'bg-surface-300 dark:bg-surface-600 justify-start'
                    }`}>
                      <div className="w-4 h-4 rounded-full bg-white mx-1 shadow-sm" />
                    </div>
                  </button>
                </div>

                {/* Recurring fields */}
                {isRecurring && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">
                      {isBRL ? 'Dia da recorrência' : 'Recurring day'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="input-field"
                      placeholder="10"
                      value={recurringDay}
                      onChange={(e) => setRecurringDay(e.target.value)}
                    />
                    <p className="text-xs text-surface-400 mt-1">
                      {isBRL
                        ? 'Ex: Se esse pagamento acontece todo dia 10, selecione 10'
                        : 'e.g., if this payment happens every day 10, select 10'}
                    </p>
                  </div>
                )}
              </div>
              {formError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</p>}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setTitle(''); setAmount(''); setCategory(''); setDate(new Date().toISOString().split('T')[0]); setIsInstallment(false); setTotalInstallments(''); setPurchaseDate(new Date().toISOString().split('T')[0]); setDueDay(''); }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? t('transaction.saving') : t('transaction.save')}
                </button>
              </div>
            </form>
            </div>
          )}

          {/* Transaction List — Month Filter */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              {isBRL ? 'Histórico de transações' : 'Transaction history'}
            </h3>
            <div className="flex items-center gap-2">
              {/* Sort toggle button */}
              <button
                type="button"
                onClick={() => setSortDesc((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-all duration-200"
                title={sortDesc
                  ? (isBRL ? 'Mais recentes primeiro' : 'Most recent first')
                  : (isBRL ? 'Mais antigos primeiro' : 'Oldest first')
                }
              >
                {sortDesc ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                  </svg>
                )}
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field text-sm py-1.5 px-3 w-44 border-surface-200 h-9"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredMonthTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">
              {isBRL ? 'Nenhuma transação neste mês' : 'No transactions this month'}
            </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredMonthTransactions.map((txn) => (
                <div key={txn.id} className="group flex items-center justify-between rounded-lg px-2 py-3.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <div className="flex items-center gap-3">
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingTransaction(txn)}
                      className="invisible group-hover:visible flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(txn.id)}
                      disabled={deletingId === txn.id}
                      className="invisible group-hover:visible flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      {deletingId === txn.id ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-medium text-surface-800 dark:text-surface-200">{txn.title}</p>
                        {txn.isInstallment && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            <Lucide.ReceiptText className="w-3.5 h-3.5" />
                            Parcelado
                          </span>
                        )}
                        {txn.isRecurring && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <Lucide.Repeat className="w-3.5 h-3.5" />
                            {isBRL ? 'Recorrente' : 'Recurring'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{t(`category.${txn.category}`) || txn.category} · {formatDate(txn.date)}</p>
                      {txn.isInstallment && txn.totalInstallments && txn.dueDay && txn.purchaseDate && (() => {
                        // Use _activeInstallment if provided (from month-aware query), otherwise compute from today
                        const currentInstallment = txn._activeInstallment ?? getInstallmentInfo(
                          txn.purchaseDate ? new Date(txn.purchaseDate) : null,
                          txn.totalInstallments,
                          txn.dueDay,
                          txn.date,
                        ).currentInstallment

                        const info = getInstallmentInfo(
                          txn.purchaseDate ? new Date(txn.purchaseDate) : null,
                          txn.totalInstallments,
                          txn.dueDay,
                          txn.date,
                        )

                        // Override currentInstallment with the active one if available
                        const displayInstallment = txn._activeInstallment ?? info.currentInstallment

                        const perMonth = txn.installmentAmount ?? (parseFloat(txn.amount) / txn.totalInstallments)
                        const statusColor = info.status === 'LATE' ? 'text-red-600 dark:text-red-400' : info.status === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        return (
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs font-medium ${statusColor}`}>
                              {isBRL ? `Parcela ${displayInstallment}/${txn.totalInstallments}` : `Installment ${displayInstallment}/${txn.totalInstallments}`}
                            </span>
                            <span className="text-xs text-surface-500">
                              {formatCurrency(perMonth)} {isBRL ? 'por mês' : 'per month'}
                            </span>
                            {displayInstallment < txn.totalInstallments && (
                              <span className="text-xs text-surface-500">
                                {isBRL ? `Restam ${txn.totalInstallments - displayInstallment}` : `${txn.totalInstallments - displayInstallment} remaining`}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                      {txn.isRecurring && txn.isActive === false && txn.endDate && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Lucide.CircleSlash2 className="w-3.5 h-3.5 text-surface-500 dark:text-surface-400" />
                          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                            {isBRL ? 'Cancelado' : 'Cancelled'}
                          </span>
                        </div>
                      )}
                      {txn.isRecurring && txn.isActive !== false && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <Lucide.Repeat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {txn.recurringDay ? (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {isBRL ? `Todo dia ${txn.recurringDay}` : `Every day ${txn.recurringDay}`}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {isBRL ? 'Recorrente' : 'Recurring'}
                            </span>
                          )}
                          {txn._recurringStatus && (
                            <span className="text-xs text-surface-500">
                              {txn._recurringStatus.status === 'UPCOMING' && txn._recurringStatus.daysUntil
                                ? isBRL ? `${txn._recurringStatus.daysUntil}d` : `in ${txn._recurringStatus.daysUntil}d`
                                : ''}
                            </span>
                          )}
                          {/* Cancel button for active recurring (shown on hover) */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCancelRecurringId(txn.id); setCancelRecurringModalOpen(true) }}
                            className="ml-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
                            title={isBRL ? 'Cancelar assinatura' : 'Cancel subscription'}
                          >
                            <Lucide.CircleStop className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {txn.isInstallment && txn.totalInstallments ? (() => {
                        const perMonth = txn.installmentAmount ?? (parseFloat(txn.amount) / txn.totalInstallments)
                        return (
                          <>
                            <span className={`text-sm font-semibold ${txn.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(perMonth)}
                            </span>
                            {!isBRL && (
                              <p className="text-xs font-medium text-surface-400 dark:text-surface-500">
                                ≈ {formatConverted(perMonth)}
                              </p>
                            )}
                          </>
                        )
                      })() : (
                        <>
                          <span className={`text-sm font-semibold ${txn.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(parseFloat(txn.amount))}
                          </span>
                          {!isBRL && (
                            <p className="text-xs font-medium text-surface-400 dark:text-surface-500">
                              ≈ {formatConverted(parseFloat(txn.amount))}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        session={session}
      />

      {/* Delete Account - Step 1 Confirmation */}
      {showDeleteConfirm1 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm1(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevated dark:bg-surface-900 dark:border dark:border-surface-700/60" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Lucide.AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">{t('settings.deleteAccountConfirm')}</h3>
            <p className="text-sm text-center text-surface-500 dark:text-surface-400 mt-2">{t('settings.deleteAccountWarning')}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm1(false)} className="btn-secondary flex-1">
                {t('settings.cancel')}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm1(false); setShowDeleteConfirm2(true) }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                {isBRL ? 'Continuar' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account - Step 2 Final Confirmation */}
      {showDeleteConfirm2 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm2(false); setDeleteConfirmText('') }}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevated dark:bg-surface-900 dark:border dark:border-surface-700/60" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">{t('settings.deleteAccountFinalConfirm')}</h3>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                className="input-field text-center font-mono text-sm uppercase"
                placeholder={t('settings.deleteConfirmationText')}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDeleteAccount()
                }}
              />
              {deleteMessage && (
                <p className="text-sm rounded-lg p-3 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {deleteMessage}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm2(false); setDeleteConfirmText('') }}
                  className="btn-secondary flex-1"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || (deleteConfirmText !== 'EXCLUIR' && deleteConfirmText !== 'DELETE')}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700"
                >
                  {isDeletingAccount ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
                      </svg>
                      {t('settings.deletingAccount')}
                    </span>
                  ) : (
                    t('settings.deleteAccount')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit success toast */}
      {editSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {isBRL ? 'Transação atualizada!' : 'Transaction updated!'}
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleEditSave}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Cancel Recurring Confirmation Modal */}
      {cancelRecurringModalOpen && cancelRecurringId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => { setCancelRecurringModalOpen(false); setCancelRecurringMessage('') }}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevated dark:bg-surface-900 dark:border dark:border-surface-700/60" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
              <Lucide.CircleStop className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">
              {isBRL ? 'Cancelar recorrência?' : 'Cancel recurring?'}
            </h3>
            <p className="text-sm text-center text-surface-500 dark:text-surface-400 mt-2">
              {isBRL
                ? 'Esta ação não pode ser desfeita. O pagamento recorrente será encerrado.'
                : 'This action cannot be undone. The recurring payment will be terminated.'}
            </p>
            {cancelRecurringMessage && (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-center">
                {cancelRecurringMessage}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setCancelRecurringModalOpen(false); setCancelRecurringMessage('') }}
                disabled={isCancellingRecurring}
                className="btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleCancelRecurring(cancelRecurringId)}
                disabled={isCancellingRecurring}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700"
              >
                {isCancellingRecurring ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
                    </svg>
                    {isBRL ? 'Cancelando...' : 'Cancelling...'}
                  </span>
                ) : (
                  isBRL ? 'Confirmar cancelamento' : 'Confirm cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
