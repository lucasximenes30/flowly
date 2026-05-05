import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { resetUserPasswordAdmin } from '@/services/admin/user.admin.service'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const rawPassword = await resetUserPasswordAdmin(id)

    return NextResponse.json({ success: true, tempPassword: rawPassword })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Something went wrong' }, { status: 400 })
  }
}
