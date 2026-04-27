export const BLACKPAY_CONFIG = {
  publicKey: process.env.BLACKPAY_PUBLIC_KEY || '',
  secretKey: process.env.BLACKPAY_SECRET_KEY || '',
  webhookSecret: process.env.BLACKPAY_WEBHOOK_SECRET || '',
  apiUrl: process.env.BLACKPAY_API_URL || 'https://api.blackpayments.pro/v1',
  appUrl: process.env.APP_URL || 'http://localhost:3000'
}

/**
 * Creates a new Pix transaction for the user
 */
export async function createTransaction(user: { id: string, email: string, name: string, document?: string, phone?: string }) {
  if (!BLACKPAY_CONFIG.publicKey || !BLACKPAY_CONFIG.secretKey) {
    throw new Error('BLACKPAY keys are not configured');
  }

  // Create base64 basic auth string
  const authString = Buffer.from(`${BLACKPAY_CONFIG.publicKey}:${BLACKPAY_CONFIG.secretKey}`).toString('base64');

  const isProd = process.env.NODE_ENV === 'production';
  // TODO: Collect real CPF and Phone in the registration form in the future.
  // We use placeholder data for local testing because acquirers usually require them for Pix.
  // We do NOT silently use fake data in production.
  const customerDocument = user.document || (isProd ? undefined : "00000000000");
  const customerPhone = user.phone || (isProd ? undefined : "11999999999");

  const payload: any = {
    amount: 1990, // R$19.90 in cents
    paymentMethod: 'pix',
    customer: {
      email: user.email,
      name: user.name
    },
    items: [
      {
        title: "Assinatura Vynta",
        unitPrice: 1990,
        quantity: 1,
        tangible: false
      }
    ],
    externalRef: user.id,
    metadata: JSON.stringify({ userId: user.id, email: user.email }),
    postbackUrl: `${BLACKPAY_CONFIG.appUrl}/api/webhooks/blackpayments`,
    returnUrl: `${BLACKPAY_CONFIG.appUrl}/payment/return`
  };

  if (customerDocument) payload.customer.document = customerDocument;
  if (customerPhone) payload.customer.phone = customerPhone;

  console.log('[BlackPayments] Creating transaction with payload:', {
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
    customerEmail: payload.customer.email,
    hasCustomerDocument: !!payload.customer.document,
    externalRef: payload.externalRef,
    postbackUrl: payload.postbackUrl,
    returnUrl: payload.returnUrl,
    envKeysPresent: !!BLACKPAY_CONFIG.publicKey
  });

  const response = await fetch(`${BLACKPAY_CONFIG.apiUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authString}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[BlackPayments] Error creating transaction. Status: ${response.status}. Body:`, errorText);
    
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch {
      parsedError = { message: errorText };
    }
    
    throw {
      isProviderError: true,
      status: response.status,
      details: parsedError
    };
  }

  const data = await response.json();
  return data;
}
