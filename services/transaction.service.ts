'use server'

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { isInstallmentActiveInMonth, getInstallmentForMonth, getRecurringStatusForMonth } from '@/lib/installments'

export interface CreateTransactionInput {
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  userId: string
  isInstallment?: boolean
  totalInstallments?: number
  purchaseDate?: string
  dueDay?: number
  isRecurring?: boolean
  recurringDay?: number
  cardId?: string | null
}

export interface UpdateTransactionInput {
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  isInstallment?: boolean
  totalInstallments?: number
  purchaseDate?: string
  dueDay?: number
  isRecurring?: boolean
  recurringDay?: number
}

export async function createTransaction(input: CreateTransactionInput) {
  const installmentAmount =
    input.isInstallment && input.totalInstallments
      ? input.amount / input.totalInstallments
      : null

  return prisma.transaction.create({
    data: {
      title: input.title,
      amount: new Decimal(input.amount),
      installmentAmount: installmentAmount ? new Decimal(installmentAmount) : null,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      userId: input.userId,
      ...(input.isInstallment !== undefined && { isInstallment: input.isInstallment }),
      ...(input.totalInstallments !== undefined && { totalInstallments: input.totalInstallments }),
      ...(input.purchaseDate && { purchaseDate: new Date(input.purchaseDate) }),
      ...(input.dueDay !== undefined && { dueDay: input.dueDay }),
      ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
      ...(input.recurringDay !== undefined && { recurringDay: input.recurringDay }),
      ...(input.cardId !== undefined && { cardId: input.cardId ?? null }),
    },
  })
}

export async function updateTransaction(id: string, userId: string, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw new Error('Transaction not found or unauthorized')
  }

  const installmentAmount =
    input.isInstallment && input.totalInstallments
      ? input.amount / input.totalInstallments
      : null

  const recurringDay = 'recurringDay' in input ? input.recurringDay : undefined

  return prisma.transaction.update({
    where: { id },
    data: {
      title: input.title,
      amount: new Decimal(input.amount),
      installmentAmount: installmentAmount ? new Decimal(installmentAmount) : null,
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      ...(input.isInstallment !== undefined && { isInstallment: input.isInstallment }),
      totalInstallments: input.totalInstallments ?? null,
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      dueDay: input.dueDay ?? null,
      ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
      ...(recurringDay !== undefined && { recurringDay: recurringDay ?? null }),
    },
  })
}

export interface CancelRecurringResult {
  isActive: false
  endDate: Date
  message: string
  monthExcluded: boolean
}

/**
 * Cancel a recurring transaction with correct financial behavior.
 *
 * Case 1 (current day >= recurringDay): this month already counted.
 *   endDate = last day of current month.
 * Case 2 (current day < recurringDay): current month should not be counted.
 *   endDate = today.
 */
export async function cancelRecurring(
  id: string,
  userId: string,
): Promise<CancelRecurringResult> {
  const tx = await prisma.transaction.findUnique({ where: { id } })
  if (!tx || tx.userId !== userId) {
    throw new Error('Transaction not found or unauthorized')
  }
  if (!tx.isRecurring) {
    throw new Error('Transaction is not recurring')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfMonth = today.getDate()
  const rDay = tx.recurringDay ?? 1

  let endDate: Date
  let message: string
  if (dayOfMonth >= rDay) {
    // Current month already counted — end at last day of this month
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    message =
      'Cancelamento concluído, mas o pagamento deste mês já foi considerado.'
    await prisma.transaction.update({
      where: { id },
      data: { isActive: false, endDate },
    })
    return { isActive: false, endDate, message, monthExcluded: false }
  } else {
    // Current month should NOT be counted
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    message =
      'Recorrência cancelada. Nenhum pagamento será considerado este mês.'
    await prisma.transaction.update({
      where: { id },
      data: { isActive: false, endDate },
    })
    return { isActive: false, endDate, message, monthExcluded: true }
  }
}

export async function getTransactionsByUser(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })
}

export async function getUserBalance(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { amount: true, type: true, isInstallment: true, installmentAmount: true, isRecurring: true },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => {
      const value = t.isInstallment && t.installmentAmount ? Number(t.installmentAmount) : Number(t.amount)
      return sum + value
    }, 0)

  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => {
      const value = t.isInstallment && t.installmentAmount ? Number(t.installmentAmount) : Number(t.amount)
      return sum + value
    }, 0)

  return { income, expense, balance: income - expense }
}

