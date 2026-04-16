export const CAKTO_CONFIG = {
  clientId: process.env.CAKTO_CLIENT_ID || '',
  clientSecret: process.env.CAKTO_CLIENT_SECRET || '',
  webhookSecret: process.env.CAKTO_WEBHOOK_SECRET || '',
  checkoutUrl: process.env.CAKTO_CHECKOUT_URL || 'https://pay.cakto.com.br/c2iyui9_851221',
  apiUrl: 'https://api.cakto.com.br/v1' // Example generic API url
}

/**
 * Validates the origin/signature of a webhook request.
 * For now, just verifies if a secret token matches, if it's provided in headers or query.
 */
export function verifyCaktoWebhookSignature(token?: string) {
  if (!CAKTO_CONFIG.webhookSecret) {
    // If no secret configured, accept all for now in dev, but in prod log a warning
    if (process.env.NODE_ENV === 'production') {
      console.warn('CAKTO_WEBHOOK_SECRET is not set in production.')
    }
    return true
  }
  return token === CAKTO_CONFIG.webhookSecret
}
