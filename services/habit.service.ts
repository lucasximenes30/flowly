'use server'

import { prisma } from '@/lib/prisma'

export interface HabitDTO {
  id: string
  title: string
  description?: string
  icon: string
  color: string
  order: number
  streak: number
  createdAt: string
}

export interface CheckinDTO {
  habitId: string
  date: string
  completed: boolean
}

/** Count consecutive completed days going back from today */
function calculateStreak(checkins: { date: string; completed: boolean }[]): number {
  const completedDates = new Set(
    checkins.filter((c) => c.completed).map((c) => c.date)
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (completedDates.has(dateStr)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export async function getHabitsByUser(userId: string): Promise<HabitDTO[]> {
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: {
      checkins: {
        orderBy: { date: 'desc' },
        take: 365,
      },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  return habits.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description ?? undefined,
    icon: h.icon,
    color: h.color,
    order: h.order,
    streak: calculateStreak(h.checkins),
    createdAt: h.createdAt.toISOString(),
  }))
}

export async function createHabit(
  userId: string,
  input: { title: string; description?: string; icon: string; color: string }
): Promise<HabitDTO> {
  const maxOrderHabit = await prisma.habit.findFirst({
    where: { userId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const nextOrder = (maxOrderHabit?.order ?? -1) + 1

  const habit = await prisma.habit.create({
    data: { userId, order: nextOrder, ...input },
  })
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description ?? undefined,
    icon: habit.icon,
    color: habit.color,
    order: habit.order,
    streak: 0,
    createdAt: habit.createdAt.toISOString(),
  }
}

export async function archiveHabit(id: string, userId: string): Promise<void> {
  const habit = await prisma.habit.findUnique({ where: { id } })
  if (!habit || habit.userId !== userId) throw new Error('Habit not found or unauthorized')
  await prisma.habit.update({ where: { id }, data: { isActive: false } })
}

export async function updateHabit(
  id: string,
  userId: string,
  input: { title: string; description?: string; icon: string; color: string }
): Promise<HabitDTO> {
  const existing = await prisma.habit.findUnique({
    where: { id },
    include: { checkins: true },
  })

  if (!existing || existing.userId !== userId) {
    throw new Error('Habit not found or unauthorized')
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: input,
  })

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description ?? undefined,
    icon: updated.icon,
    color: updated.color,
    order: updated.order,
    streak: calculateStreak(existing.checkins),
    createdAt: updated.createdAt.toISOString(),
  }
}

export async function reorderHabits(userId: string, orderedIds: string[]): Promise<void> {
  // Use a transaction to perform bulk update reliably
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.habit.updateMany({
        where: { id, userId },
        data: { order: index },
      })
    )
  )
}

export async function toggleCheckin(
  habitId: string,
  userId: string,
  date: string,
  completed: boolean
): Promise<CheckinDTO> {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } })
  if (!habit || habit.userId !== userId) throw new Error('Habit not found or unauthorized')

  const checkin = await prisma.habitCheckin.upsert({
    where: { habitId_date: { habitId, date } },
    create: { habitId, date, completed },
    update: { completed },
  })

  return { habitId: checkin.habitId, date: checkin.date, completed: checkin.completed }
}

export async function getCheckinsForWeek(
  userId: string,
  dates: string[]
): Promise<CheckinDTO[]> {
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    select: { id: true },
  })
  const habitIds = habits.map((h) => h.id)

  const checkins = await prisma.habitCheckin.findMany({
    where: { habitId: { in: habitIds }, date: { in: dates } },
  })

  return checkins.map((c) => ({
    habitId: c.habitId,
    date: c.date,
    completed: c.completed,
  }))
}
