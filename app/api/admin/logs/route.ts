import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getAdminLogs } from '@/services/admin/admin.log.service'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = 50
    const offset = (page - 1) * limit

    const { logs, total } = await getAdminLogs({ targetUserId, limit, offset })

    const serialized = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }))

    return NextResponse.json({
      logs: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err: any) {
    console.error('[API /admin/logs] Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
