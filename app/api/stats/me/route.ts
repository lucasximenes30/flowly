import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserStats } from '@/services/userStats.service'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const stats = await getUserStats(session.userId)
    return NextResponse.json({ stats })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
