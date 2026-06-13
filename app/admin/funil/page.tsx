import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import FunnelClient from './FunnelClient'

export const metadata: Metadata = {
  title: 'Funil de Conversão - Vynta Ops',
}

const prisma = new PrismaClient()

export default async function FunnelPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const events = await prisma.funnelEvent.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Agrupar sessions únicos por etapa
  const uniqueSessionsPerStep = events.reduce((acc, curr) => {
    if (!acc[curr.eventName]) {
      acc[curr.eventName] = new Set()
    }
    acc[curr.eventName].add(curr.sessionId)
    return acc
  }, {} as Record<string, Set<string>>)

  const steps = [
    { name: 'landing_view', label: '1. Landing Page' },
    { name: 'cta_click', label: '2. Clique CTA' },
    { name: 'signup_started', label: '3. Início Cadastro' },
    { name: 'signup_completed', label: '4. Fim Cadastro' },
    { name: 'dashboard_first_view', label: '5. Dashboard' },
    { name: 'plan_viewed', label: '6. Ver Planos' },
    { name: 'checkout_started', label: '7. Iniciar Checkout' },
    { name: 'payment_attempted', label: '8. Pagar' },
    { name: 'purchase', label: '9. Compra' },
  ]

  const funnelData = steps.map(step => {
    return {
      name: step.label,
      value: uniqueSessionsPerStep[step.name] ? uniqueSessionsPerStep[step.name].size : 0
    }
  })

  return <FunnelClient data={funnelData} />
}
