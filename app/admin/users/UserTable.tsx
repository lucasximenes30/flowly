'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { changeUserAccess, changeUserStatus } from './actions'

type UserData = {
  id: string
  name: string
  email: string
  plan: string
  role: string
  subscriptionStatus: string
  createdAt: string
}

export default function UserTable({

  initialUsers,
  initialSearch,
}: {
  initialUsers: UserData[]
  initialSearch: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/admin/users?search=${encodeURIComponent(search)}`)
    })
  }

  const handleAccessChange = async (userId: string, type: 'FREE' | 'VIP' | 'COURTESY') => {
    if (confirm(`Confirmar alteração de plano?`)) {
      setLoadingAction(`access-${userId}`)
      try {
        await changeUserAccess(userId, type)
      } finally {
        setLoadingAction(null)
      }
    }
  }

  const handleStatusChange = async (userId: string, active: boolean) => {
    const actionText = active ? 'ATIVAR' : 'INATIVAR'
    if (confirm(`Deseja realmente ${actionText} esta conta?`)) {
      setLoadingAction(`status-${userId}`)
      try {
        await changeUserStatus(userId, active)
      } finally {
        setLoadingAction(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-surface-900 p-4 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              <Lucide.Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
              placeholder="Buscar por nome ou e-mail..."
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-surface-800 dark:bg-surface-100 hover:bg-surface-900 dark:hover:bg-white text-white dark:text-surface-900 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Lucide.Loader2 className="w-4 h-4 animate-spin" />}
            Buscar
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 dark:bg-surface-950/50 border-b border-surface-200 dark:border-surface-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Usuário</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Contato</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Acesso</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Status</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Cadastro</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {initialUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                initialUsers.map((user) => {
                  const isFree = user.plan === 'FREE' && user.role !== 'COURTESY' && user.role !== 'ADMIN'
                  const isVIP = user.plan === 'PRO' && user.role === 'USER'
                  const isCourtesy = user.role === 'COURTESY'
                  const isActive = user.subscriptionStatus === 'ACTIVE'
                  const isLoadingAccess = loadingAction === `access-${user.id}`
                  const isLoadingStatus = loadingAction === `status-${user.id}`

                  return (
                    <tr key={user.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-surface-900 dark:text-surface-100">{user.name}</div>
                        <div className="text-xs text-surface-500 mt-0.5 font-mono">{user.id.split('-')[0]}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-surface-700 dark:text-surface-300">{user.email}</div>
                        <div className="text-xs text-surface-400 mt-0.5">Telefone: Não informado</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center">
                          <select
                            disabled={isLoadingAccess || user.role === 'ADMIN'}
                            className="bg-transparent border border-surface-200 dark:border-surface-700 rounded-lg text-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-brand-500 outline-none disabled:opacity-50"
                            value={isCourtesy ? 'COURTESY' : isVIP ? 'VIP' : isFree ? 'FREE' : 'OTHER'}
                            onChange={(e) => handleAccessChange(user.id, e.target.value as any)}
                          >
                            <option value="FREE">Free</option>
                            <option value="VIP">VIP (Pro)</option>
                            <option value="COURTESY">Courtesy</option>
                            {user.role === 'ADMIN' && <option value="OTHER">Admin</option>}
                            {user.role === 'LEGACY' && <option value="OTHER">Legacy</option>}
                          </select>
                          {isLoadingAccess && <Lucide.Loader2 className="w-4 h-4 ml-2 animate-spin text-brand-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-400'
                          }`}
                        >
                          {isActive ? 'Ativo' : user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                        {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.createdAt))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleStatusChange(user.id, !isActive)}
                            disabled={isLoadingStatus}
                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                              isActive 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20' 
                                : 'bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20'
                            }`}
                          >
                            {isLoadingStatus ? (
                              <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isActive ? (
                              'Inativar'
                            ) : (
                              'Ativar'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
