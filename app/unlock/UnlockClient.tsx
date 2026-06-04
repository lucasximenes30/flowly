'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'
import { CheckCircle2, ArrowRight, Star } from 'lucide-react'

import { JWTPayload } from '@/lib/auth'

interface UnlockClientProps {
  session: JWTPayload
  state?: string
  feature?: string
}

export default function UnlockClient({ session, state, feature }: UnlockClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = async (tier: 'vip' | 'pro' | 'promo' | 'pro_yearly') => {
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

  const renderPlans = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 pt-6">
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
          {loading ? 'Aguarde...' : 'Assinar VIP'}
        </button>
      </div>

      {/* PRO Plan */}
      <div className="relative rounded-[2rem] bg-surface-900/60 backdrop-blur-xl border border-brand-500/30 p-8 flex flex-col hover:border-brand-500/50 transition-colors">
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
          className="w-full rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-4 transition-colors disabled:opacity-50"
        >
          {loading ? 'Aguarde...' : 'Assinar PRO'}
        </button>
      </div>

      {/* PRO YEARLY Plan */}
      <div className="relative rounded-[2rem] bg-gradient-to-b from-brand-500 to-[#050505] p-1 shadow-[0_20px_40px_-10px_rgba(48,64,235,0.4)] flex flex-col">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-brand-900 text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
          🔥 Melhor custo-benefício
        </div>
        <div className="bg-[#050505]/95 backdrop-blur-xl rounded-[calc(2rem-4px)] p-8 flex flex-col h-full border border-white/5">
          <div className="space-y-4 mb-8">
            <span className="inline-block rounded-full px-3 py-1 bg-brand-500/20 text-brand-300 text-xs font-bold tracking-widest uppercase border border-brand-500/30">
              Anual
            </span>
            <h2 className="text-3xl font-display font-semibold text-white">PRO ANUAL</h2>
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$ 239,90</span>
                <span className="text-surface-500">/ano</span>
              </div>
              <span className="text-emerald-400 font-medium text-sm">Economize R$ 118,90 por ano</span>
            </div>
            <p className="text-brand-200/70 text-sm">O mesmo sistema completo, com um super desconto anual.</p>
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
            onClick={() => handleUnlock('pro_yearly')}
            disabled={loading}
            className="group w-full flex justify-between items-center rounded-full bg-white text-[#050505] px-6 py-4 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] transition-all hover:bg-surface-100 disabled:opacity-50"
          >
            <span>{loading ? 'Aguarde...' : 'Assinar PRO Anual'}</span>
            {!loading && (
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-dvh bg-[#050505] text-surface-200 selection:bg-brand-500/30 overflow-x-hidden font-sans flex flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,88,249,0.15),transparent_40%),radial-gradient(circle_at_bottom,rgba(17,31,171,0.1),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-6xl space-y-12 animate-auth-fade">
        {state === 'payment_pending' && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Parece que você ainda não concluiu seu pagamento.
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              Seu acesso será liberado automaticamente após a confirmação do pagamento.
            </p>
          </div>
        )}
        
        {state === 'trial_expired' && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Seu período gratuito terminou.
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              Você testou o Vynta. Agora escolha o plano ideal para continuar organizando sua vida.
            </p>
          </div>
        )}
        
        {state === 'expired' && session.plan === 'VIP' && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Seu acesso VIP expirou.
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              Renove seu plano ou aproveite para fazer upgrade e desbloquear todas as ferramentas do Vynta.
            </p>
          </div>
        )}

        {state === 'expired' && session.plan === 'PRO' && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Seu acesso PRO expirou.
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              Renove seu plano agora ou faça upgrade para o PRO Anual e economize R$ 118,90 por ano.
            </p>
          </div>
        )}

        {state === 'expired' && session.plan === 'PRO_YEARLY' && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Seu plano anual expirou.
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              Renove agora para continuar usando todas as funcionalidades do Vynta.
            </p>
          </div>
        )}
        
        {!['payment_pending', 'trial_expired', 'expired'].includes(state || '') && !feature && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Desbloqueie seu Acesso
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              Sua conta está inativa. Escolha o plano que melhor se adapta à sua rotina para continuar evoluindo.
            </p>
          </div>
        )}

        {feature && (
          <div className="text-center space-y-6">
            <BrandLogo size="lg" className="justify-center" priority />
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Módulo Bloqueado
            </h1>
            <p className="mx-auto max-w-lg text-[1.05rem] leading-relaxed text-surface-400">
              {feature === 'goals' && `O módulo de Metas não está habilitado no plano ${session.plan === 'FREE_TRIAL' ? 'Teste Grátis' : session.plan === 'VIP' ? 'VIP' : 'atual'}. `}
              {feature === 'agenda' && `A Agenda não está habilitada no plano ${session.plan === 'FREE_TRIAL' ? 'Teste Grátis' : session.plan === 'VIP' ? 'VIP' : 'atual'}. `}
              {feature === 'notes' && `O módulo de Notas não está habilitado no plano ${session.plan === 'FREE_TRIAL' ? 'Teste Grátis' : session.plan === 'VIP' ? 'VIP' : 'atual'}. `}
              {feature === 'finance' && `O módulo de Finanças não está habilitado no seu plano atual. `}
              {feature === 'habits' && `O módulo de Hábitos não está habilitado no seu plano atual. `}
              {feature === 'workout' && `O módulo de Treinos não está habilitado no seu plano atual. `}
              Faça o upgrade para habilitar o acesso completo.
            </p>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md p-4 rounded-xl bg-red-900/20 border border-red-900/40 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* PAYMENT PENDING SCENARIO */}
        {state === 'payment_pending' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-surface-900/50 p-6 rounded-2xl border border-white/10 text-center">
              <span className="text-surface-400 text-sm">Plano selecionado:</span>
              <div className="text-2xl font-bold text-white mt-1">
                {session.plan === 'PRO_YEARLY' ? 'PRO ANUAL — R$ 239,90/ano' : session.plan === 'PRO' ? 'PRO — R$ 29,90/mês' : 'VIP — R$ 19,90/mês'}
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleUnlock(session.plan === 'PRO_YEARLY' ? 'pro_yearly' : session.plan === 'PRO' ? 'pro' : 'vip')}
                disabled={loading}
                className="w-full rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 shadow-[0_0_20px_-5px_rgba(48,64,235,0.5)] transition-all disabled:opacity-50"
              >
                {loading ? 'Redirecionando...' : 'Concluir Pagamento'}
              </button>

              <a
                href="https://wa.me/5585992551864?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20meu%20pagamento%20no%20Vynta."
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center w-full rounded-full bg-surface-800 hover:bg-surface-700 text-white font-bold py-4 transition-all"
              >
                💬 Falar com Suporte
              </a>
            </div>
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <p className="text-surface-400 text-sm mb-4">Deseja mudar seu plano?</p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => router.push('/subscription')}
                  disabled={loading}
                  className="rounded-xl bg-surface-800 hover:bg-surface-700 text-white py-3 text-sm font-medium transition-colors"
                >
                  Ver todos os planos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXPIRED VIP SCENARIO WITH PROMO */}
        {state === 'expired' && session.plan === 'VIP' && !session.usedUpgradeOffer && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-medium text-brand-300">Antes de renovar, temos uma oferta especial.</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PRO PROMO CARD */}
              <div className="relative rounded-[2rem] bg-gradient-to-b from-brand-900/20 to-[#050505] p-1 ring-1 ring-brand-500/30 shadow-[0_20px_40px_-10px_rgba(48,64,235,0.2)] flex flex-col h-full">
                <div className="bg-[#050505]/80 backdrop-blur-xl rounded-[calc(2rem-4px)] p-8 text-center flex-1 flex flex-col justify-center">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Upgrade para PRO</h2>
                  <div className="flex justify-center items-baseline gap-1 mb-4">
                    <span className="text-surface-500 line-through text-lg mr-2">R$ 29,90</span>
                    <span className="text-4xl font-bold text-brand-400">R$ 24,90</span>
                    <span className="text-surface-500">/mês</span>
                  </div>
                  <p className="text-brand-200/80 mb-8">Experimente o plano PRO com desconto exclusivo no primeiro mês e libere Metas, Agenda e Notas.</p>
                  
                  <button
                    onClick={() => handleUnlock('promo')}
                    disabled={loading}
                    className="w-full rounded-full bg-white text-[#050505] font-bold py-4 hover:bg-surface-100 transition-colors disabled:opacity-50 mt-auto"
                  >
                    {loading ? 'Aguarde...' : 'Quero PRO por R$ 24,90'}
                  </button>
                </div>
              </div>

              {/* VIP RENEW CARD */}
              <div className="relative rounded-[2rem] bg-surface-900/40 backdrop-blur-md border border-white/5 p-8 flex flex-col hover:border-white/10 transition-colors h-full text-center justify-center">
                <h2 className="text-2xl font-display font-bold text-white mb-2">Continuar no VIP</h2>
                <div className="flex justify-center items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">R$ 19,90</span>
                  <span className="text-surface-500">/mês</span>
                </div>
                <p className="text-surface-400 text-sm mb-8">Mantenha seu controle financeiro, hábitos e treinos.</p>
                <button
                  onClick={() => handleUnlock('vip')}
                  disabled={loading}
                  className="w-full text-surface-400 hover:text-white transition-colors text-sm py-4 font-medium bg-surface-800 rounded-full hover:bg-surface-700 mt-auto"
                >
                  {loading ? 'Aguarde...' : 'Renovar VIP'}
                </button>
              </div>
            </div>
            
            <div className="text-center pt-4">
               <button
                  onClick={() => handleUnlock('pro_yearly')}
                  disabled={loading}
                  className="text-brand-400 hover:text-brand-300 font-medium underline underline-offset-4"
                >
                  Ou veja as vantagens do PRO Anual e economize R$ 118,90
                </button>
            </div>
          </div>
        )}

        {/* EXPIRED VIP WITHOUT PROMO */}
        {state === 'expired' && session.plan === 'VIP' && session.usedUpgradeOffer && renderPlans()}

        {/* EXPIRED PRO SCENARIO */}
        {state === 'expired' && session.plan === 'PRO' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* PRO YEARLY UPGRADE CARD */}
              <div className="relative rounded-[2rem] bg-gradient-to-b from-brand-500 to-[#050505] p-1 shadow-[0_20px_40px_-10px_rgba(48,64,235,0.4)] flex flex-col h-full mt-6 md:mt-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-brand-900 text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
                  🔥 Melhor custo-benefício
                </div>
                <div className="bg-[#050505]/95 backdrop-blur-xl rounded-[calc(2rem-4px)] p-8 text-center flex-1 flex flex-col justify-center">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">PRO ANUAL</h2>
                  <div className="flex justify-center items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">R$ 239,90</span>
                    <span className="text-surface-500">/ano</span>
                  </div>
                  <span className="text-emerald-400 font-medium text-sm block mb-6">Economize R$ 118,90 por ano</span>
                  
                  <button
                    onClick={() => handleUnlock('pro_yearly')}
                    disabled={loading}
                    className="w-full rounded-full bg-white text-[#050505] font-bold py-4 hover:bg-surface-100 transition-colors disabled:opacity-50 mt-auto"
                  >
                    {loading ? 'Aguarde...' : 'Fazer Upgrade Anual'}
                  </button>
                </div>
              </div>

              {/* PRO RENEW CARD */}
              <div className="relative rounded-[2rem] bg-surface-900/40 backdrop-blur-md border border-white/5 p-8 flex flex-col hover:border-white/10 transition-colors h-full text-center justify-center">
                <h2 className="text-2xl font-display font-bold text-white mb-2">Renovar PRO Mensal</h2>
                <div className="flex justify-center items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-white">R$ 29,90</span>
                  <span className="text-surface-500">/mês</span>
                </div>
                <p className="text-surface-400 text-sm mb-8">Continue com todas as ferramentas liberadas mensalmente.</p>
                <button
                  onClick={() => handleUnlock('pro')}
                  disabled={loading}
                  className="w-full text-surface-400 hover:text-white transition-colors text-sm py-4 font-medium bg-surface-800 rounded-full hover:bg-surface-700 mt-auto"
                >
                  {loading ? 'Aguarde...' : 'Renovar PRO'}
                </button>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <button
                onClick={() => handleUnlock('vip')}
                disabled={loading}
                className="text-surface-500 hover:text-white font-medium text-sm transition-colors"
              >
                Fazer downgrade para VIP (R$ 19,90/mês)
              </button>
            </div>
          </div>
        )}

        {/* EXPIRED PRO YEARLY SCENARIO */}
        {state === 'expired' && session.plan === 'PRO_YEARLY' && (
          <div className="max-w-md mx-auto">
            <div className="relative rounded-[2rem] bg-gradient-to-b from-brand-500 to-[#050505] p-1 shadow-[0_20px_40px_-10px_rgba(48,64,235,0.4)] flex flex-col">
                <div className="bg-[#050505]/95 backdrop-blur-xl rounded-[calc(2rem-4px)] p-8 text-center flex-1 flex flex-col justify-center">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Renovar Plano Anual</h2>
                  <div className="flex justify-center items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-white">R$ 239,90</span>
                    <span className="text-surface-500">/ano</span>
                  </div>
                  <span className="text-emerald-400 font-medium text-sm block mb-6">Mantenha a economia de R$ 118,90</span>
                  
                  <button
                    onClick={() => handleUnlock('pro_yearly')}
                    disabled={loading}
                    className="w-full rounded-full bg-white text-[#050505] font-bold py-4 hover:bg-surface-100 transition-colors disabled:opacity-50 mt-auto"
                  >
                    {loading ? 'Aguarde...' : 'Renovar Anuidade'}
                  </button>
                </div>
            </div>
            <div className="text-center mt-6 pt-4">
              <p className="text-surface-400 text-sm mb-4">Deseja mudar para pagamento mensal?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleUnlock('vip')}
                  disabled={loading}
                  className="rounded-xl bg-surface-800 hover:bg-surface-700 text-white py-3 text-sm font-medium transition-colors"
                >
                  Mudar para VIP
                </button>
                <button
                  onClick={() => handleUnlock('pro')}
                  disabled={loading}
                  className="rounded-xl bg-surface-800 hover:bg-surface-700 text-white py-3 text-sm font-medium transition-colors"
                >
                  Mudar para PRO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRIAL EXPIRED OR NO STATE OR BLOCKED FEATURE */}
        {(!state || state === 'trial_expired' || !!feature) && renderPlans()}

        <div className="text-center pt-8">
          <button onClick={() => router.push('/login')} className="text-surface-500 hover:text-white transition-colors text-sm">
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  )
}
