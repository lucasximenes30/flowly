export interface Notification {
  id: string
  title: string
  description: string
  type: 'upcoming' | 'today' | 'late'
  days: number
  sourceTxId: string
}

/**
 * Calculate the next due date based on dueDay and current date.
 * Returns a Date for the next occurrence of dueDay.
 */
function getNextDueDate(dueDay: number): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const currentDay = now.getDate()
  const year = now.getFullYear()
  const month = now.getMonth()

  // If dueDay hasn't happened yet this month, use current month
  if (dueDay >= currentDay) {
    return new Date(year, month, dueDay)
  }
  // Otherwise, next month
  return new Date(year, month + 1, dueDay)
}

/**
 * Determine days difference between today and the next due date.
 * Positive = future, 0 = today, negative = late (already passed).
 */
function daysDifference(dueDay: number): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const nextDue = getNextDueDate(dueDay)
  const diff = Math.round((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // If the next due date is exactly 30 days away, the actual due date already passed this month
  if (diff === 30 || diff === 31 || diff === 29 || diff === 28) {
    const candidate = new Date(now.getFullYear(), now.getMonth(), dueDay)
    if (candidate < now) {
      // Already passed this month, it's late
      return -1 * Math.round((now.getTime() - candidate.getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  return diff
}

/**
 * Check if an installment is still active (not all installments paid).
 */
function isInstallmentActive(
  purchaseDate: Date | null,
  totalInstallments: number | null,
  dueDay: number | null,
): boolean {
  if (!totalInstallments || !purchaseDate || !dueDay) return false

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const pd = new Date(purchaseDate)
  pd.setHours(0, 0, 0, 0)

  // Calculate last payment date
  const lastMonth = pd.getMonth() + totalInstallments - 1
  const lastDate = new Date(pd.getFullYear(), lastMonth, dueDay)

  return now <= lastDate
}

/**
 * Generate notifications dynamically from transactions.
 * No persistence, no cron — computed on the fly.
 */
export function generateNotifications(
  transactions: Array<{
    id: string
    title: string
    type: string
    isInstallment: boolean
    isRecurring: boolean
    dueDay: number | null
    recurringDay: number | null
    totalInstallments: number | null
    purchaseDate: Date | null
    isActive: boolean
    endDate: Date | null
    cardId?: string | null
    amount?: number | string | null
  }>,
  cards: Array<{
    id: string
    name: string
    lastFourDigits: string
    dueDay: number
    closingDay: number
    limitAmount?: number | string | null
  }> = [],
  today?: Date,
): Notification[] {
  const now = today ?? new Date()
  now.setHours(0, 0, 0, 0)
  const todayDay = now.getDate()

  const notifications: Notification[] = []

  for (const tx of transactions) {
    if (tx.type !== 'EXPENSE') continue

    // --- Recurring transactions ---
    if (tx.isRecurring) {
      if (!tx.isActive) continue
      if (tx.endDate && tx.endDate < now) continue
      if (!tx.recurringDay) continue

      const diff = getDaysDiffForDay(now, tx.recurringDay)
      const type = diff > 0 && diff <= 5 ? 'upcoming' : diff === 0 ? 'today' : diff < 0 ? 'late' : null

      if (type) {
        const absDays = Math.abs(diff)
        notifications.push({
          id: `recurring-${tx.id}`,
          title: tx.title,
          description: getDescription(type, absDays),
          type,
          days: absDays,
          sourceTxId: tx.id,
        })
      }
    }

    // --- Installment transactions ---
    if (tx.isInstallment && tx.dueDay) {
      if (!isInstallmentActive(tx.purchaseDate, tx.totalInstallments, tx.dueDay)) continue

      const diff = getDaysDiffForDay(now, tx.dueDay)
      const type = diff > 0 && diff <= 5 ? 'upcoming' : diff === 0 ? 'today' : diff < 0 ? 'late' : null

      if (type) {
        let displayTitle = tx.title
        if (tx.cardId) {
          const card = cards.find(c => c.id === tx.cardId)
          if (card) {
             displayTitle = `${tx.title} (Cartão **** ${card.lastFourDigits})`
          }
        }

        const absDays = Math.abs(diff)
        notifications.push({
          id: `installment-${tx.id}`,
          title: displayTitle,
          description: getDescription(type, absDays),
          type,
          days: absDays,
          sourceTxId: tx.id,
        })
      }
    }
  }

  // --- Card Bills (Fatura do Cartão) & Limits ---
  for (const card of cards) {
    // 1. Check Due Date
    const diff = getDaysDiffForDay(now, card.dueDay)
    const type = diff > 0 && diff <= 5 ? 'upcoming' : diff === 0 ? 'today' : diff < 0 ? 'late' : null
    
    if (type) {
      const absDays = Math.abs(diff)
      notifications.push({
        id: `cardbill-${card.id}`,
        title: `Fatura ${card.name} (**** ${card.lastFourDigits})`,
        description: getDescription(type, absDays),
        type,
        days: absDays,
        sourceTxId: card.id,
      })
    }

    // 2. Check Limit Usage
    const cardLimit = card.limitAmount ? Number(card.limitAmount) : 0
    if (cardLimit > 0) {
      // Calculate used limit: all pending expenses on this card
      const usedLimit = transactions
        .filter(tx => tx.cardId === card.id && tx.type === 'EXPENSE')
        .reduce((sum, tx) => {
           // For installments, we count the full amount for limit purposes? 
           // Or just the remaining installments? 
           // Standard banking: the full amount of the purchase blocks the limit.
           return sum + Number(tx.amount || 0)
        }, 0)

      const usagePercent = (usedLimit / cardLimit) * 100
      if (usagePercent >= 85) {
        notifications.push({
          id: `cardlimit-${card.id}`,
          title: `Limite alto: ${card.name}`,
          description: `Você já utilizou ${usagePercent.toFixed(0)}% do limite do seu cartão.`,
          type: 'upcoming', // Use 'upcoming' as a warning
          days: 0,
          sourceTxId: card.id,
        })
      }
    }
  }

  // Sort: late first, then today, then upcoming (by days)
  const order = { late: 0, today: 1, upcoming: 2 }
  notifications.sort((a, b) => {
    const typeOrder = order[a.type] - order[b.type]
    if (typeOrder !== 0) return typeOrder
    return a.days - b.days
  })

  return notifications
}

/**
 * Calculate days difference for a given day-of-month relative to today.
 * Returns: 0 if today is the due day, positive if upcoming, negative if late.
 */
function getDaysDiffForDay(now: Date, dayOfMonth: number): number {
  const todayDay = now.getDate()

  if (dayOfMonth === todayDay) return 0

  // This month's due date
  const thisMonthDue = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)

  if (thisMonthDue > now) {
    // Upcoming this month
    return Math.round((thisMonthDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Past this month — calculate how many days late
  const daysLate = Math.round((now.getTime() - thisMonthDue.getTime()) / (1000 * 60 * 60 * 24))

  // If only 1-2 days late, we could still show "upcoming" for next month
  // But if we're within the 5-day window looking ahead at next month:
  const nextMonthDue = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth)
  const daysToNext = Math.round((nextMonthDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // If both late and the next one is within 5 days, show late (it's still late!)
  // We only show upcoming if days late <= (next month distance - 5), i.e., not meaningfully late
  if (daysLate <= 2 && daysToNext <= 5) {
    // Edge case: just passed but next one is close — still show as late
    // since the previous one is overdue
  }

  // Show as upcoming for next month only if less than 3 days late
  if (daysLate <= 3 && daysToNext <= 5) {
    return daysToNext
  }

  return -daysLate
}

/**
 * Generate Portuguese description for notification type.
 */
function getDescription(type: 'upcoming' | 'today' | 'late', days: number): string {
  switch (type) {
    case 'upcoming':
      if (days === 1) return 'Falta 1 dia para o pagamento'
      return `Faltam ${days} dias para o pagamento`
    case 'today':
      return 'Pagamento vence hoje'
    case 'late':
      if (days === 1) return 'Atrasado há 1 dia'
      return `Atrasado há ${days} dias`
  }
}
