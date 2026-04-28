import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createTransaction } from '@/services/blackpayments.service'

const prisma = new PrismaClient()

/** Extract best-effort client IP from Next.js request headers */
function getClientIp(req: NextRequest): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null
  )
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const ip = getClientIp(req)

    const paymentData = await createTransaction({
      id: user.id,
      email: user.email,
      name: user.name,
      document: user.document ?? null,
      phone: null, // User model has no phone field yet; add when available
      ip,
    })

    return NextResponse.json({ success: true, data: paymentData }, { status: 200 })
  } catch (err: any) {
    // ── Missing document — friendly user-facing message ───────────────────
    if (err?.code === 'MISSING_DOCUMENT') {
      return NextResponse.json(
        {
          error:
            'Para gerar o pagamento, precisamos do seu CPF. Por favor, complete seu cadastro com o CPF antes de prosseguir.',
          code: 'MISSING_DOCUMENT',
        },
        { status: 422 },
      )
    }

    // ── BlackPayments provider validation error ───────────────────────────
    if (err?.isProviderError) {
      console.error('[Payments/Create] Provider error:', {
        status: err.status,
        details: err.details,
      })
      return NextResponse.json(
        {
          error:
            'Não foi possível gerar o pagamento agora. Tente novamente em alguns instantes.',
          // Expose provider details in non-production for easier debugging
          details: process.env.NODE_ENV !== 'production' ? err.details : undefined,
        },
        { status: err.status || 502 },
      )
    }

    // ── Unexpected error ──────────────────────────────────────────────────
    console.error('[Payments/Create] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
