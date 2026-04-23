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

import UserDetailsModal, { UserDetails } from './UserDetailsModal'
import ChangeAccessModal from './ChangeAccessModal'
import TemporaryPasswordModal from './TemporaryPasswordModal'

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
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [modalType, setModalType] = useState<'details' | 'access' | 'password' | 'mobileActions' | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(`/admin/users?search=${encodeURIComponent(search)}`)
    })
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

  const closeModal = () => {
    setModalType(null)
    setTimeout(() => setSelectedUser(null), 200)
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-surface-900 p-4 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 w-full">
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
            className="w-full sm:w-auto px-6 py-2.5 bg-surface-800 dark:bg-surface-100 hover:bg-surface-900 dark:hover:bg-white text-white dark:text-surface-900 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Lucide.Loader2 className="w-4 h-4 animate-spin" />}
            Buscar
          </button>
        </form>
      </div>

      {/* Users Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-50 dark:bg-surface-950/50 border-b border-surface-200 dark:border-surface-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Usuário</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Acesso</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Status</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Cadastro</th>
                <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {initialUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                initialUsers.map((user) => {
                  const isActive = user.subscriptionStatus === 'ACTIVE'
                  const isLoadingStatus = loadingAction === `status-${user.id}`
                  
                  // Determine display tier
                  let displayTier = 'Free'
                  if (user.role === 'ADMIN') displayTier = 'Admin'
                  else if (user.role === 'COURTESY') displayTier = 'Courtesy'
                  else if (user.plan === 'PRO') displayTier = 'VIP (Pro)'

                  return (
                    <tr key={user.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-surface-900 dark:text-surface-100">{user.name}</div>
                        <div className="text-xs text-surface-500 mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          user.role === 'COURTESY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                          user.plan === 'PRO' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' :
                          'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                        }`}>
                          {displayTier}
                        </span>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedUser(user); setModalType('details'); }}
                            title="Ver Detalhes"
                            className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-200 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            <Lucide.Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => { setSelectedUser(user); setModalType('access'); }}
                            title="Alterar Acesso"
                            className="p-1.5 text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:text-brand-400 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                          >
                            <Lucide.ShieldAlert className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => { setSelectedUser(user); setModalType('password'); }}
                            title="Redefinir Senha"
                            className="p-1.5 text-surface-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                          >
                            <Lucide.Key className="w-4 h-4" />
                          </button>

                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleStatusChange(user.id, !isActive)}
                              disabled={isLoadingStatus}
                              title={isActive ? 'Inativar Conta' : 'Ativar Conta'}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                isActive 
                                  ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-300 dark:hover:bg-red-500/10' 
                                  : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10'
                              }`}
                            >
                              {isLoadingStatus ? (
                                <Lucide.Loader2 className="w-4 h-4 animate-spin" />
                              ) : isActive ? (
                                <Lucide.PowerOff className="w-4 h-4" />
                              ) : (
                                <Lucide.Power className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {initialUsers.length === 0 ? (
          <div className="py-12 text-center text-surface-500 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
            Nenhum usuário encontrado.
          </div>
        ) : (
          initialUsers.map((user) => {
            const isActive = user.subscriptionStatus === 'ACTIVE'
            const isLoadingStatus = loadingAction === `status-${user.id}`
            
            let displayTier = 'Free'
            if (user.role === 'ADMIN') displayTier = 'Admin'
            else if (user.role === 'COURTESY') displayTier = 'Courtesy'
            else if (user.plan === 'PRO') displayTier = 'VIP (Pro)'

            return (
              <div key={user.id} className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-sm border border-surface-200 dark:border-surface-800 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-surface-900 dark:text-surface-100 truncate">{user.name}</div>
                    <div className="text-sm text-surface-500 dark:text-surface-400 truncate mt-0.5">{user.email}</div>
                  </div>
                  <button
                    onClick={() => { setSelectedUser(user); setModalType('mobileActions'); }}
                    className="p-2 -mr-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-200 dark:hover:bg-surface-800 rounded-xl transition-colors"
                  >
                    <Lucide.MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                    user.role === 'COURTESY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                    user.plan === 'PRO' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' :
                    'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                  }`}>
                    {displayTier}
                  </span>
                  
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-400'
                    }`}
                  >
                    {isActive ? 'Ativo' : user.subscriptionStatus}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Mobile Actions Bottom Sheet Modal */}
      {modalType === 'mobileActions' && selectedUser && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full bg-white dark:bg-surface-900 rounded-t-3xl border-t border-surface-200 dark:border-surface-800 overflow-hidden animate-in slide-in-from-bottom pb-8">
            <div className="px-6 py-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
              <h3 className="font-bold text-surface-900 dark:text-white">Ações do Usuário</h3>
              <button onClick={closeModal} className="p-2 -mr-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                <Lucide.X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <button
                onClick={() => setModalType('details')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface-50 dark:bg-surface-950 text-surface-700 dark:text-surface-200 font-medium active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-surface-200 dark:bg-surface-800 rounded-xl text-surface-600 dark:text-surface-400">
                  <Lucide.Eye className="w-5 h-5" />
                </div>
                Ver Detalhes Completos
              </button>
              
              <button
                onClick={() => setModalType('access')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-brand-200/50 dark:bg-brand-500/20 rounded-xl">
                  <Lucide.ShieldAlert className="w-5 h-5" />
                </div>
                Alterar Nível de Acesso
              </button>

              <button
                onClick={() => setModalType('password')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium active:scale-[0.98] transition-transform"
              >
                <div className="p-2 bg-amber-200/50 dark:bg-amber-500/20 rounded-xl">
                  <Lucide.Key className="w-5 h-5" />
                </div>
                Gerar Senha Temporária
              </button>

              {selectedUser.role !== 'ADMIN' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedUser.id, selectedUser.subscriptionStatus !== 'ACTIVE')
                    closeModal()
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl font-medium active:scale-[0.98] transition-transform ${
                    selectedUser.subscriptionStatus === 'ACTIVE'
                      ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${
                    selectedUser.subscriptionStatus === 'ACTIVE'
                      ? 'bg-red-200/50 dark:bg-red-500/20'
                      : 'bg-emerald-200/50 dark:bg-emerald-500/20'
                  }`}>
                    {selectedUser.subscriptionStatus === 'ACTIVE' ? <Lucide.PowerOff className="w-5 h-5" /> : <Lucide.Power className="w-5 h-5" />}
                  </div>
                  {selectedUser.subscriptionStatus === 'ACTIVE' ? 'Inativar Conta' : 'Ativar Conta'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <UserDetailsModal
        user={modalType === 'details' ? (selectedUser as UserDetails) : null}
        onClose={closeModal}
      />
      <ChangeAccessModal
        userId={modalType === 'access' ? selectedUser?.id || null : null}
        userName={selectedUser?.name || null}
        currentRole={selectedUser?.role || null}
        currentPlan={selectedUser?.plan || null}
        onClose={closeModal}
      />
      <TemporaryPasswordModal
        userId={modalType === 'password' ? selectedUser?.id || null : null}
        userName={selectedUser?.name || null}
        onClose={closeModal}
      />
    </div>
  )
}
