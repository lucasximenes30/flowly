'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function UnlockPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = async (tier: 'vip' | 'pro') => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier })
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
    <div className="relative min-h-dvh bg-[#050505] text-surface-200 selection:bg-brand-500/30 overflow-x-hidden font-sans flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,88,249,0.15),transparent_40%),radial-gradient(circle_at_bottom,rgba(17,31,171,0.1),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-5xl space-y-12 animate-auth-fade">
        <div className="text-center space-y-6">
          <BrandLogo size="lg" className="justify-center" priority />
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
            Desbloqueie seu Acesso
          </h1>
          <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
            Seu período de teste acabou ou sua conta está inativa. Escolha o plano que melhor se adapta à sua rotina para continuar evoluindo.
          </p>
        </div>

        {error && (
          <div className="mx-auto max-w-md p-4 rounded-xl bg-red-900/20 border border-red-900/40 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* VIP Plan */}
          <div className="relative rounded-[2rem] bg-surface-900/40 backdrop-blur-md border border-white/5 p-8 flex flex-col hover:border-white/10 transition-colors">
            <div className="space-y-4 mb-8">
              <span className="inline-block rounded-full px-3 py-1 bg-surface-800 text-surface-300 text-xs font-bold tracking-widest uppercase">
                Essencial
              </span>
              <h2 className="text-3xl font-display font-semibold text-white">VIP</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$ 19,90</span>
                <span className="text-surface-500">/mês</span>
              </div>
              <p className="text-surface-400 text-sm">Controle financeiro, hábitos e treinos garantidos.</p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {['Gestão Financeira completa', 'Rastreador de Hábitos', 'Módulo de Treinos'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-surface-300">
                  <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-[0.95rem]">{item}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-surface-600">
                <div className="w-5 h-5 border border-surface-600 rounded-full shrink-0 mt-0.5" />
                <span className="text-[0.95rem] line-through">Sistema de Metas</span>
              </li>
              <li className="flex items-start gap-3 text-surface-600">
                <div className="w-5 h-5 border border-surface-600 rounded-full shrink-0 mt-0.5" />
                <span className="text-[0.95rem] line-through">Agenda e Calendário</span>
              </li>
              <li className="flex items-start gap-3 text-surface-600">
                <div className="w-5 h-5 border border-surface-600 rounded-full shrink-0 mt-0.5" />
                <span className="text-[0.95rem] line-through">Anotações e 2º Cérebro</span>
              </li>
            </ul>

            <button
              onClick={() => handleUnlock('vip')}
              disabled={loading}
              className="w-full rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold py-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecionando...' : 'Assinar VIP'}
            </button>
          </div>

          {/* PRO Plan */}
          <div className="relative rounded-[2rem] bg-gradient-to-b from-brand-900/20 to-[#050505] p-1 ring-1 ring-brand-500/30 shadow-[0_20px_40px_-10px_rgba(48,64,235,0.2)] flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recomendado
            </div>
            <div className="bg-[#050505]/80 backdrop-blur-xl rounded-[calc(2rem-4px)] p-8 flex flex-col h-full border border-white/5">
              <div className="space-y-4 mb-8">
                <span className="inline-block rounded-full px-3 py-1 bg-brand-500/10 text-brand-300 text-xs font-bold tracking-widest uppercase">
                  Completo
                </span>
                <h2 className="text-3xl font-display font-semibold text-white">PRO</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">R$ 29,90</span>
                  <span className="text-surface-500">/mês</span>
                </div>
                <p className="text-brand-200/70 text-sm">O sistema de vida completo, sem interrupções.</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {['Gestão Financeira completa', 'Rastreador de Hábitos', 'Módulo de Treinos', 'Sistema de Metas', 'Agenda e Calendário', 'Anotações e 2º Cérebro'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-surface-200">
                    <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    <span className="text-[0.95rem] font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUnlock('pro')}
                disabled={loading}
                className="group w-full flex justify-between items-center rounded-full bg-white text-[#050505] px-6 py-4 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Aguarde...' : 'Assinar PRO'}</span>
                {!loading && (
                  <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <button onClick={() => router.push('/login')} className="text-surface-500 hover:text-white transition-colors text-sm">
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  )
}
