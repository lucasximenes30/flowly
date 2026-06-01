import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { createTransaction } from '@/services/abacatepay.service'

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
    // ── Get session ───────────────────────────────────────────────────────
    const session = await getSession()
    
    if (!session) {
      console.log('[Payments/Create] 401 - No session found in cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Payments/Create] Session found:', {
      userId: session.userId,
      email: session.email,
      subscriptionStatus: session.subscriptionStatus,
      role: session.role,
    })

    // ── Get user from database ────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      console.log('[Payments/Create] 404 - User not found in database:', session.userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('[Payments/Create] User authenticated:', {
      userId: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      role: user.role,
      hasDocument: !!user.document,
    })

    const ip = getClientIp(req)
    
    // Attempt to parse body for planTier
    let planTier: 'vip' | 'pro' = 'vip'
    try {
      const body = await req.json()
      if (body.planTier === 'pro' || body.planTier === 'vip') {
        planTier = body.planTier
      }
    } catch (e) {
      // Body might be empty, ignore
    }

    console.log('[Payments/Create] Calling AbacatePay API...')
    const paymentData = await createTransaction({
      id: user.id,
      email: user.email,
      name: user.name,
      document: user.document ?? null,
      phone: null,
      ip,
      planTier,
    })

    console.log('[Payments/Create] ✓ Payment created successfully, returning redirect URL')
    
    return NextResponse.json({
      ok: true,
      provider: 'abacatepay',
      status: paymentData.status,
      redirectUrl: paymentData.url,
    }, { status: 200 })
  } catch (err: any) {
    // ── Missing document — friendly user-facing message ───────────────────
    if (err?.code === 'MISSING_DOCUMENT') {
      console.log('[Payments/Create] 422 - User missing CPF')
      return NextResponse.json(
        {
          error:
            'Para gerar o pagamento, precisamos do seu CPF. Por favor, complete seu cadastro com o CPF antes de prosseguir.',
          code: 'MISSING_DOCUMENT',
        },
        { status: 422 },
      )
    }

    // ── AbacatePay provider validation error ───────────────────────────
    if (err?.isProviderError) {
      console.error('[Payments/Create] 5xx - Provider error:', {
        details: err.details,
      })
      return NextResponse.json(
        {
          error:
            'Não foi possível gerar o pagamento agora. Tente novamente em alguns instantes.',
          details: process.env.NODE_ENV !== 'production' ? err.details : undefined,
        },
        { status: 502 },
      )
    }

    // ── Unexpected error ──────────────────────────────────────────────────
    console.error('[Payments/Create] 500 - Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
