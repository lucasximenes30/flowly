import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTodayWorkoutLog } from '@/services/workoutLog.service'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workoutId = request.nextUrl.searchParams.get('workoutId') ?? undefined

  try {
    const workoutLog = await getTodayWorkoutLog(session.userId, { workoutId })
    return NextResponse.json({ workoutLog })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
