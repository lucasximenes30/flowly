import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createTransaction } from '@/services/blackpayments.service'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const paymentData = await createTransaction({
      id: user.id,
      email: user.email,
      name: user.name
    })

    return NextResponse.json({ success: true, data: paymentData }, { status: 200 })
  } catch (err: any) {
    console.error('[BlackPayments Create] Error:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
