'use server'

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export interface CreateTransactionInput {
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  userId: string
}

export async function createTransaction(input: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      title: input.title,
      amount: new Decimal(input.amount),
      type: input.type,
      category: input.category,
      date: new Date(input.date),
      userId: input.userId,
    },
  })
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
    select: { amount: true, type: true },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { income, expense, balance: income - expense }
}

export async function getMonthlySummary(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { income, expense, balance: income - expense, transactionCount: transactions.length }
}

// 🆕 Get transactions for a specific month/year
export async function getTransactionsByMonth(userId: string, year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: { date: 'desc' },
  })
}

// 🆕 Get monthly summary for any month
export async function getMonthSummary(userId: string, year: number, month: number) {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { income, expense, balance: income - expense, transactionCount: transactions.length }
}

// 🆕 Get comparison between current month and previous month
export async function getMonthComparison(userId: string) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const previousMonthDate = new Date(currentYear, currentMonth - 2, 1)
  const previousMonth = previousMonthDate.getMonth() + 1
  const previousYear = previousMonthDate.getFullYear()

  const currentSummary = await getMonthSummary(userId, currentYear, currentMonth)
  const previousSummary = await getMonthSummary(userId, previousYear, previousMonth)

  return {
    current: { year: currentYear, month: currentMonth, ...currentSummary },
    previous: { year: previousYear, month: previousMonth, ...previousSummary },
    comparison: {
      incomeChange: currentSummary.income - previousSummary.income,
      expenseChange: currentSummary.expense - previousSummary.expense,
      balanceChange: currentSummary.balance - previousSummary.balance,
    },
  }
}

// 🆕 Get available months (years/months with transactions)
export async function getAvailableMonths(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'desc' },
  })

  const months = new Set<string>()
  transactions.forEach((t) => {
    const year = t.date.getFullYear()
    const month = t.date.getMonth() + 1
    months.add(`${year}-${String(month).padStart(2, '0')}`)
  })

  return Array.from(months).sort().reverse()
}
