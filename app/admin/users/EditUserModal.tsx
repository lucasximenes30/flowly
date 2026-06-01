'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditUserModal({
  user,
  onClose,
}: {
  user: { id: string; name: string; email: string; phone?: string | null } | null
  onClose: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone || '')
    }
  }, [user])

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar usuário')
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 flex flex-col justify-end md:items-center md:justify-center pointer-events-none p-0 md:p-4">
        <div 
          className="pointer-events-auto w-full md:max-w-md bg-white shadow-2xl dark:bg-surface-900 md:dark:border dark:border-surface-700/60 rounded-t-[2rem] md:rounded-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Pill */}
          <div className="md:hidden flex justify-center pt-4 pb-2 shrink-0">
            <div className="w-12 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full" />
          </div>

          <div className="px-6 py-4 pt-0 md:pt-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-lg text-surface-900 dark:text-white">Editar Usuário</h3>
            <button onClick={onClose} className="p-1.5 rounded-full text-surface-400 bg-surface-100 dark:bg-surface-800 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
              <Lucide.X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto pb-safe flex-1" style={{ scrollbarWidth: 'none' }}>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="edit-name" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Nome completo
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
            />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="edit-email" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              E-mail
            </label>
            <input
              id="edit-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-phone" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Telefone (WhatsApp) <span className="text-surface-400 font-normal">(opcional)</span>
            </label>
            <input
              id="edit-phone"
              type="text"
              placeholder="+55 11 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Lucide.Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  )
}
