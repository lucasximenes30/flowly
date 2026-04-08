import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { cancelRecurring } from '@/services/transaction.service'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const result = await cancelRecurring(id, session.userId)
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? 'Erro ao cancelar recorrencia' },
      { status: 400 }
    )
  }
}
