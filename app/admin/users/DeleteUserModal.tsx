'use client'

import { useState } from 'react'
import * as Lucide from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeleteUserModal({
  userId,
  userName,
  onClose,
}: {
  userId: string | null
  userName: string | null
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!userId) return null

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao deletar usuário')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Excluir Usuário</h3>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <Lucide.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Lucide.AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-surface-700 dark:text-surface-300">
              Tem certeza que deseja excluir o usuário <span className="font-bold text-surface-900 dark:text-white">{userName}</span>?
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Esta ação é irreversível. Todos os dados associados a este usuário serão permanentemente apagados.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Lucide.Loader2 className="w-4 h-4 animate-spin" /> : <Lucide.Trash2 className="w-4 h-4" />}
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
