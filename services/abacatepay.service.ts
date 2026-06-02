import { AbacatePay } from '@abacatepay/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PLAN_PRICES = {
  vip: 1990,
  pro: 2990,
  promo: 2490,
}

// Helper to init the SDK safely
const getAbacate = () => {
  if (!process.env.ABACATEPAY_API_KEY) {
    throw new Error('ABACATEPAY_API_KEY is not set')
  }
  return AbacatePay({ secret: process.env.ABACATEPAY_API_KEY })
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
  /** Plan tier selected */
  planTier?: 'vip' | 'pro' | 'promo'
}

/**
 * Ensures a Vynta product exists in AbacatePay and returns its ID.
 */
async function ensureProduct(tier: 'vip' | 'pro' | 'promo' = 'vip'): Promise<string> {
  const abacate = getAbacate()
  const priceCents = PLAN_PRICES[tier]
  const externalId = `vynta-${tier}-${priceCents}`
  const name = tier === 'vip' ? 'Vynta VIP' : (tier === 'promo' ? 'Vynta PRO (Promo)' : 'Vynta PRO')

  // We could list products to see if it exists, but the easiest way is 
  // to list and find by externalId, or simply try to create and catch error, 
  // or store the ID locally in the DB.
  // For simplicity, we fetch all products and find ours.
  try {
    const products = await abacate.products.list()
    const existingProduct = products.find((p: any) => p.externalId === externalId)
    
    if (existingProduct) {
      return existingProduct.id
    }

    // Product doesn't exist, create it
    const newProduct = await abacate.products.create({
      externalId,
      name,
      price: priceCents,
      currency: 'BRL',
    })
    
    return newProduct.id
  } catch (error: any) {
    console.error(`[AbacatePay] Failed to ensure ${tier.toUpperCase()} product:`, error.message)
    throw error
  }
}

/**
 * Creates a new checkout transaction via AbacatePay (Hosted Checkout).
 */
export async function createTransaction(user: CreateTransactionInput) {
  const abacate = getAbacate()

  // ── CPF guard ────────────────────────────────────────────────────────────
  const rawDocument = (user.document ?? '').replace(/\D/g, '')

  if (!rawDocument || rawDocument.length < 11) {
    const err: any = new Error(
      'Para gerar o pagamento, precisamos do seu CPF. Por favor, atualize seus dados.',
    )
    err.code = 'MISSING_DOCUMENT'
    throw err
  }

  try {
    const tier = user.planTier || 'vip'
    // 1. Ensure the product exists
    const productId = await ensureProduct(tier)

    // 2. Prepare customer payload
    const customer = {
      name: user.name,
      email: user.email,
      taxId: rawDocument,
      cellphone: user.phone ? user.phone.replace(/\D/g, '') : undefined,
    }

    const appUrl = process.env.APP_URL || 'https://flowly-blue.vercel.app'

    // 3. Create the checkout
    const checkout = await abacate.checkouts.create({
      items: [{ id: productId, quantity: 1 }],
      customer,
      externalId: user.id, // Using user ID as external ID for tracking
      returnUrl: `${appUrl}/payment/return`,
      completionUrl: `${appUrl}/payment/return`, // Where to go after success
    })

    console.log('[AbacatePay] Checkout created:', checkout.url)

    // Log the intent in our database
    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        provider: 'abacatepay',
        providerTransactionId: checkout.id || `pending_${Date.now()}`,
        amount: PLAN_PRICES[tier] / 100,
        status: 'PENDING',
        rawStatus: 'checkout_created',
      },
    })

    // Return the URL for redirect instead of Pix code
    return {
      id: checkout.id,
      url: checkout.url,
      status: 'pending',
    }
  } catch (error: any) {
    console.error('[AbacatePay] Provider rejected checkout.', {
      message: error.message,
    })

    const providerErr: any = new Error('Provider validation error')
    providerErr.isProviderError = true
    providerErr.details = error.message
    throw providerErr
  }
}
