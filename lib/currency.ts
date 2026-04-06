let cachedRate: { rate: number; updated: number } | null = null

export async function getExchangeRate(): Promise<number> {
  // Cache por 5 minutos
  if (cachedRate && Date.now() - cachedRate.updated < 5 * 60 * 1000) {
    return cachedRate.rate
  }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await res.json()
    const rate = Number(data.rates.BRL)
    if (rate) {
      cachedRate = { rate, updated: Date.now() }
      return rate
    }
    return 5.5 // fallback
  } catch {
    return cachedRate?.rate ?? 5.5
  }
}

export function formatCurrency(locale: string, value: number) {
  if (locale === 'en') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
