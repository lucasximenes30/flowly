import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (!yearParam || !monthParam) {
      return NextResponse.json({ error: 'Ano e mês são obrigatórios' }, { status: 400 })
    }

    const year = parseInt(yearParam, 10)
    const month = parseInt(monthParam, 10) // 1-indexed

    // Calculate month boundaries
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    // Fetch all goals for the user
    const goals = await prisma.financialGoal.findMany({
      where: { userId: session.userId },
      include: {
        transactions: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }
      }
    })

    let totalDeposited = 0
    let totalWithdrawn = 0
    let totalAccumulated = 0
    
    const activeGoalsThisMonth: any[] = []

    for (const goal of goals) {
      // Accumulate the overall saved amount
      totalAccumulated += Number(goal.currentAmount)

      // Calculate monthly transactions for this goal
      let goalDeposited = 0
      let goalWithdrawn = 0

      for (const t of goal.transactions) {
        const amount = Number(t.amount)
        if (t.type === 'DEPOSIT') {
          goalDeposited += amount
          totalDeposited += amount
        } else if (t.type === 'WITHDRAW') {
          goalWithdrawn += amount
          totalWithdrawn += amount
        }
      }

      // If the goal had activity this month, add it to the list
      if (goalDeposited > 0 || goalWithdrawn > 0) {
        activeGoalsThisMonth.push({
          id: goal.id,
          title: goal.title,
          color: goal.color,
          icon: goal.icon,
          deposited: goalDeposited,
          withdrawn: goalWithdrawn,
          net: goalDeposited - goalWithdrawn,
          currentAmount: Number(goal.currentAmount),
          targetAmount: Number(goal.targetAmount)
        })
      }
    }

    return NextResponse.json({
      summary: {
        deposited: totalDeposited,
        withdrawn: totalWithdrawn,
        net: totalDeposited - totalWithdrawn,
        accumulated: totalAccumulated
      },
      activeGoals: activeGoalsThisMonth
    })
  } catch (error: any) {
    console.error('Erro ao buscar metas mensais:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
