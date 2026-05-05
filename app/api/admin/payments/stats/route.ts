import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getDashboardPaymentStats } from '@/services/admin/payment.admin.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const stats = await getDashboardPaymentStats()
    return NextResponse.json(stats)
  } catch (err: any) {
    console.error('[API /admin/payments/stats] Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
