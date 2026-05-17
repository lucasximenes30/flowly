import { AbacatePay } from '@abacatepay/sdk'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// To change the price back to R$19,90, update this constant to 1990
const VYNTA_VIP_PRICE_CENTS = 1990

// Helper to init the SDK safely
const getAbacate = () => {
  if (!process.env.ABACATEPAY_API_KEY) {
    throw new Error('ABACATEPAY_API_KEY is not set')
  }
  return AbacatePay(process.env.ABACATEPAY_API_KEY)
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
 * Ensures a Vynta VIP product exists in AbacatePay and returns its ID.
 */
async function ensureVipProduct(): Promise<string> {
  const abacate = getAbacate()
  const externalId = 'vynta-vip-1990'

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
      name: 'Vynta VIP',
      price: VYNTA_VIP_PRICE_CENTS,
      currency: 'BRL',
    })
    
    return newProduct.id
  } catch (error: any) {
    console.error('[AbacatePay] Failed to ensure VIP product:', error.message)
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
    // 1. Ensure the product exists
    const productId = await ensureVipProduct()

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
      completionUrl: `${appUrl}/dashboard`, // Where to go after success
    })

    console.log('[AbacatePay] Checkout created:', checkout.url)

    // Log the intent in our database
    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        provider: 'abacatepay',
        providerTransactionId: checkout.id || `pending_${Date.now()}`,
        amount: VYNTA_VIP_PRICE_CENTS / 100,
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
