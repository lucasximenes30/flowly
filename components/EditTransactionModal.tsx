'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/i18n'
import CategorySelect from './CategorySelect'
import * as Lucide from 'lucide-react'

interface Transaction {
  id: string
  title: string
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  isInstallment?: boolean
  totalInstallments?: number
  purchaseDate?: string
  dueDay?: number
  isRecurring?: boolean
  recurringDay?: number
  cardId?: string
  paymentMethod?: string
}

interface Card { id: string; name: string; lastFourDigits: string; dueDay: number; closingDay: number }


interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSave: () => void
  formatCurrency: (value: number) => string
  cards?: Card[]
}


export default function EditTransactionModal({ transaction, onClose, onSave, formatCurrency, cards = [] }: EditTransactionModalProps) {
  const { t, locale } = useApp()
  const isBRL = locale === 'pt-BR'
  const [title, setTitle] = useState(transaction.title)
  const [amount, setAmount] = useState(transaction.amount)
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [date, setDate] = useState(transaction.date.split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  // Installment fields
  const [isInstallment, setIsInstallment] = useState(transaction.isInstallment ?? false)
  const [totalInstallments, setTotalInstallments] = useState(transaction.totalInstallments?.toString() ?? '')
  const [purchaseDate, setPurchaseDate] = useState(transaction.purchaseDate?.split('T')[0] ?? transaction.date.split('T')[0])
  const [dueDay, setDueDay] = useState(transaction.dueDay?.toString() ?? '')

  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(transaction.isRecurring ?? false)
  const [recurringDay, setRecurringDay] = useState(transaction.recurringDay?.toString() ?? '')

  // Card fields
  const [paymentMethod, setPaymentMethod] = useState<string>(transaction.cardId ? 'credit_card' : transaction.paymentMethod || 'none')
  const [selectedCardId, setSelectedCardId] = useState<string>(transaction.cardId ?? '')

  // Update logic: if user chooses card, auto-fill dueDay if we're in installment
  useEffect(() => {
    if (isInstallment && paymentMethod === 'credit_card' && selectedCardId) {
      const card = cards.find(c => c.id === selectedCardId)
      if (card && card.dueDay) {
         setDueDay(card.dueDay.toString())
      }
    }
  }, [selectedCardId, isInstallment, paymentMethod, cards])


  const toggleInstallment = (value: boolean) => {
    setIsInstallment(value)
    if (value) setIsRecurring(false)
  }
  const toggleRecurring = (value: boolean) => {
    setIsRecurring(value)
    if (value) setIsInstallment(false)
  }

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
          isInstallment,
          totalInstallments: isInstallment ? parseInt(totalInstallments) : null,
          purchaseDate: isInstallment ? purchaseDate : null,
          dueDay: isInstallment ? parseInt(dueDay) : null,
          isRecurring,
          recurringDay: isRecurring ? parseInt(recurringDay) : null,
          cardId: paymentMethod === 'credit_card' && selectedCardId ? selectedCardId : null,
          paymentMethod: paymentMethod === 'none' ? null : paymentMethod,
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
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4 transition-all duration-300 ${
        visible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl dark:bg-surface-900 dark:border dark:border-surface-700/60 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 sm:translate-y-8 opacity-0 scale-95'
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-between border-b border-surface-100 p-4 sm:p-6 dark:border-surface-800/50">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {t('dashboard.editTransaction')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 -mr-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-colors"
          >
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
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
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
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
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
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
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
                {t('transaction.category')}
              </label>
              <CategorySelect value={category} onChange={setCategory} type={type} />
            </div>
            <div className="space-y-2 sm:col-span-2 min-w-0 w-full">
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
                {t('transaction.date')}
              </label>
              <input
                type="date"
                required
                className="input-field max-w-full min-w-0 flex-1 appearance-none block w-full box-border"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Installment toggle */}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => toggleInstallment(!isInstallment)}
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
                  <div className="w-4 h-4 rounded-full bg-white mx-1 shadow-sm" />
                </div>
              </button>
            </div>

            {/* Installment fields */}
            {isInstallment && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
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
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
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
                <div className="space-y-2 sm:col-span-2 min-w-0 w-full">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
                    {isBRL ? 'Data da compra' : 'Purchase date'}
                  </label>
                  <input
                    type="date"
                    className="input-field max-w-full min-w-0 flex-1 appearance-none block w-full box-border"
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
              <div className="sm:col-span-2 space-y-2 min-w-0 w-full">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
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

            {/* Payment Method Flow (same as Dashboard) — Only for Expenses */}
            {type === 'EXPENSE' && (
              <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-100 dark:border-surface-800/50 mt-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
                    {isBRL ? 'Forma de pagamento' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value as any
                      setPaymentMethod(val)
                      if (val === 'credit_card' && cards.length > 0 && !selectedCardId) {
                        setSelectedCardId(cards[0].id)
                      } else if (val !== 'credit_card') {
                        setSelectedCardId('')
                      }
                    }}
                    className="input-field"
                  >
                    <option value="none">{isBRL ? 'Nenhum' : 'None'}</option>
                    <option value="credit_card">{isBRL ? 'Cartão de Crédito' : 'Credit Card'}</option>
                    <option value="debit_card">{isBRL ? 'Débito' : 'Debit'}</option>
                    <option value="pix">Pix</option>
                  </select>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 uppercase tracking-wider">
                      {isBRL ? 'Cartão' : 'Card'}
                    </label>
                    {cards.length === 0 ? (
                      <div className="flex h-[42px] items-center justify-between rounded-xl border border-dashed border-surface-300 px-4 text-[13px] dark:border-surface-700">
                        <span className="text-surface-500">{isBRL ? 'Nenhum cartão.' : 'No cards.'}</span>
                      </div>
                    ) : (
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="input-field"
                      >
                        <option value="">{isBRL ? 'Selecionar...' : 'Select...'}</option>
                        {cards.map(c => (
                          <option key={c.id} value={c.id}>
                            **** {c.lastFourDigits} — {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 mt-2 mb-4">
              {error}
            </p>
          )}
          </div>

          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 border-t border-surface-100 p-4 sm:p-6 bg-surface-50/50 dark:bg-surface-900/50 dark:border-surface-800/50 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary w-full sm:flex-1 py-3"
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:flex-1 py-3"
            >
              {submitting ? t('transaction.saving') : t('transaction.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
