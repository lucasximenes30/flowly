import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { createTransaction, getTransactionsByUser, getUserBalance, getMonthlySummary } from '@/services/transaction.service'
import { verifyCardOwnership } from '@/services/card.service'


const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string(),
  isInstallment: z.boolean().optional(),
  totalInstallments: z.number().int().positive().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().int().min(1).max(31).optional().nullable(),
  cardId: z.string().uuid().optional().nullable(),
  paymentMethod: z.string().optional().nullable()
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [transactions, balance, monthly] = await Promise.all([
    getTransactionsByUser(session.userId),
    getUserBalance(session.userId),
    getMonthlySummary(session.userId),
  ])

  return NextResponse.json({ transactions, balance, monthly })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = createSchema.parse(body)
    const { isInstallment, totalInstallments, purchaseDate, dueDay, isRecurring, recurringDay, cardId, ...rest } = data

    // Security: verify the cardId belongs to this user before saving
    if (cardId) {
      const owned = await verifyCardOwnership(cardId, session.userId)
      if (!owned) {
        return NextResponse.json({ success: false, error: 'Card not found' }, { status: 403 })
      }
    }

    const transaction = await createTransaction({
      ...rest,
      userId: session.userId,
      ...(isInstallment !== undefined && { isInstallment }),
      totalInstallments: totalInstallments ?? undefined,
      ...(purchaseDate && { purchaseDate }),
      ...(dueDay && { dueDay }),
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurringDay && { recurringDay }),
      cardId: cardId ?? null,
    })
    return NextResponse.json({ success: true, transaction })
  } catch (error: any) {
    const message = error instanceof z.ZodError
      ? error.errors[0]?.message ?? 'Invalid input'
      : error.message ?? 'Something went wrong'

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    )
  }
}
