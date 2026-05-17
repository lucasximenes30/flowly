// Manual type declarations for @abacatepay/sdk
// (The SDK ships without compiled .d.ts files)

declare module '@abacatepay/sdk' {
  interface AbacatePayClient {
    checkouts: {
      create(params: {
        items: { id: string; quantity: number }[]
        customer: {
          name: string
          email: string
          taxId: string
          cellphone?: string
        }
        externalId?: string
        metadata?: Record<string, unknown>
        returnUrl: string
        completionUrl: string
      }): Promise<{
        id: string
        url: string
        status: string
        [key: string]: unknown
      }>
    }
    products: {
      create(params: {
        externalId: string
        name: string
        price: number
        currency: string
      }): Promise<{ id: string; externalId: string; [key: string]: unknown }>
      list(): Promise<Array<{ id: string; externalId: string; [key: string]: unknown }>>
      get(params: { id: string }): Promise<{ id: string; [key: string]: unknown }>
      delete(params: { id: string }): Promise<unknown>
    }
    webhooks: {
      verify(
        rawBody: string,
        signature: string,
      ): {
        event: 'billing.paid' | 'payout.done' | 'payout.failed'
        data: unknown
      }
    }
  }

  export function AbacatePay(apiKey: string): AbacatePayClient
  export const version: string
  export const API_BASE_URL: string
  export const API_VERSION: string
}
