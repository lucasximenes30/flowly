import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const goals = await prisma.financialGoal.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: {
          orderBy: { date: 'desc' }
        }
      }
    })

    return NextResponse.json(goals)
  } catch (error: any) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await req.json()
    const { title, targetAmount, deadline, category, description, color, icon } = data

    if (!title || !targetAmount) {
      return NextResponse.json({ error: 'Título e valor alvo são obrigatórios' }, { status: 400 })
    }

    const goal = await prisma.financialGoal.create({
      data: {
        userId: session.userId,
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        deadline: deadline ? new Date(deadline) : null,
        category,
        description,
        color: color || 'bg-brand-500',
        icon: icon || 'Target',
      }
    })

    return NextResponse.json(goal)
  } catch (error: any) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

