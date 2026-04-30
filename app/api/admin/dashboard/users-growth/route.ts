import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUsersGrowth } from '@/services/admin/dashboard.service'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysStr = searchParams.get('days')
    const days = daysStr ? parseInt(daysStr, 10) : 30

    const growth = await getUsersGrowth(days)
    return NextResponse.json(growth)
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Something went wrong' }, { status: 400 })
  }
}
