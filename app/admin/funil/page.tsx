import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FunnelClient from './FunnelClient'

export const metadata: Metadata = {
  title: 'Funil de Conversão - Vynta Ops',
}

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

  const acquisitionSteps = [
    { name: 'landing_view', label: '1. Landing Page' },
    { name: 'cta_click', label: '2. Clique CTA' },
    { name: 'plan_viewed', label: '3. Ver Planos' },
    { name: 'checkout_started', label: '4. Iniciar Checkout' },
    { name: 'signup_started', label: '5. Início Cadastro' },
    { name: 'signup_completed', label: '6. Fim Cadastro' },
    { name: 'payment_attempted', label: '7. Tentar Pagar' },
    { name: 'purchase', label: '8. Compra' },
  ]

  const activationSteps = [
    { name: 'purchase', label: '1. Compra' },
    { name: 'dashboard_first_view', label: '2. Primeiro Acesso Dashboard' },
  ]

  const funnel1Data = acquisitionSteps.map(step => ({
    name: step.label,
    value: uniqueSessionsPerStep[step.name] ? uniqueSessionsPerStep[step.name].size : 0
  }))

  const funnel2Data = activationSteps.map(step => ({
    name: step.label,
    value: uniqueSessionsPerStep[step.name] ? uniqueSessionsPerStep[step.name].size : 0
  }))

  return <FunnelClient funnel1Data={funnel1Data} funnel2Data={funnel2Data} />
}
