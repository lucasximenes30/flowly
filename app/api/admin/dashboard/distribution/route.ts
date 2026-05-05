import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUsersDistribution } from '@/services/admin/dashboard.service'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dist = await getUsersDistribution()
    return NextResponse.json(dist)
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Something went wrong' }, { status: 400 })
  }
}
