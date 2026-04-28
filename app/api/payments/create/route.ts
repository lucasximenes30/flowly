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

/** Normalize BlackPayments response to predictable shape */
function normalizePaymentResponse(rawResponse: any) {
  const transactionId = rawResponse.id || ''
  const status = rawResponse.status || 'waiting_payment'
  const paymentMethod = rawResponse.paymentMethod || 'pix'
  const redirectUrl = rawResponse.redirectUrl || null
  
  // Defensively extract Pix data from possible locations
  const pixData = rawResponse.pix || rawResponse.data?.pix || rawResponse.data || {}
  
  // Try to find QR Code and Copy-Paste from common field names
  const rawQrcode = pixData.qrcode || pixData.qrCode || pixData.qr_code || pixData.code || ''
  const rawCopyPaste = pixData.copyPaste || pixData.copiaECola || pixData.payload || pixData.pix_link || ''
  
  // Combine them: if we only got one, use it for both so frontend doesn't break
  const qrcode = rawQrcode || rawCopyPaste
  const copyPaste = rawCopyPaste || rawQrcode
  
  // Extract expiration date
  const expirationDate = pixData.expirationDate || pixData.expires_at || pixData.expiration_date || ''
  
  // Log what we extracted
  console.log('[Payments/Create] Normalized response:', {
    transactionIdExists: !!transactionId,
    status,
    paymentMethod,
    pixFieldsFound: Object.keys(pixData),
    pixQrcodeExists: !!qrcode,
    pixCopyPasteExists: !!copyPaste,
    redirectUrlExists: !!redirectUrl,
  })
  
  return {
    ok: true,
    provider: 'blackpayments',
    status,
    paymentMethod,
    transactionId,
    pix: {
      qrcode,
      expirationDate,
      copyPaste,
    },
    redirectUrl,
  }
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

    console.log('[Payments/Create] Calling BlackPayments API...')
    const paymentData = await createTransaction({
      id: user.id,
      email: user.email,
      name: user.name,
      document: user.document ?? null,
      phone: null,
      ip,
    })

    const normalizedResponse = normalizePaymentResponse(paymentData)
    console.log('[Payments/Create] ✓ Payment created successfully, returning normalized response')
    
    return NextResponse.json(normalizedResponse, { status: 200 })
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

    // ── BlackPayments provider validation error ───────────────────────────
    if (err?.isProviderError) {
      console.error('[Payments/Create] 5xx - Provider error:', {
        status: err.status,
        details: err.details,
      })
      return NextResponse.json(
        {
          error:
            'Não foi possível gerar o pagamento agora. Tente novamente em alguns instantes.',
          details: process.env.NODE_ENV !== 'production' ? err.details : undefined,
        },
        { status: err.status || 502 },
      )
    }

    // ── Unexpected error ──────────────────────────────────────────────────
    console.error('[Payments/Create] 500 - Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
