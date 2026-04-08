import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getHabitsByUser, getCheckinsForWeek } from '@/services/habit.service'
import HabitsClient from './HabitsClient'

/** Returns the 7 dates (YYYY-MM-DD) of the current week, Sun → Sat */
function getWeekDates(): string[] {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - day)

  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    // Use local date to avoid timezone shift
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${day}`)
  }
  return dates
}

export default async function HabitsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const weekDates = getWeekDates()
  const [habits, checkins] = await Promise.all([
    getHabitsByUser(session.userId),
    getCheckinsForWeek(session.userId, weekDates),
  ])

  return (
    <HabitsClient
      session={session}
      initialHabits={habits}
      initialCheckins={checkins}
      weekDates={weekDates}
    />
  )
}
