'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { JWTPayload } from '@/lib/auth'
import FunnelTracker from '@/components/FunnelTracker'
import { trackFunnelEvent, getOrCreateSessionId } from '@/lib/funnel'

interface SubscriptionClientProps {
  session: JWTPayload
}

export default function SubscriptionClient({ session }: SubscriptionClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async (tier: 'vip' | 'pro' | 'pro_yearly') => {
    trackFunnelEvent('checkout_started', { planTier: tier })
    
    setLoading(true)
    setError('')
    try {
      trackFunnelEvent('payment_attempted', { planTier: tier })
      const sessionId = getOrCreateSessionId()
      
      const res = await fetch('/api/payments/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier, sessionId })
      })
      const data = await res.json()

      if (!data.ok || data.error) {
        setError(data.error || 'Erro ao gerar pagamento')
        setLoading(false)
        return
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError('Método de pagamento indisponível no momento.')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError('Erro de rede. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 animate-dashboard-fade">
      <FunnelTracker eventName="plan_viewed" onceKey="plan_viewed" />
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/settings')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
              title="Voltar"
            >
              <Lucide.ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-base font-semibold tracking-tight">Fazer Upgrade</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-surface-900 dark:text-white">
            Evolua sua rotina com o Vynta
          </h1>
          <p className="text-surface-600 dark:text-surface-400 text-lg">
            Escolha o plano que melhor se adapta aos seus objetivos e desbloqueie todo o potencial da plataforma.
          </p>
          
          {error && (
            <div className="mx-auto max-w-md p-4 mt-6 rounded-xl bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-center text-sm text-red-700 dark:text-red-400 font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {/* VIP Plan */}
          <div className="relative rounded-[2rem] bg-white dark:bg-surface-900/40 border border-surface-200 dark:border-white/5 p-8 flex flex-col hover:border-brand-500/30 transition-colors shadow-xl shadow-surface-200/50 dark:shadow-none">
            <div className="space-y-4 mb-8">
              <span className="inline-block rounded-full px-3 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-bold tracking-widest uppercase">
                Essencial
              </span>
              <h2 className="text-3xl font-display font-semibold text-surface-900 dark:text-white">VIP</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-surface-900 dark:text-white">R$ 19,90</span>
                <span className="text-surface-500">/mês</span>
              </div>
              <p className="text-surface-500 dark:text-surface-400 text-sm">Controle financeiro, hábitos e treinos garantidos.</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {['Gestão Financeira completa', 'Rastreador de Hábitos', 'Módulo de Treinos'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-surface-700 dark:text-surface-300">
                  <Lucide.CheckCircle2 className="w-5 h-5 text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-[0.95rem]">{item}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-surface-400 dark:text-surface-600">
                <div className="w-5 h-5 border border-surface-300 dark:border-surface-600 rounded-full shrink-0 mt-0.5" />
                <span className="text-[0.95rem] line-through">Sistema de Metas</span>
              </li>
              <li className="flex items-start gap-3 text-surface-400 dark:text-surface-600">
                <div className="w-5 h-5 border border-surface-300 dark:border-surface-600 rounded-full shrink-0 mt-0.5" />
                <span className="text-[0.95rem] line-through">Agenda e Calendário</span>
              </li>
              <li className="flex items-start gap-3 text-surface-400 dark:text-surface-600">
                <div className="w-5 h-5 border border-surface-300 dark:border-surface-600 rounded-full shrink-0 mt-0.5" />
                <span className="text-[0.95rem] line-through">Anotações e 2º Cérebro</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('vip')}
              disabled={loading || session.plan === 'VIP'}
              className="w-full rounded-full bg-surface-100 dark:bg-white/10 hover:bg-surface-200 dark:hover:bg-white/15 text-surface-900 dark:text-white font-semibold py-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecionando...' : session.plan === 'VIP' ? 'Seu Plano Atual' : 'Assinar VIP'}
            </button>
          </div>

          {/* PRO Plan */}
          <div className="relative rounded-[2rem] bg-surface-50 dark:bg-surface-900/60 border border-brand-500/30 p-8 flex flex-col hover:border-brand-500/50 transition-colors">
            <div className="space-y-4 mb-8">
              <span className="inline-block rounded-full px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-300 text-xs font-bold tracking-widest uppercase">
                Completo
              </span>
              <h2 className="text-3xl font-display font-semibold text-surface-900 dark:text-white">PRO</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-surface-900 dark:text-white">R$ 29,90</span>
                <span className="text-surface-500">/mês</span>
              </div>
              <p className="text-surface-500 dark:text-brand-200/70 text-sm">O sistema de vida completo, sem interrupções.</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {['Gestão Financeira completa', 'Rastreador de Hábitos', 'Módulo de Treinos', 'Sistema de Metas', 'Agenda e Calendário', 'Anotações e 2º Cérebro'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-surface-700 dark:text-surface-200">
                  <Lucide.CheckCircle2 className="w-5 h-5 text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-[0.95rem] font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading || session.plan === 'PRO'}
              className="w-full rounded-full bg-brand-100 hover:bg-brand-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-brand-700 dark:text-white font-semibold py-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : session.plan === 'PRO' ? 'Seu Plano Atual' : 'Assinar PRO'}
            </button>
          </div>

          {/* PRO YEARLY Plan */}
          <div className="relative rounded-[2rem] bg-gradient-to-b from-brand-600 to-brand-900 p-1 shadow-[0_20px_40px_-10px_rgba(48,64,235,0.4)] flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-brand-900 text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
              🔥 Melhor custo-benefício
            </div>
            <div className="bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl rounded-[calc(2rem-4px)] p-8 flex flex-col h-full border border-white/5">
              <div className="space-y-4 mb-8">
                <span className="inline-block rounded-full px-3 py-1 bg-brand-500/20 text-brand-600 dark:text-brand-300 text-xs font-bold tracking-widest uppercase border border-brand-500/30">
                  Anual
                </span>
                <h2 className="text-3xl font-display font-semibold text-surface-900 dark:text-white">PRO ANUAL</h2>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-surface-900 dark:text-white">R$ 239,90</span>
                    <span className="text-surface-500">/ano</span>
                  </div>
                  <span className="text-emerald-500 dark:text-emerald-400 font-medium text-sm">Economize R$ 118,90 por ano</span>
                </div>
                <p className="text-surface-600 dark:text-brand-200/70 text-sm">O mesmo sistema completo, com um super desconto anual.</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {['Gestão Financeira completa', 'Rastreador de Hábitos', 'Módulo de Treinos', 'Sistema de Metas', 'Agenda e Calendário', 'Anotações e 2º Cérebro'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-surface-700 dark:text-surface-200">
                    <Lucide.CheckCircle2 className="w-5 h-5 text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
                    <span className="text-[0.95rem] font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('pro_yearly')}
                disabled={loading || session.plan === 'PRO_YEARLY'}
                className="group w-full flex justify-between items-center rounded-full bg-brand-600 dark:bg-white text-white dark:text-[#050505] px-6 py-4 font-bold shadow-[0_0_30px_-5px_rgba(48,64,235,0.4)] dark:shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Aguarde...' : session.plan === 'PRO_YEARLY' ? 'Seu Plano Atual' : 'Assinar PRO Anual'}</span>
                {!loading && session.plan !== 'PRO_YEARLY' && (
                  <span className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/5 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1">
                    <Lucide.ArrowRight className="w-4 h-4 text-white dark:text-black" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
