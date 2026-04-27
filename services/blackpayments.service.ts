export const BLACKPAY_CONFIG = {
  publicKey: process.env.BLACKPAY_PUBLIC_KEY || '',
  secretKey: process.env.BLACKPAY_SECRET_KEY || '',
  webhookSecret: process.env.BLACKPAY_WEBHOOK_SECRET || '',
  apiUrl: process.env.BLACKPAY_API_URL || 'https://api.blackpayments.pro/v1'
}

/**
 * Creates a new Pix transaction for the user
 */
export async function createTransaction(user: { id: string, email: string, name: string }) {
  if (!BLACKPAY_CONFIG.publicKey || !BLACKPAY_CONFIG.secretKey) {
    throw new Error('BLACKPAY keys are not configured');
  }

  // Create base64 basic auth string
  const authString = Buffer.from(`${BLACKPAY_CONFIG.publicKey}:${BLACKPAY_CONFIG.secretKey}`).toString('base64');

  const payload = {
    amount: 1990, // R$19.90 in cents
    paymentMethod: 'pix',
    customer: {
      email: user.email,
      name: user.name
    },
    metadata: user.id, // Passing user.id as string
    items: [
      {
        title: "Assinatura Vynta",
        unitPrice: 1990,
        quantity: 1,
        tangible: false
      }
    ]
  };

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
    console.error('[BlackPayments] Error creating transaction:', errorText);
    throw new Error('Failed to create BlackPayments transaction');
  }

  const data = await response.json();
  return data;
}
