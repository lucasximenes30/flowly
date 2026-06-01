import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()
    
    const existing = await prisma.note.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Nota não encontrada' }, { status: 404 })
    }

    const { title, content, category, color, isPinned, financialGoalId, eventId, transactionId } = data

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        category,
        color,
        isPinned,
        financialGoalId,
        eventId,
        transactionId
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro ao atualizar nota:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    
    const existing = await prisma.note.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Nota não encontrada' }, { status: 404 })
    }

    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar nota:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
