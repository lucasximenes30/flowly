export const BLACKPAY_CONFIG = {
  publicKey: process.env.BLACKPAY_PUBLIC_KEY || '',
  secretKey: process.env.BLACKPAY_SECRET_KEY || '',
  webhookSecret: process.env.BLACKPAY_WEBHOOK_SECRET || '',
  apiUrl: process.env.BLACKPAY_API_URL || 'https://api.blackpayments.pro/v1',
  appUrl: process.env.APP_URL || 'https://flowly-blue.vercel.app',
}

export interface CreateTransactionInput {
  id: string
  email: string
  name: string
  /** Raw or formatted CPF string — digits will be stripped. Must be 11 digits. */
  document?: string | null
  phone?: string | null
  /** Client IP address (optional) */
  ip?: string | null
}

/**
 * Creates a new Pix transaction for the user via BlackPayments.
 *
 * Throws a structured error object { isProviderError, status, details } on provider failure.
 * Throws a plain Error with .code === 'MISSING_DOCUMENT' when the user has no CPF.
 */
export async function createTransaction(user: CreateTransactionInput) {
  if (!BLACKPAY_CONFIG.publicKey || !BLACKPAY_CONFIG.secretKey) {
    throw new Error('BLACKPAY keys are not configured')
  }

  // ── CPF guard ────────────────────────────────────────────────────────────
  const rawDocument = (user.document ?? '').replace(/\D/g, '')

  if (!rawDocument || rawDocument.length < 11) {
    // Dev-only fallback: NEVER use in production
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[BlackPayments] [DEV-ONLY] User has no CPF — this payment WILL FAIL in production.',
        { userId: user.id },
      )
    } else {
      const err: any = new Error(
        'Para gerar o pagamento, precisamos do seu CPF. Por favor, atualize seus dados.',
      )
      err.code = 'MISSING_DOCUMENT'
      throw err
    }
  }

  // ── Basic-auth header ────────────────────────────────────────────────────
  const authString = Buffer.from(
    `${BLACKPAY_CONFIG.publicKey}:${BLACKPAY_CONFIG.secretKey}`,
  ).toString('base64')

  // ── Build payload ────────────────────────────────────────────────────────
  const AMOUNT = 1990 // R$19,90 in cents

  const payload: Record<string, unknown> = {
    amount: AMOUNT,
    paymentMethod: 'pix',

    items: [
      {
        title: 'Vynta VIP',
        unitPrice: AMOUNT,
        quantity: 1,
        tangible: false,
        externalRef: user.id,
      },
    ],

    customer: {
      name: user.name,
      email: user.email,
      // phone is optional — only include when present
      ...(user.phone ? { phone: user.phone.replace(/\D/g, '') } : {}),
      // document MUST be an object per BlackPayments docs
      document: {
        type: 'cpf',
        number: rawDocument,
      },
    },

    postbackUrl: `${BLACKPAY_CONFIG.appUrl}/api/webhooks/blackpayments`,
    returnUrl: `${BLACKPAY_CONFIG.appUrl}/payment/return`,

    metadata: JSON.stringify({
      userId: user.id,
      email: user.email,
      plan: 'VIP',
    }),

    externalRef: user.id,

    // Client IP — optional
    ...(user.ip ? { ip: user.ip } : {}),
  }

  // ── Debug log (no private data) ──────────────────────────────────────────
  const customerPayload = payload.customer as Record<string, unknown>
  const documentPayload = customerPayload.document as Record<string, unknown>
  const itemsPayload = payload.items as unknown[]

  console.log('[BlackPayments] Creating transaction:', {
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
    hasItems: Array.isArray(itemsPayload) && itemsPayload.length > 0,
    itemsCount: itemsPayload.length,
    items0Tangible: (itemsPayload[0] as any)?.tangible,
    customerNameExists: !!customerPayload.name,
    customerEmailExists: !!customerPayload.email,
    customerPhoneExists: !!customerPayload.phone,
    customerDocumentExists: !!customerPayload.document,
    customerDocumentIsObject: typeof customerPayload.document === 'object',
    customerDocumentType: documentPayload?.type,
    customerDocumentNumberLength: String(documentPayload?.number ?? '').length,
    externalRef: payload.externalRef,
    postbackUrl: payload.postbackUrl,
    returnUrl: payload.returnUrl,
    metadataIsString: typeof payload.metadata === 'string',
    ipProvided: !!payload.ip,
    envApiUrl: BLACKPAY_CONFIG.apiUrl,
    envKeysPresent: !!BLACKPAY_CONFIG.publicKey,
  })

  // ── HTTP request ─────────────────────────────────────────────────────────
  const response = await fetch(`${BLACKPAY_CONFIG.apiUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()

  // ── Provider error handling ──────────────────────────────────────────────
  if (!response.ok) {
    let parsedError: unknown
    try {
      parsedError = JSON.parse(responseText)
    } catch {
      parsedError = { raw: responseText }
    }

    console.error('[BlackPayments] Provider rejected transaction.', {
      status: response.status,
      providerResponse: parsedError,
    })

    const providerErr: any = new Error('Provider validation error')
    providerErr.isProviderError = true
    providerErr.status = response.status
    providerErr.details = parsedError
    throw providerErr
  }

  // ── Success ──────────────────────────────────────────────────────────────
  let data: unknown
  try {
    data = JSON.parse(responseText)
  } catch {
    data = { raw: responseText }
  }

  console.log('[BlackPayments] Transaction created successfully.', {
    status: response.status,
  })

  return data
}
