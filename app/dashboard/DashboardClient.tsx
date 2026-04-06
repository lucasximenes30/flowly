'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/i18n'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import MonthlyReport from '@/components/MonthlyReport'
import EditTransactionModal from '@/components/EditTransactionModal'
import CategorySelect from '@/components/CategorySelect'
import ManageCategoriesModal from '@/components/ManageCategoriesModal'

interface Session { userId: string; email: string; name: string }
interface Transaction { id: string; title: string; amount: string; type: 'INCOME' | 'EXPENSE'; category: string; date: string }
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
  }, [isBRL])

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
  const [showSettings, setShowSettings] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount: parseFloat(amount), type, category: category.trim() || 'General', date }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error ?? t('transaction.failed'))
        return
      }

      setTitle(''); setAmount(''); setCategory('')
      setDate(new Date().toISOString().split('T')[0])
      setShowForm(false)
      router.refresh()
    } catch {
      setFormError(t('transaction.networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  // Change password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  // Manage categories
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [categoriesVersion, setCategoriesVersion] = useState(0)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordMessage(t('settings.passwordMismatch'))
      return
    }
    if (newPassword === currentPassword) {
      setPasswordMessage(t('settings.passwordSame'))
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordMessage(data.error ?? 'Erro ao alterar senha')
        return
      }
      setPasswordMessage(t('settings.passwordUpdated'))
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      setPasswordMessage('Erro de rede')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">Flowly</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              {isBRL ? `Olá` : `Hi`}, {session.name}
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
          <div className="mt-6 flex gap-8">
            <div className="space-y-0.5">
              <p className="text-xs/5 font-medium text-white/60">{t('dashboard.totalIncome')}</p>
              <p className="text-lg font-semibold text-white/90">{formatCurrency(balance.income)}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs/5 font-medium text-white/60">{t('dashboard.totalExpenses')}</p>
              <p className="text-lg font-semibold text-white/90">{formatCurrency(balance.expense)}</p>
            </div>
            {!isBRL && !rateLoading && (
              <div className="ml-auto text-right">
                <p className="text-xs/5 font-medium text-white/40">1 USD = R$ {rate.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card">
            <div className="space-y-1">
              <p className="text-xs/5 font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                {t('dashboard.thisMonth')}
                {!isBRL && (
                  <span className="ml-1 font-normal text-surface-400 lowercase">
                    (≈ {formatConverted(monthly.balance)})
                  </span>
                )}
              </p>
              <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">{formatCurrency(monthly.balance)}</p>
              <p className="text-xs text-surface-400 dark:text-surface-500">{monthly.transactionCount} {isBRL ? 'transações' : 'transactions'}</p>
            </div>
          </div>
          <div className="card">
            <div className="space-y-1">
              <p className="text-xs/5 font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('dashboard.monthlyIncome')}</p>
              <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(monthly.income)}</p>
            </div>
          </div>
          <div className="card">
            <div className="space-y-1">
              <p className="text-xs/5 font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{t('dashboard.monthlyExpenses')}</p>
              <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(monthly.expense)}</p>
            </div>
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
            <p className="text-xs text-amber-700 dark:text-amber-400">{isBRL ? 'Carregando taxa de câmbio...' : 'Loading exchange rate...'}</p>
          </div>
        )}

        {/* Transactions Section */}
        <div className="card">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">{t('dashboard.recentTransactions')}</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs px-4 py-2">
              {showForm ? t('common.cancel') : t('dashboard.addTransaction')}
            </button>
          </div>

          {/* Add Transaction Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-surface-200 bg-surface-50 p-5 dark:bg-surface-800/50 dark:border-surface-700/60">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">{t('transaction.title')}</label>
                  <input type="text" required className="input-field" placeholder={t('transaction.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">{t('transaction.amount')}</label>
                  <input type="number" required min="0.01" step="0.01" className="input-field" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">{t('transaction.type')}</label>
                  <select value={type} onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')} className="input-field">
                    <option value="EXPENSE">{t('dashboard.expense')}</option>
                    <option value="INCOME">{t('dashboard.income')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">{t('transaction.category')}</label>
                  <CategorySelect value={category} onChange={setCategory} type={type} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">{t('transaction.date')}</label>
                  <input type="date" required className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              {formError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</p>}
              <div className="mt-4 flex justify-end">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? t('transaction.saving') : t('transaction.save')}
                </button>
              </div>
            </form>
          )}

          {/* Transaction List */}
          {transactions.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">{t('dashboard.noTransactions')}</p>
              <p className="text-xs text-surface-400 dark:text-surface-500">{t('dashboard.addFirstTransaction')}</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800">
              {transactions.slice(0, 20).map((txn) => (
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
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{txn.title}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500">{t(`category.${txn.category}`) ?? txn.category} · {formatDate(txn.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${txn.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {txn.type === 'INCOME' ? '+' : '-'}{formatCurrency(parseFloat(txn.amount))}
                      </span>
                      {!isBRL && (
                        <p className="text-[10px] font-medium text-surface-400 dark:text-surface-500">
                          ≈ {formatConverted(parseFloat(txn.amount))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-elevated dark:bg-surface-900 dark:border dark:border-surface-700/60" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{t('settings.title')}</h2>
              <button onClick={() => setShowSettings(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">{t('settings.general')}</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.theme')}</label>
                    <ThemeToggle />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language')}</label>
                    <LanguageToggle />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                      {isBRL ? 'Categorias' : 'Categories'}
                    </label>
                    <button
                      onClick={() => setShowManageCategories(true)}
                      className="w-full flex items-center justify-between rounded-xl border border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
                    >
                      <span>{isBRL ? 'Gerenciar Categorias' : 'Manage Categories'}</span>
                      <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-surface-200 dark:border-surface-700/60" />

              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-3">{t('settings.changePassword')}</h3>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400">{t('settings.currentPassword')}</label>
                    <input type="password" required className="input-field" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400">{t('settings.newPassword')}</label>
                    <input type="password" required minLength={6} className="input-field" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-surface-600 dark:text-surface-400">{t('settings.confirmPassword')}</label>
                    <input type="password" required minLength={6} className="input-field" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  {passwordMessage && (
                    <p className={`text-sm rounded-lg p-3 ${passwordMessage.includes('sucesso') || passwordMessage.includes('updated') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {passwordMessage}
                    </p>
                  )}
                  <button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword} className="btn-secondary w-full">
                    {isChangingPassword ? t('settings.changingPassword') : t('settings.update')}
                  </button>
                </form>
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

      {/* Manage Categories Modal */}
      {showManageCategories && (
        <ManageCategoriesModal
          onClose={() => setShowManageCategories(false)}
          onRefresh={() => setCategoriesVersion((v) => v + 1)}
        />
      )}
    </div>
  )
}
