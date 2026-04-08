export interface InstallmentInfo {
  isInstallment: boolean
  currentInstallment: number
  totalInstallments: number
  paidInstallments: number
  remainingInstallments: number
  nextPaymentDate: Date | null
  status: 'PAID' | 'PENDING' | 'LATE'
  progress: number // 0-100
}

/**
 * Check if an installment transaction is active in a given month/year
 */
export function isInstallmentActiveInMonth(
  purchaseDate: Date,
  totalInstallments: number,
  year: number,
  month: number, // 1-12
): boolean {
  const purchaseYear = purchaseDate.getFullYear()
  const purchaseMonth = purchaseDate.getMonth() + 1 // 1-12

  // First valid month = purchase month
  const firstMonthTotal = purchaseYear * 12 + purchaseMonth
  // Last valid month = purchase month + totalInstallments - 1
  const lastMonthTotal = firstMonthTotal + totalInstallments - 1

  const targetMonthTotal = year * 12 + month

  return targetMonthTotal >= firstMonthTotal && targetMonthTotal <= lastMonthTotal
}

/**
 * Calculate which installment number is active for a given month/year
 */
export function getInstallmentForMonth(
  purchaseDate: Date,
  totalInstallments: number,
  year: number,
  month: number, // 1-12
): number {
  const purchaseYear = purchaseDate.getFullYear()
  const purchaseMonth = purchaseDate.getMonth() + 1
  const targetMonthTotal = year * 12 + month
  const firstMonthTotal = purchaseYear * 12 + purchaseMonth

  return Math.min(targetMonthTotal - firstMonthTotal + 1, totalInstallments)
}

/**
 * Calculate next payment date based on dueDay
 */
export function getNextPaymentDate(
  purchaseDate: Date,
  dueDay: number,
): Date | null {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Try current month first
  let candidate = new Date(currentYear, currentMonth, dueDay)

  // If dueDay has already passed this month, move to next month
  if (candidate < today) {
    candidate = new Date(currentYear, currentMonth + 1, dueDay)
  }

  // Don't go before purchase date
  if (candidate < purchaseDate) {
    return null
  }

  return candidate
}

/**
 * Calculate current installment and status based on purchase date and dueDay
 */
export function getInstallmentInfo(
  purchaseDate: Date | null,
  totalInstallments: number | null,
  dueDay: number | null,
  dateStr: string | null,
): InstallmentInfo {
  if (!totalInstallments || !purchaseDate || !dueDay) {
    return {
      isInstallment: false,
      currentInstallment: 1,
      totalInstallments: 0,
      paidInstallments: 0,
      remainingInstallments: 0,
      nextPaymentDate: null,
      status: 'PENDING',
      progress: 0,
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate how many months have passed since purchase
  const monthsDiff =
    (today.getFullYear() - purchaseDate.getFullYear()) * 12 +
    (today.getMonth() - purchaseDate.getMonth())

  // Current installment = months passed + 1, capped at totalInstallments
  let currentInstallment = Math.min(monthsDiff + 1, totalInstallments)

  // If the dueDay hasn't arrived yet this month, subtract 1 (still pending)
  const dayOfMonth = today.getDate()
  const isDueDayPast = dayOfMonth > dueDay

  // If we're past the dueDay, this installment counts as current
  if (!isDueDayPast && monthsDiff + 1 <= totalInstallments) {
    // Due day hasn't arrived yet, current is still the previous one
    currentInstallment = Math.max(monthsDiff, 1)
  }

  // If purchase was in a future month, start at 1
  currentInstallment = currentInstallment >= 1 ? currentInstallment : 1

  // If all installments are in the past
  const lastDueDate = new Date(
    purchaseDate.getFullYear(),
    purchaseDate.getMonth() + (totalInstallments - 1) + 1,
    dueDay,
  )

  const paidInstallments = monthsDiff + (isDueDayPast ? 1 : 0)
  const paid = Math.min(paidInstallments, totalInstallments)
  const remaining = Math.max(totalInstallments - paid, 0)

  const nextPaymentDate = getNextPaymentDate(purchaseDate, dueDay)

  // Status
  let status: 'PAID' | 'PENDING' | 'LATE' = 'PENDING'
  if (paid >= totalInstallments) {
    status = 'PAID'
  } else if (nextPaymentDate && nextPaymentDate < today) {
    status = 'LATE'
  }

  const progress = (paid / totalInstallments) * 100

  return {
    isInstallment: true,
    currentInstallment: paid >= totalInstallments ? totalInstallments : paid + 1,
    totalInstallments,
    paidInstallments: paid,
    remainingInstallments: remaining,
    nextPaymentDate,
    status,
    progress: Math.min(progress, 100),
  }
}

/**
 * Format a Date to DD/MM
 */
export function formatShortDate(date: Date, locale: string = 'pt-BR'): string {
  return date.toLocaleDateString(locale.includes('pt') ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'short',
  })
}

/**
 * Recurring payment status for a given month
 */
export interface RecurringStatus {
  isRecurring: boolean
  day: number | null
  status: 'DUE' | 'PAID' | 'UPCOMING'
  daysUntil: number | null
}

export function getRecurringStatusForMonth(recurringDay: number | null, year: number, month: number): RecurringStatus {
  if (!recurringDay) return { isRecurring: false, day: null, status: 'UPCOMING', daysUntil: null }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(year, month - 1, recurringDay)
  if (targetDate.getMonth() !== month - 1) {
    targetDate.setDate(0)
  }

  if (today.getMonth() === month - 1 && today >= targetDate) {
    return { isRecurring: true, day: recurringDay, status: 'PAID', daysUntil: null }
  }

  if (today.getMonth() === month - 1) {
    const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { isRecurring: true, day: recurringDay, status: 'DUE', daysUntil }
  }

  return { isRecurring: true, day: recurringDay, status: 'UPCOMING', daysUntil: null }
}
