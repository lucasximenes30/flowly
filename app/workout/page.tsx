import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getActiveWorkoutPlanByUser } from '@/services/workoutPlan.service'
import WorkoutClient from './WorkoutClient'

export default async function WorkoutPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const activePlan = await getActiveWorkoutPlanByUser(session.userId)

  return <WorkoutClient session={session} initialPlan={activePlan} />
}
