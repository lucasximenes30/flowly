import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getActiveWorkoutPlanByUser } from '@/services/workoutPlan.service'
import { getWorkoutDaysByPlan } from '@/services/workoutDay.service'
import { getWorkoutDayExercisesByPlan } from '@/services/workoutDayExercise.service'
import WorkoutClient from './WorkoutClient'

export default async function WorkoutPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const activePlan = await getActiveWorkoutPlanByUser(session.userId)
  const initialDays = activePlan ? await getWorkoutDaysByPlan(session.userId, activePlan.id) : []
  const initialDayExercises = activePlan
    ? await getWorkoutDayExercisesByPlan(session.userId, activePlan.id)
    : []

  return (
    <WorkoutClient
      session={session}
      initialPlan={activePlan}
      initialDays={initialDays}
      initialDayExercises={initialDayExercises}
    />
  )
}
