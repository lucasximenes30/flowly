import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction || transaction.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao remover transação' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { title, amount, type, category, date, isInstallment, totalInstallments, purchaseDate, dueDay, isRecurring, recurringDay } = body

  if (!title || typeof title !== 'string') return NextResponse.json({ error: 'Título inválido' }, { status: 400 })
  if (!amount || typeof amount !== 'number' || amount <= 0) return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  if (!type || !['INCOME', 'EXPENSE'].includes(type)) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  if (!category) return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
  if (!date) return NextResponse.json({ error: 'Data inválida' }, { status: 400 })

  try {
    const { updateTransaction } = await import('@/services/transaction.service')
    const transaction = await updateTransaction(id, session.userId, {
      title,
      amount,
      type,
      category,
      date,
      ...(isInstallment !== undefined && { isInstallment }),
      totalInstallments: totalInstallments ?? undefined,
      purchaseDate,
      dueDay,
      ...(isRecurring !== undefined && { isRecurring }),
      ...(recurringDay !== undefined && { recurringDay: recurringDay ?? undefined }),
    })

    return NextResponse.json({ success: true, transaction })
  } catch {
    return NextResponse.json({ error: 'Transação não encontrada ou erro ao atualizar' }, { status: 404 })
  }
}
