import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getWorkoutRanking } from '@/services/userStats.service'

function parseLimit(value: string | null): number | undefined {
  if (!value) return undefined

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined

  return parsed
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const limit = parseLimit(request.nextUrl.searchParams.get('limit'))
    const result = await getWorkoutRanking({
      limit,
      currentUserId: session.userId,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
