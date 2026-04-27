'use client'

import { useEffect, useState } from 'react'
import * as Lucide from 'lucide-react'
import { changeUserAccess } from './actions'

export default function ChangeAccessModal({
  userId,
  userName,
  currentRole,
  currentPlan,
  onClose,
}: {
  userId: string | null
  userName: string | null
  currentRole: string | null
  currentPlan: string | null
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'ADMIN' | 'COURTESY' | 'VIP'>('VIP')

  useEffect(() => {
    if (userId) {
      requestAnimationFrame(() => setVisible(true))
      
      // Determine current tier to pre-select
      if (currentRole === 'ADMIN') setSelectedTier('ADMIN')
      else if (currentRole === 'COURTESY') setSelectedTier('COURTESY')
      else setSelectedTier('VIP')

    } else {
      setVisible(false)
    }
  }, [userId, currentRole, currentPlan])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleSave = async () => {
    if (!userId) return
    setLoading(true)
    try {
      await changeUserAccess(userId, selectedTier)
      handleClose()
    } catch (error) {
      console.error('Failed to change access', error)
      alert('Erro ao alterar acesso. Verifique suas permissões.')
    } finally {
      setLoading(false)
    }
  }

  if (!userId) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-surface-900 border border-surface-200 dark:border-surface-700/60 transition-all duration-300 sm:duration-200 ${visible ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30">
          <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <Lucide.ShieldAlert className="w-5 h-5 text-brand-500" />
            Alterar Acesso
          </h2>
          <button onClick={handleClose} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors">
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-surface-600 dark:text-surface-300 text-sm">
            Selecione o novo nível de acesso para <strong>{userName}</strong>.
          </p>

          <div className="space-y-3">
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTier === 'VIP' 
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' 
                  : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value="VIP"
                checked={selectedTier === 'VIP'}
                onChange={() => setSelectedTier('VIP')}
                className="mt-1 w-4 h-4 text-brand-600 bg-surface-100 border-surface-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-surface-800 focus:ring-2 dark:bg-surface-700 dark:border-surface-600"
              />
              <div>
                <div className="font-bold text-surface-900 dark:text-white">VIP (Pro)</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Acesso completo pago ao app.</div>
              </div>
            </label>

            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTier === 'COURTESY' 
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' 
                  : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value="COURTESY"
                checked={selectedTier === 'COURTESY'}
                onChange={() => setSelectedTier('COURTESY')}
                className="mt-1 w-4 h-4 text-brand-600 bg-surface-100 border-surface-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-surface-800 focus:ring-2 dark:bg-surface-700 dark:border-surface-600"
              />
              <div>
                <div className="font-bold text-surface-900 dark:text-white">Courtesy</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Acesso completo gratuito cedido pela plataforma.</div>
              </div>
            </label>

            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTier === 'ADMIN' 
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' 
                  : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value="ADMIN"
                checked={selectedTier === 'ADMIN'}
                onChange={() => setSelectedTier('ADMIN')}
                className="mt-1 w-4 h-4 text-brand-600 bg-surface-100 border-surface-300 focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-surface-800 focus:ring-2 dark:bg-surface-700 dark:border-surface-600"
              />
              <div>
                <div className="font-bold text-surface-900 dark:text-white flex items-center gap-2">
                  Admin
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded text-[10px] uppercase font-bold tracking-wider">Perigo</span>
                </div>
                <div className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Acesso completo ao app E controle total sobre o painel de administração.</div>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-600/20 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Lucide.Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Salvar Acesso'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
