'use client'

import { useEffect, useState } from 'react'
import * as Lucide from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type UserDetails = {
  id: string
  name: string
  email: string
  plan: string
  role: string
  subscriptionStatus: string
  createdAt: string
  phone?: string | null
}

export default function UserDetailsModal({
  user,
  onClose,
}: {
  user: UserDetails | null
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (user) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [user])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  if (!user) return null

  // Ensure robust formatting even if user lacks some fields somehow
  const joinedDate = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }).format(new Date(user.createdAt))

  const isActive = user.subscriptionStatus === 'ACTIVE'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-surface-900 border border-surface-200 dark:border-surface-700/60 transition-all duration-300 sm:duration-200 ${visible ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30">
          <h2 className="text-xl font-display font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <Lucide.UserCircle className="w-6 h-6 text-brand-500" />
            Detalhes do Usuário
          </h2>
          <button onClick={handleClose} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors">
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Nome</label>
              <div className="font-medium text-surface-900 dark:text-surface-100 text-lg">{user.name}</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">E-mail</label>
              <div className="font-medium text-surface-900 dark:text-surface-100">{user.email}</div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Telefone</label>
              <div className="flex items-center gap-2 font-medium text-surface-900 dark:text-surface-100">
                {user.phone ? (
                  <>
                    <span>{user.phone}</span>
                    <a 
                      href={`https://wa.me/${user.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Estou entrando em contato sobre o seu acesso ao Vynta.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-md text-xs font-semibold transition-colors"
                    >
                      <Lucide.MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </>
                ) : (
                  <span className="text-surface-400 italic">Não informado</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Status da Conta</label>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-400'
                }`}>
                  {isActive ? 'ATIVO' : user.subscriptionStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Tipo de Acesso</label>
              <div className="font-medium text-surface-900 dark:text-surface-100">
                {user.role === 'ADMIN' ? 'Admin' : user.role === 'COURTESY' ? 'Courtesy' : user.plan === 'PRO' ? 'VIP (Pro)' : 'Free'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">Data de Cadastro</label>
              <div className="font-medium text-surface-900 dark:text-surface-100">{joinedDate}</div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">ID do Usuário</label>
              <div className="font-mono text-sm text-surface-600 dark:text-surface-300 p-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg break-all">
                {user.id}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}
