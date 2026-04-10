import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { deleteCard } from '@/services/card.service'
import { updateCard } from '@/services/card.service'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await deleteCard(id, session.userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const data = await request.json()
    const updated = await updateCard(id, session.userId, data)
    return NextResponse.json({ success: true, card: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}
