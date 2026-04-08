import { NextRequest, NextResponse } from 'next/server'
import { getSession, removeSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: session.userId },
    })

    await removeSession()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Algo deu errado ao excluir a conta' },
      { status: 500 }
    )
  }
}