export async function getMonthlySummary(userId: string) {
  const now = new Date()
  return getMonthSummary(userId, now.getFullYear(), now.getMonth() + 1)
}

// 🆕 Get transactions for a specific month (installment + recurring aware)
export async function getTransactionsByMonth(userId: string, year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  // Non-installment, non-recurring transactions for the target month
  const nonInstallments = await prisma.transaction.findMany({
    where: {
      userId,
      isInstallment: false,
      isRecurring: false,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: { date: 'desc' },
  })

  // Installment transactions
  const installmentCandidates = await prisma.transaction.findMany({
    where: {
      userId,
      isInstallment: true,
    },
    orderBy: { date: 'desc' },
  })

  const activeInstallments = installmentCandidates.filter((t) =>
    t.isInstallment && t.totalInstallments && t.purchaseDate
      ? isInstallmentActiveInMonth(new Date(t.purchaseDate), t.totalInstallments, year, month)
      : false,
  )

  // Recurring transactions — always included if active or endDate covers this month
  const recurring = await prisma.transaction.findMany({
    where: {
      userId,
      isRecurring: true,
    },
    orderBy: { date: 'desc' },
  })

  const activeRecurring = recurring.filter((t) => {
    if (!t.isActive) return false
    if (t.endDate) {
      return t.endDate >= startOfMonth
    }
    return true
  })

  // Merge and mark with current installment info
  const enrichedActiveInstallments = activeInstallments.map((t) => ({
    ...t,
    _activeInstallment: getInstallmentForMonth(
      new Date(t.purchaseDate!),
      t.totalInstallments!,
      year,
      month,
    ),
  }))

  // Enrich recurring with payment status for the month
  const enrichedRecurring = activeRecurring.map((t) => ({
    ...t,
    _recurringStatus: getRecurringStatusForMonth(t.recurringDay, year, month),
  }))

  return [...enrichedActiveInstallments, ...nonInstallments, ...enrichedRecurring]
}

// 🆕 Get monthly summary for any month (installment + recurring aware)
export async function getMonthSummary(userId: string, year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  const nonInstallments = await prisma.transaction.findMany({
    where: {
      userId,
      isInstallment: false,
      isRecurring: false,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const installments = await prisma.transaction.findMany({
    where: {
      userId,
      isInstallment: true,
    },
  })

  const recurring = await prisma.transaction.findMany({
    where: {
      userId,
      isRecurring: true,
    },
  })

  const activeRecurring = recurring.filter((t) => {
    if (!t.isActive) return false
    if (t.endDate) {
      return t.endDate >= startOfMonth
    }
    return true
  })

  return computeMonthSummary(installments, nonInstallments, year, month, activeRecurring)
}

// Pure function to compute a month's summary from transaction lists
function computeMonthSummary(
  installments: Array<{ type: string; installmentAmount: Decimal | null; isInstallment: boolean; totalInstallments: number | null; purchaseDate: Date | null }>,
  nonInstallments: Array<{ type: string; amount: Decimal }>,
  year: number,
  month: number, // 1-12
  recurring?: Array<{ type: string; amount: Decimal }>,
) {
  let income = 0
  let expense = 0
  let count = 0

  // Active installments for this month contribute their per-installment amount
  for (const t of installments) {
    if (t.isInstallment && t.totalInstallments && t.purchaseDate) {
      if (isInstallmentActiveInMonth(new Date(t.purchaseDate), t.totalInstallments, year, month)) {
        const value = t.installmentAmount ? Number(t.installmentAmount) : 0
        if (t.type === 'INCOME') {
          income += value
        } else {
          expense += value
        }
        count++
      }
    }
  }

  // Non-installment transactions from the target month
  for (const t of nonInstallments) {
    const value = Number(t.amount)
    if (t.type === 'INCOME') {
      income += value
    } else {
      expense += value
    }
    count++
  }

  // Recurring transactions — always included with full amount
  if (recurring) {
    for (const t of recurring) {
      const value = Number(t.amount)
      if (t.type === 'INCOME') {
        income += value
      } else {
        expense += value
      }
      count++
    }
  }

  return { income, expense, balance: income - expense, transactionCount: count }
}

// 🆕 Get comparison between selected month and previous month (installment-aware)
export async function getMonthComparison(userId: string, refYear: number, refMonth: number) {
  const currentSummary = await getMonthSummary(userId, refYear, refMonth)

  let prevYear = refYear
  let prevMonth = refMonth - 1
  if (prevMonth < 1) {
    prevMonth = 12
    prevYear--
  }

  const previousSummary = await getMonthSummary(userId, prevYear, prevMonth)

  return {
    current: { year: refYear, month: refMonth, ...currentSummary },
    previous: { year: prevYear, month: prevMonth, ...previousSummary },
    comparison: {
      incomeChange: currentSummary.income - previousSummary.income,
      expenseChange: currentSummary.expense - previousSummary.expense,
      balanceChange: currentSummary.balance - previousSummary.balance,
    },
  }
}

// 🆕 Get available months — scoped strictly to the authenticated user's data.
// Only expands recurring months if the user actually has recurring transactions.
// Always includes current month as minimum (for new users with no data).
export async function getAvailableMonths(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { date: true, isInstallment: true, isRecurring: true, totalInstallments: true, purchaseDate: true },
    orderBy: { date: 'desc' },
  })

  const months = new Set<string>()

  // Always include current month so new users always see at least one option
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  months.add(currentYM)

  // If user has no transactions at all, return only current month
  if (transactions.length === 0) {
    return [currentYM]
  }

  // Add months from regular (non-installment, non-recurring) transactions
  transactions.forEach((t) => {
    if (!t.isInstallment && !t.isRecurring) {
      const year = t.date.getFullYear()
      const month = t.date.getMonth() + 1
      months.add(`${year}-${String(month).padStart(2, '0')}`)
    }
  })

  // Expand installment transactions to cover all months in their timeline
  for (const t of transactions) {
    if (t.isInstallment && t.totalInstallments && t.purchaseDate) {
      const pd = new Date(t.purchaseDate)
      const firstYear = pd.getFullYear()
      const firstMonth = pd.getMonth() + 1

      for (let i = 0; i < t.totalInstallments; i++) {
        const m = firstMonth + i
        const y = firstYear + Math.floor((m - 1) / 12)
        const actualMonth = ((m - 1) % 12) + 1
        months.add(`${y}-${String(actualMonth).padStart(2, '0')}`)
      }
    }
  }

  // Only add the rolling 6-month window if this user actually has recurring transactions.
  // This prevents new users or non-recurring users from seeing months they have no data for.
  const hasRecurring = transactions.some((t) => t.isRecurring)
  if (hasRecurring) {
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
  }

  return Array.from(months).sort().reverse()
}

// 🆕 Get expenses by category for a specific month (installment + recurring aware)
export async function getExpensesByCategory(userId: string, year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  const nonInstallments = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      isInstallment: false,
      isRecurring: false,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      category: true,
      amount: true,
    },
  })

  const installments = await prisma.transaction.findMany({
    where: {
      userId,
      isInstallment: true,
    },
    select: {
      category: true,
      installmentAmount: true,
      totalInstallments: true,
      purchaseDate: true,
      type: true,
    },
  })

  const recurring = await prisma.transaction.findMany({
    where: {
      userId,
      isRecurring: true,
      type: 'EXPENSE',
    },
    select: {
      category: true,
      amount: true,
      isActive: true,
      endDate: true,
    },
  })

  const categoryMap = new Map<string, number>()

  for (const t of nonInstallments) {
    const current = categoryMap.get(t.category) ?? 0
    categoryMap.set(t.category, current + Number(t.amount))
  }

  for (const t of installments) {
    if (t.totalInstallments && t.purchaseDate) {
      if (isInstallmentActiveInMonth(new Date(t.purchaseDate), t.totalInstallments, year, month)) {
        const value = t.installmentAmount ? Number(t.installmentAmount) : 0
        const current = categoryMap.get(t.category) ?? 0
        categoryMap.set(t.category, current + value)
      }
    }
  }

  // Add active recurring expenses
  const activeRecurring = recurring.filter((t) => {
    if (!t.isActive) return false
    if (t.endDate) {
      const startOfMonth = new Date(year, month - 1, 1)
      return t.endDate >= startOfMonth
    }
    return true
  })

  for (const t of activeRecurring) {
    const current = categoryMap.get(t.category) ?? 0
    categoryMap.set(t.category, current + Number(t.amount))
  }

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

// 🆕 Get monthly trend data (last 6 months) — installment-aware
export async function getMonthlyTrend(userId: string) {
  const now = new Date()
  const months: { year: number; month: number; label: string }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }),
    })
  }

  const result: { month: string; income: number; expense: number }[] = []

  for (const m of months) {
    const summary = await getMonthSummary(userId, m.year, m.month)
    result.push({
      month: m.label,
      income: summary.income,
      expense: summary.expense,
    })
  }

  return result
}
