'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import OnboardingClient from '@/components/OnboardingClient'


interface Session {
  userId: string
  email: string
  name: string
  plan?: string
  createdAt?: string | null
  subscriptionExpiresAt?: string | null
  canUseGoals?: boolean
  canUseNotes?: boolean
  canUseAgenda?: boolean
}


interface DashboardClientProps {
  session: Session
  balance: {
    income: number
    expense: number
    balance: number
  }
  habitsCount: number
  activeWorkoutPlanName: string | null
}

export default function DashboardClient({
  session,
  balance,
  habitsCount,
  activeWorkoutPlanName,
}: DashboardClientProps) {
  const router = useRouter()
  const [profileName, setProfileName] = useState(session.name)
  const [loadingPayment, setLoadingPayment] = useState(false)

  const handleUpgrade = async (tier: 'vip' | 'pro' | 'pro_yearly') => {
    setLoadingPayment(true)
    try {
      const res = await fetch('/api/payments/create', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier })
      })
      const data = await res.json()
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setLoadingPayment(false)
        alert(data.error || 'Erro ao gerar pagamento')
      }
    } catch (err) {
      console.error(err)
      setLoadingPayment(false)
      alert('Erro de rede. Tente novamente.')
    }
  }

  const isTrial = session.plan === 'FREE_TRIAL'
  let trialRemainingHours = 0
  let trialRemainingMinutes = 0
  let showTrialBanner = false

  if (isTrial) {
    const now = Date.now()
    let expirationTime = 0
    if (session.subscriptionExpiresAt) {
      expirationTime = new Date(session.subscriptionExpiresAt).getTime()
    } else if (session.createdAt) {
      expirationTime = new Date(session.createdAt).getTime() + 24 * 60 * 60 * 1000
    }
    
    const remainingMs = expirationTime - now
    if (remainingMs > 0) {
      showTrialBanner = true
      trialRemainingHours = Math.floor(remainingMs / (1000 * 60 * 60))
      trialRemainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const quickActions = [
    { label: 'Finanças', icon: Lucide.Wallet, href: '/finances', color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Hábitos', icon: Lucide.CheckSquare, href: '/habits', color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Treinos', icon: Lucide.Dumbbell, href: '/workout', color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Agenda', icon: Lucide.CalendarDays, href: '/calendar', color: 'text-pink-500 bg-pink-500/10', locked: !session.canUseAgenda },
    { label: 'Metas', icon: Lucide.Target, href: '/goals', color: 'text-blue-500 bg-blue-500/10', locked: !session.canUseGoals },
    { label: 'Notas', icon: Lucide.StickyNote, href: '/notes', color: 'text-yellow-500 bg-yellow-500/10', locked: !session.canUseNotes },
  ]

  return (
    <>
      <OnboardingClient />
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300 animate-dashboard-fade">
        
        {/* Top Header */}
        <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-semibold tracking-tight text-surface-900 dark:text-surface-100">
                Vynta — Central
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-sm text-surface-500 dark:text-surface-400">
                {profileName}
              </span>

              <button
                onClick={() => router.push('/settings')}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
                title="Configurações"
              >
                <Lucide.Settings className="w-5 h-5" />
              </button>

              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/login')
                }}
                className="hidden text-sm text-surface-500 transition-colors hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200 sm:inline"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          
          {/* Trial Banner */}
          {showTrialBanner && (
            <div className="rounded-3xl bg-surface-50 dark:bg-brand-900/10 border border-brand-500/20 dark:border-brand-500/30 p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-3xl mt-1">🎁</div>
                <div>
                  <h3 className="font-display font-semibold text-surface-900 dark:text-brand-300 text-xl">
                    Você está usando o teste grátis do Vynta
                  </h3>
                  <p className="text-surface-600 dark:text-brand-200/80 text-sm mt-1.5 font-medium">
                    {trialRemainingHours > 0 
                      ? `Restam ${trialRemainingHours} hora${trialRemainingHours !== 1 ? 's' : ''} para experimentar todos os recursos.`
                      : `Restam ${trialRemainingMinutes} minuto${trialRemainingMinutes !== 1 ? 's' : ''} para experimentar todos os recursos.`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                <button disabled={loadingPayment} onClick={() => handleUpgrade('vip')} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 text-surface-900 dark:text-white font-semibold text-sm border border-surface-200 dark:border-white/10 hover:bg-surface-100 dark:hover:bg-white/20 transition-all shadow-sm active:scale-95 disabled:opacity-50">
                  Assinar VIP — R$19,90
                </button>
                <button disabled={loadingPayment} onClick={() => handleUpgrade('pro')} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-all shadow-sm active:scale-95 disabled:opacity-50">
                  Assinar PRO — R$29,90
                </button>
                <button disabled={loadingPayment} onClick={() => handleUpgrade('pro_yearly')} className="relative overflow-hidden w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 text-white font-bold text-sm hover:from-purple-500 hover:to-brand-500 transition-all shadow-md active:scale-95 disabled:opacity-50">
                  Assinar PRO Anual — R$239,90
                </button>
              </div>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl dark:shadow-brand-500/10 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/15 border border-white/10 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  <Lucide.Calendar className="w-3.5 h-3.5" />
                  {todayStr}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 text-emerald-100 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  <Lucide.ShieldCheck className="w-3.5 h-3.5" />
                  Conta Segura
                </span>
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                  {getGreeting()}, {profileName}!
                </h2>
                <p className="text-sm text-white/90 max-w-[65ch] leading-relaxed font-medium">
                  Bem-vindo ao Vynta. O seu painel pessoal seguro para gerenciar finanças, construir hábitos duradouros e evoluir fisicamente.
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-white/80">
                  <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <Lucide.Activity className="w-4 h-4 text-brand-300" />
                    <span>Construindo constância diariamente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout of Pillars */}
          <div className="grid gap-6 md:grid-cols-12">
            
            {/* Quick Upgrade CTA (Only for Trial Users) */}
            {isTrial && (
              <div className="card md:col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-gradient-to-r from-surface-100 to-surface-50 dark:from-surface-900/80 dark:to-surface-900/40 border border-brand-500/20 group">
                <div>
                  <h3 className="font-display font-semibold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                    <Lucide.Star className="w-5 h-5 text-brand-500" />
                    Gostando do Vynta?
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                    Desbloqueie acesso permanente e continue usando todos os recursos.
                  </p>
                </div>
                <button onClick={() => router.push('/subscription')} className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap">
                  Fazer Upgrade
                </button>
              </div>
            )}

            {/* Finances Module */}
            <div className="card md:col-span-8 relative overflow-hidden group hover:scale-[1.005] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
              <div className="relative space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Lucide.Wallet className="w-5 h-5 text-brand-500" />
                    <span>Finanças Pessoais</span>
                  </h3>
                  <button
                    onClick={() => router.push('/finances')}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Ir para Finanças</span>
                    <Lucide.ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Balance display */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-150 dark:border-surface-800">
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Saldo Geral</p>
                    <p className="text-xl font-bold mt-1 text-surface-900 dark:text-white truncate">
                      {formatCurrency(balance.balance)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-150 dark:border-surface-800">
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Receitas</p>
                    <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 truncate">
                      {formatCurrency(balance.income)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-150 dark:border-surface-800">
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Despesas</p>
                    <p className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400 truncate">
                      {formatCurrency(balance.expense)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Habits Module */}
            <div className="card md:col-span-4 flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Lucide.CheckSquare className="w-5 h-5 text-emerald-500" />
                    <span>Hábitos</span>
                  </h3>
                  <button
                    onClick={() => router.push('/habits')}
                    className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <Lucide.ChevronRight className="w-4 h-4 text-surface-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {habitsCount} ativos
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                    Mantenha a consistência hoje! Monitore sua rotina diária para criar conexões saudáveis.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/habits')}
                className="w-full mt-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl transition-colors border border-emerald-500/10"
              >
                Ver meus Hábitos
              </button>
            </div>

            {/* Workouts Module */}
            <div className="card md:col-span-4 flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Lucide.Dumbbell className="w-5 h-5 text-orange-500" />
                    <span>Treinos</span>
                  </h3>
                  <button
                    onClick={() => router.push('/workout')}
                    className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <Lucide.ChevronRight className="w-4 h-4 text-surface-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  {activeWorkoutPlanName ? (
                    <>
                      <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                        Plano Ativo:
                      </p>
                      <p className="text-lg font-bold text-orange-500 truncate">
                        {activeWorkoutPlanName}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">
                      Nenhum plano ativo no momento.
                    </p>
                  )}
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                    Consulte seu plano de exercícios estruturado para hoje.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/workout')}
                className="w-full mt-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-xl transition-colors border border-orange-500/10"
              >
                Acessar meus Treinos
              </button>
            </div>

            {/* Calendar Module */}
            <div className={`card md:col-span-4 flex flex-col justify-between transition-transform duration-300 ${!session.canUseAgenda ? 'opacity-50 grayscale pointer-events-none' : 'group hover:scale-[1.01]'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Lucide.CalendarDays className="w-5 h-5 text-pink-500" />
                    <span>Agenda</span>
                  </h3>
                  {!session.canUseAgenda ? (
                    <Lucide.Lock className="w-4 h-4 text-surface-400" />
                  ) : (
                    <button
                      onClick={() => router.push('/calendar')}
                      className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                    >
                      <Lucide.ChevronRight className="w-4 h-4 text-surface-400" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                  Consulte sua programação pessoal, compromissos e lembretes integrados para o mês de Julho.
                </p>
              </div>

              <button
                onClick={() => router.push('/calendar')}
                className="w-full mt-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-semibold rounded-xl transition-colors border border-pink-500/10"
              >
                {!session.canUseAgenda ? 'Bloqueado no seu plano' : 'Abrir Minha Agenda'}
              </button>
            </div>

            {/* Goals & Notes Module */}
            <div className={`card md:col-span-4 flex flex-col justify-between transition-transform duration-300 ${(!session.canUseGoals && !session.canUseNotes) ? 'opacity-50 grayscale pointer-events-none' : 'group hover:scale-[1.01]'}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Lucide.Target className="w-5 h-5 text-blue-500" />
                    <span>Objetivos & Notas</span>
                  </h3>
                  {(!session.canUseGoals && !session.canUseNotes) && (
                    <Lucide.Lock className="w-4 h-4 text-surface-400" />
                  )}
                </div>

                <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                  Defina metas pessoais, registre notas rápidas e mantenha suas ideias bem organizadas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => router.push('/goals')}
                  disabled={!session.canUseGoals}
                  className={`py-2 text-xs font-semibold rounded-xl transition-colors border ${!session.canUseGoals ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 border-surface-200 dark:border-surface-700 opacity-70' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/10'}`}
                >
                  {!session.canUseGoals ? 'Metas (Bloqueado)' : 'Metas'}
                </button>
                <button
                  onClick={() => router.push('/notes')}
                  disabled={!session.canUseNotes}
                  className={`py-2 text-xs font-semibold rounded-xl transition-colors border ${!session.canUseNotes ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 border-surface-200 dark:border-surface-700 opacity-70' : 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/10'}`}
                >
                  {!session.canUseNotes ? 'Notas (Bloqueado)' : 'Notas'}
                </button>
              </div>
            </div>

          </div>

          {/* Quick Actions Bar */}
          <div className="card">
            <h3 className="font-display text-sm font-semibold text-surface-500 dark:text-surface-400 mb-4 uppercase tracking-wider">Acesso Rápido</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => router.push(action.href)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-50 border transition-all duration-200 ${action.locked ? 'opacity-50 grayscale pointer-events-none border-surface-200 dark:bg-surface-800/40 dark:border-surface-800' : 'hover:bg-surface-100 dark:bg-surface-900/60 dark:hover:bg-surface-800 border-surface-150 dark:border-surface-800 hover:scale-105 active:scale-95'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                    {action.locked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center justify-center border-2 border-surface-50 dark:border-surface-900">
                        <Lucide.Lock className="w-2.5 h-2.5 text-surface-500 dark:text-surface-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </main>
      </div>

    </>
  )
}
