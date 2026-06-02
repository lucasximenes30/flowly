'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getWhatsappLink, getWhatsappMessage, WhatsappMessageType } from '@/lib/whatsapp'

type DashboardStats = {
  totalUsers: number
  activeVip: number
  activePro: number
  pendingPayments: number
  expiredSubs: number
  trialUsers: number
  upgradeConversions: number
}

type PaymentStats = {
  monthlyRevenueCents: number
  monthlyRevenueFormatted: string
  isEstimated: boolean
  pendingCount: number
  approvedCount: number
}

type UserData = {
  id: string
  name: string
  email: string
  plan: string
  subscriptionStatus: string
  subscriptionExpiresAt: string | null
  phone?: string | null
}

type ExpiringData = {
  today: UserData[]
  in3Days: UserData[]
  in7Days: UserData[]
}

type GrowthData = {
  date: string
  count: number
}

type DistributionData = {
  name: string
  value: number
  color: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [expiring, setExpiring] = useState<ExpiringData | null>(null)
  const [growth, setGrowth] = useState<GrowthData[] | null>(null)
  const [distribution, setDistribution] = useState<DistributionData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal states for contacts
  const [contactsModal, setContactsModal] = useState<{ isOpen: boolean; title: string; users: UserData[]; messageType: WhatsappMessageType }>({
    isOpen: false,
    title: '',
    users: [],
    messageType: 'generic'
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, expiringRes, growthRes, distRes, payStatsRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/dashboard/expiring'),
          fetch('/api/admin/dashboard/users-growth'),
          fetch('/api/admin/dashboard/distribution'),
          fetch('/api/admin/payments/stats'),
        ])

        if (!statsRes.ok || !expiringRes.ok || !growthRes.ok || !distRes.ok) {
          throw new Error('Erro ao carregar dados do dashboard')
        }

        const statsData = await statsRes.json()
        const expiringData = await expiringRes.json()
        const growthData = await growthRes.json()
        const distData = await distRes.json()

        setStats(statsData)
        setExpiring(expiringData)
        setGrowth(growthData)
        setDistribution(distData)

        // Payment stats are optional — don't fail dashboard if they error
        if (payStatsRes.ok) {
          setPaymentStats(await payStatsRes.json())
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-surface-400">
          <Lucide.Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !stats || !expiring || !growth || !distribution) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {error || 'Não foi possível carregar o dashboard.'}
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem data'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  }

  const renderUserTable = (users: UserData[], emptyMessage: string, messageType: WhatsappMessageType) => {
    if (users.length === 0) {
      return (
        <div className="p-8 text-center text-surface-500 bg-surface-50 dark:bg-surface-950/30 rounded-xl border border-dashed border-surface-200 dark:border-surface-800">
          {emptyMessage}
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-100 dark:border-surface-800 text-surface-500 font-medium">
              <th className="pb-3 px-4">Nome / Email</th>
              <th className="pb-3 px-4 hidden sm:table-cell">Plano / Status</th>
              <th className="pb-3 px-4 hidden md:table-cell">Telefone</th>
              <th className="pb-3 px-4 text-right">Vencimento</th>
              <th className="pb-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-surface-900 dark:text-surface-100 truncate max-w-[200px] sm:max-w-xs">{user.name}</div>
                  <div className="text-xs text-surface-500 truncate max-w-[200px] sm:max-w-xs">{user.email}</div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell space-y-1">
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                      {user.plan === 'PRO' ? 'VIP' : user.plan}
                    </span>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {user.subscriptionStatus}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell text-surface-600 dark:text-surface-400 font-mono text-xs">
                  {user.phone || 'Não informado'}
                </td>
                <td className="py-3 px-4 text-right font-medium text-surface-900 dark:text-surface-300">
                  {formatDate(user.subscriptionExpiresAt)}
                </td>
                <td className="py-3 px-4 text-right">
                  {user.phone ? (
                    <a
                      href={getWhatsappLink(user.phone, getWhatsappMessage(messageType, user as any)) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Enviar WhatsApp"
                      className="inline-flex items-center justify-center p-1.5 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                      <Lucide.MessageCircle className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="inline-flex group relative">
                      <button disabled className="p-1.5 text-surface-200 dark:text-surface-700 cursor-not-allowed">
                        <Lucide.MessageCircle className="w-4 h-4" />
                      </button>
                      <span className="absolute -top-8 right-0 px-2 py-1 bg-surface-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Sem telefone
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard Geral</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Visão geral e métricas do sistema
          </p>
        </div>

        {/* Metric Cards — Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">PROs Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.activePro}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.Star className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">VIPs Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.activeVip}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">Usuários Trial</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.trialUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">Pgtos. Pendentes</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.UserX className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">Expirados</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.expiredSubs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lucide.Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-surface-500 dark:text-surface-400 leading-tight">Upgrades p/ PRO</p>
                <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{stats.upgradeConversions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards — Row 2: Payment stats */}
        {paymentStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lucide.TrendingUp className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
                      Receita do Mês
                    </p>
                    {paymentStats.isEstimated && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded uppercase tracking-wide">
                        Estimada
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold font-mono text-surface-900 dark:text-white">
                    {paymentStats.monthlyRevenueFormatted}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {paymentStats.isEstimated
                      ? 'Com base nos VIPs ativos × R$ 47'
                      : `${paymentStats.approvedCount} pagamento(s) aprovado(s) no mês`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lucide.CreditCard className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Pgtos. Pendentes</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{paymentStats.pendingCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Crescimento (Últimos 30 Dias)</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth()+1}`;
                    }}
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => formatDate(val)}
                  />
                  <Line type="monotone" dataKey="count" name="Novos Usuários" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Distribuição de Acesso</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expiring Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Today */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Lucide.AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-surface-900 dark:text-white">Vencem Hoje</h2>
              <span className="ml-auto bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-bold px-2 py-1 rounded-full">
                {expiring.today.length}
              </span>
            </div>
            {expiring.today.length > 0 && (
              <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/50">
                <button
                  onClick={() => setContactsModal({ isOpen: true, title: 'Vencem Hoje', users: expiring.today, messageType: 'expiring_today' })}
                  className="w-full py-2 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Lucide.Users className="w-4 h-4" /> Ver Contatos
                </button>
              </div>
            )}
            <div className="p-4 flex-1">
              {renderUserTable(expiring.today, 'Nenhum usuário com vencimento para hoje.', 'expiring_today')}
            </div>
          </div>

          {/* In 3 Days */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Lucide.CalendarClock className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-surface-900 dark:text-white">Vencem em até 3 dias</h2>
              <span className="ml-auto bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-bold px-2 py-1 rounded-full">
                {expiring.in3Days.length}
              </span>
            </div>
            {expiring.in3Days.length > 0 && (
              <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/50">
                <button
                  onClick={() => setContactsModal({ isOpen: true, title: 'Vencem em até 3 dias', users: expiring.in3Days, messageType: 'expiring_3_days' })}
                  className="w-full py-2 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Lucide.Users className="w-4 h-4" /> Ver Contatos
                </button>
              </div>
            )}
            <div className="p-4 flex-1">
              {renderUserTable(expiring.in3Days, 'Nenhum usuário com vencimento em 3 dias.', 'expiring_3_days')}
            </div>
          </div>

          {/* In 7 Days */}
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lucide.CalendarDays className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-surface-900 dark:text-white">Vencem em até 7 dias</h2>
              <span className="ml-auto bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-bold px-2 py-1 rounded-full">
                {expiring.in7Days.length}
              </span>
            </div>
            {expiring.in7Days.length > 0 && (
              <div className="px-5 py-3 border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/50">
                <button
                  onClick={() => setContactsModal({ isOpen: true, title: 'Vencem em até 7 dias', users: expiring.in7Days, messageType: 'expiring_7_days' })}
                  className="w-full py-2 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Lucide.Users className="w-4 h-4" /> Ver Contatos
                </button>
              </div>
            )}
            <div className="p-4 flex-1">
              {renderUserTable(expiring.in7Days, 'Nenhum usuário com vencimento em 7 dias.', 'expiring_7_days')}
            </div>
          </div>
        </div>

      </div>

      {/* Contacts Modal */}
      {contactsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-800 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2">
                  <Lucide.Users className="w-5 h-5 text-brand-500" />
                  Lista de Contatos - {contactsModal.title}
                </h3>
                <p className="text-sm text-surface-500 mt-1">
                  Ações individuais de WhatsApp para os usuários selecionados.
                </p>
              </div>
              <button onClick={() => setContactsModal({ ...contactsModal, isOpen: false })} className="p-2 -mr-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Lucide.X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-surface-50 dark:bg-surface-950/30">
              {contactsModal.users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-surface-900 dark:text-white truncate">{user.name}</div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2 mt-1">
                      <Lucide.Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-surface-600 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 px-3 py-1 rounded-lg">
                      {user.phone || 'Sem telefone'}
                    </div>
                    {user.phone ? (
                      <a
                        href={getWhatsappLink(user.phone, getWhatsappMessage(contactsModal.messageType, user as any)) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Lucide.MessageCircle className="w-4 h-4" />
                        Abrir
                      </a>
                    ) : (
                      <button disabled className="px-4 py-2 bg-surface-200 dark:bg-surface-800 text-surface-400 dark:text-surface-500 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2">
                        <Lucide.MessageCircle className="w-4 h-4" />
                        Abrir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 flex justify-end">
              <button
                onClick={() => setContactsModal({ ...contactsModal, isOpen: false })}
                className="px-6 py-2 bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
