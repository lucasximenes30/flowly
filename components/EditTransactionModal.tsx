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
  const [paymentMethod, setPaymentMethod] = useState<'none' | 'credit_card'>(transaction.cardId ? 'credit_card' : 'none')
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
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-surface-900 dark:border dark:border-surface-700/60 transition-all duration-200 ${
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
            <Lucide.X className="h-5 w-5" />
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
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
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
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
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
                  <p className="text-[10px] text-surface-400 mt-0.5">
                    {isBRL ? 'Ex: Se paga dia 12 todo mês, selecione 12' : 'e.g., if you pay on the 12th every month, select 12'}
                  </p>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
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
                <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
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
                <p className="text-[10px] text-surface-400 mt-0.5">
                  {isBRL
                    ? 'Ex: Se esse pagamento acontece todo dia 10, selecione 10'
                    : 'e.g., if this payment happens every day 10, select 10'}
                </p>
              </div>
            )}

            {/* Payment Method Flow (same as Dashboard) — Only for Expenses */}
            {type === 'EXPENSE' && (
              <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-surface-100 dark:border-surface-800/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-surface-700 dark:text-surface-300">
                    {isBRL ? 'Forma de pagamento' : 'Payment Method'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value as 'none' | 'credit_card'
                      setPaymentMethod(val)
                      if (val === 'credit_card' && cards.length > 0 && !selectedCardId) {
                        setSelectedCardId(cards[0].id)
                      } else if (val === 'none') {
                        setSelectedCardId('')
                      }
                    }}
                    className="input-field"
                  >
                    <option value="none">{isBRL ? 'Nenhum' : 'None'}</option>
                    <option value="credit_card">{isBRL ? 'Cartão de Crédito' : 'Credit Card'}</option>
                  </select>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-700 dark:text-surface-300">
                      {isBRL ? 'Cartão' : 'Card'}
                    </label>
                    {cards.length === 0 ? (
                      <div className="flex h-10 items-center justify-between rounded-xl border border-dashed border-surface-300 px-3 text-[11px] dark:border-surface-700">
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
