'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { generateNotifications, Notification } from '@/lib/notifications'
import * as Lucide from 'lucide-react'

interface Props {
  transactions: Array<{
    id: string
    title: string
    amount: string
    type: 'INCOME' | 'EXPENSE'
    isInstallment?: boolean
    isRecurring?: boolean
    dueDay?: number | null
    recurringDay?: number | null
    totalInstallments?: number | null
    purchaseDate?: string | null
    isActive?: boolean
    endDate?: string | null
    cardId?: string | null
  }>
  cards?: Array<{
    id: string
    name: string
    lastFourDigits: string
    dueDay: number
    closingDay: number
    limitAmount?: string | number | null
  }>
  isBRL: boolean
}

export default function NotificationDropdown({ transactions, cards = [], isBRL }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const notifications = useMemo(() => {
    const tx = transactions.map((t) => ({
      id: t.id,
      title: t.title,
      type: t.type,
      isInstallment: t.isInstallment ?? false,
      isRecurring: t.isRecurring ?? false,
      dueDay: t.dueDay ?? null,
      recurringDay: t.recurringDay ?? null,
      totalInstallments: t.totalInstallments ?? null,
      purchaseDate: t.purchaseDate ? new Date(t.purchaseDate) : null,
      isActive: t.isActive ?? true,
      endDate: t.endDate ? new Date(t.endDate) : null,
      cardId: t.cardId ?? null,
      amount: t.amount,
    }))
    return generateNotifications(tx, cards)
  }, [transactions, cards])

  const count = notifications.length
  const lateCount = notifications.filter((n) => n.type === 'late').length

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
        title={isBRL ? 'Notificações' : 'Notifications'}
      >
        <Lucide.Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
              lateCount > 0
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-[60] mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-surface-200 bg-white shadow-xl dark:border-surface-700/60 dark:bg-surface-900 transition-all duration-200 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 dark:border-surface-700/60">
            <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">
              {isBRL ? 'Notificações' : 'Notifications'}
            </h3>
            {count > 0 && (
              <span className="text-xs font-medium text-surface-400">
                {count} {isBRL ? (count === 1 ? 'pendência' : 'pendências') : count === 1 ? 'pending' : 'pending'}
              </span>
            )}
          </div>

          {/* List */}
          {count === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8">
              <Lucide.CheckCircle2 className="h-8 w-8 text-emerald-400 dark:text-emerald-500" />
              <p className="text-sm text-surface-400 dark:text-surface-500 text-center">
                {isBRL ? 'Tudo em dia!' : 'All caught up!'}
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto py-1">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} isBRL={isBRL} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotificationItem({ notification, isBRL }: { notification: Notification; isBRL: boolean }) {
  const { title, description, type } = notification

  const iconMap = {
    late: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
        <Lucide.AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      </div>
    ),
    today: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
        <Lucide.Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
    ),
    upcoming: (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
        <Lucide.Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
    ),
  }

  const borderMap = {
    late: 'border-l-red-500',
    today: 'border-l-emerald-500',
    upcoming: 'border-l-amber-500',
  }

  return (
    <div
      className={`flex items-start gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50 ${
        borderMap[type]
      }`}
    >
      {iconMap[type]}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-surface-800 dark:text-surface-200">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
          {description}
        </p>
      </div>
      {/* Quick status dot */}
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
          type === 'late'
            ? 'bg-red-500'
            : type === 'today'
            ? 'bg-emerald-500'
            : 'bg-amber-500'
        }`}
      />
    </div>
  )
}
