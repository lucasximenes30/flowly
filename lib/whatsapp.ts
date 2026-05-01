export type WhatsappMessageType =
  | 'generic'
  | 'expiring_today'
  | 'expiring_3_days'
  | 'expiring_7_days'
  | 'pending'
  | 'inactive'

type WhatsappUserContext = {
  name: string
  subscriptionExpiresAt?: Date | string | null
  subscriptionEndDate?: Date | string | null
}

export function getUserExpirationDate(user: WhatsappUserContext): Date | null {
  const dateStr = user.subscriptionExpiresAt || user.subscriptionEndDate
  if (!dateStr) return null
  return new Date(dateStr)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function getWhatsappMessage(type: WhatsappMessageType, user: WhatsappUserContext): string {
  const firstName = user.name.split(' ')[0]
  const expDate = getUserExpirationDate(user)
  const formattedDate = expDate ? formatDate(expDate) : ''

  switch (type) {
    case 'expiring_3_days':
    case 'expiring_7_days':
      return `Olá, ${firstName}! Tudo bem? Seu acesso ao Vynta vence em ${formattedDate}. Para continuar usando normalmente, basta renovar sua assinatura.`
    case 'expiring_today':
      return `Olá, ${firstName}! Passando para avisar que seu acesso ao Vynta vence hoje. Para evitar bloqueio, finalize a renovação quando puder.`
    case 'pending':
      return `Olá, ${firstName}! Vi aqui que seu pagamento do Vynta ainda está pendente. Se precisar de ajuda para concluir, estou à disposição.`
    case 'inactive':
      return `Olá, ${firstName}! Seu acesso ao Vynta está inativo no momento. Se quiser reativar sua conta, posso te ajudar por aqui.`
    case 'generic':
    default:
      return `Olá, ${firstName}! Estou entrando em contato sobre o seu acesso ao Vynta.`
  }
}

export function getWhatsappLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null

  // Clean phone string
  let cleanPhone = phone.replace(/\D/g, '')

  if (!cleanPhone) return null

  // If no country code, assume Brazil (+55)
  // Brazilian numbers with area code have 10 or 11 digits
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = `55${cleanPhone}`
  }

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}
