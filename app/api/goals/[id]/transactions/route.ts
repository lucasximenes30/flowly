import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTransaction } from '@/services/transaction.service'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: goalId } = await params
    const { amount, type = 'DEPOSIT', description, syncWithBalance } = await req.json()

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const parsedAmount = parseFloat(amount)

    // Run within a transaction to ensure goal amount consistency
    const result = await prisma.$transaction(async (tx) => {
      const goal = await tx.financialGoal.findUnique({ where: { id: goalId } })
      if (!goal || goal.userId !== session.userId) {
        throw new Error('Meta não encontrada')
      }

      // Calculate new total
      let newTotal = parseFloat(goal.currentAmount.toString())
      if (type === 'WITHDRAW') {
        newTotal -= parsedAmount
      } else {
        newTotal += parsedAmount
      }

      // Block if total is negative
      if (newTotal < 0) {
        throw new Error('O valor retirado excede o saldo da meta')
      }

      // Create goal transaction
      const goalTx = await tx.goalTransaction.create({
        data: {
          goalId,
          amount: parsedAmount,
          type,
          description
        }
      })

      // Update goal current amount
      await tx.financialGoal.update({
        where: { id: goalId },
        data: { currentAmount: newTotal }
      })

      return { goalTx, goalTitle: goal.title }
    })

    // Se o usuário marcou para descontar/adicionar do saldo principal, criamos uma transação em finanças.
    // Criamos fora do prisma.$transaction principal porque createTransaction pode usar sua própria lógica.
    if (syncWithBalance) {
      const transactionType = type === 'DEPOSIT' ? 'EXPENSE' : 'INCOME'
      const transactionTitle = type === 'DEPOSIT' 
        ? `Depósito na Meta: ${result.goalTitle}`
        : `Retirada da Meta: ${result.goalTitle}`
        
      await createTransaction({
        title: transactionTitle,
        amount: parsedAmount,
        type: transactionType,
        category: 'Investment', // Usando a categoria de Investimento acordada
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        userId: session.userId,
      })
    }

    return NextResponse.json(result.goalTx)
  } catch (error: any) {
    console.error('Erro ao adicionar transação na meta:', error)
    if (error.message === 'Meta não encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error.message === 'O valor retirado excede o saldo da meta') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
