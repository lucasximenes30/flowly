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
    
    const existing = await prisma.financialGoal.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    const { title, targetAmount, deadline, category, description, color, icon } = data

    const updated = await prisma.financialGoal.update({
      where: { id },
      data: {
        title,
        targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : undefined,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
        category,
        description,
        color,
        icon,
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro ao atualizar meta:', error)
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
    
    const existing = await prisma.financialGoal.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    await prisma.financialGoal.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar meta:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
