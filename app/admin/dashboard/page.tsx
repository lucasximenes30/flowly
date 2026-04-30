'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'

type DashboardStats = {
  totalUsers: number
  vipUsers: number
  pendingUsers: number
  inactiveUsers: number
}

type UserData = {
  id: string
  name: string
  email: string
  plan: string
  subscriptionStatus: string
  subscriptionExpiresAt: string | null
}

type ExpiringData = {
  today: UserData[]
  in3Days: UserData[]
  in7Days: UserData[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [expiring, setExpiring] = useState<ExpiringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, expiringRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/dashboard/expiring'),
        ])

        if (!statsRes.ok || !expiringRes.ok) {
          throw new Error('Erro ao carregar dados do dashboard')
        }

        const statsData = await statsRes.json()
        const expiringData = await expiringRes.json()

        setStats(statsData)
        setExpiring(expiringData)
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

  if (error || !stats || !expiring) {
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

  const renderUserTable = (users: UserData[], emptyMessage: string) => {
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
              <th className="pb-3 px-4 hidden sm:table-cell">Plano</th>
              <th className="pb-3 px-4 hidden sm:table-cell">Status</th>
              <th className="pb-3 px-4 text-right">Vencimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800/50">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-surface-900 dark:text-surface-100 truncate max-w-[200px] sm:max-w-xs">{user.name}</div>
                  <div className="text-xs text-surface-500 truncate max-w-[200px] sm:max-w-xs">{user.email}</div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                    {user.plan === 'PRO' ? 'VIP' : user.plan}
                  </span>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {user.subscriptionStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium text-surface-900 dark:text-surface-300">
                  {formatDate(user.subscriptionExpiresAt)}
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

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-xl flex items-center justify-center">
                <Lucide.Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center">
                <Lucide.Crown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">VIPs Ativos</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.vipUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <Lucide.Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Pendentes</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.pendingUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
                <Lucide.UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Inativos</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.inactiveUsers}</p>
              </div>
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
            <div className="p-4 flex-1">
              {renderUserTable(expiring.today, 'Nenhum usuário com vencimento para hoje.')}
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
            <div className="p-4 flex-1">
              {renderUserTable(expiring.in3Days, 'Nenhum usuário com vencimento em 3 dias.')}
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
            <div className="p-4 flex-1">
              {renderUserTable(expiring.in7Days, 'Nenhum usuário com vencimento em 7 dias.')}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
