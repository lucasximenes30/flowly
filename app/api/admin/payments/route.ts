import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getPaymentTransactions } from '@/services/admin/payment.admin.service'
import { PaymentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || undefined
    const statusParam = searchParams.get('status') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = 50
    const offset = (page - 1) * limit

    // Validate status param
    const validStatuses: PaymentStatus[] = ['PENDING', 'ACTIVE', 'FAILED', 'EXPIRED', 'CANCELED']
    const status = statusParam && validStatuses.includes(statusParam as PaymentStatus)
      ? (statusParam as PaymentStatus)
      : undefined

    const { transactions, total } = await getPaymentTransactions({ userId, status, limit, offset })

    // Serialize Decimal fields
    const serialized = transactions.map((tx) => ({
      ...tx,
      amount: tx.amount != null ? Number(tx.amount) : null,
      paidAt: tx.paidAt?.toISOString() ?? null,
      expiresAt: tx.expiresAt?.toISOString() ?? null,
      createdAt: tx.createdAt.toISOString(),
    }))

    return NextResponse.json({
      transactions: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err: any) {
    console.error('[API /admin/payments] Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
