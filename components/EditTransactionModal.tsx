'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/i18n'
import CategorySelect from './CategorySelect'

interface Transaction {
  id: string
  title: string
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
}

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSave: () => void
  formatCurrency: (value: number) => string
}

export default function EditTransactionModal({ transaction, onClose, onSave, formatCurrency }: EditTransactionModalProps) {
  const { t } = useApp()
  const [title, setTitle] = useState(transaction.title)
  const [amount, setAmount] = useState(transaction.amount)
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [date, setDate] = useState(transaction.date.split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 200)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          type,
          category: category.trim() || 'General',
          date,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? t('transaction.failed'))
        return
      }

      handleClose()
      onSave()
    } catch {
      setError(t('transaction.networkError'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-surface-900 dark:border dark:border-surface-700/60 transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {t('dashboard.editTransaction')}
          </h2>
          <button
            onClick={handleClose}
            className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                {t('transaction.title')}
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder={t('transaction.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                {t('transaction.amount')}
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                className="input-field"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                {t('transaction.type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                className="input-field"
              >
                <option value="EXPENSE">{t('dashboard.expense')}</option>
                <option value="INCOME">{t('dashboard.income')}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                {t('transaction.category')}
              </label>
              <CategorySelect value={category} onChange={setCategory} type={type} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                {t('transaction.date')}
              </label>
              <input
                type="date"
                required
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? t('transaction.saving') : t('transaction.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
