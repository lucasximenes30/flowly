'use client'

import { useEffect, useState } from 'react'
import * as Lucide from 'lucide-react'
import { changeUserAccess } from './actions'

type FeatureFlags = {
  canUseFinance: boolean
  canUseHabits: boolean
  canUseWorkout: boolean
  canUseGoals: boolean
  canUseNotes: boolean
  canUseAgenda: boolean
}

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
  const [fetching, setFetching] = useState(false)
  
  const [plan, setPlan] = useState<string>('FREE')
  const [features, setFeatures] = useState<FeatureFlags>({
    canUseFinance: false,
    canUseHabits: false,
    canUseWorkout: false,
    canUseGoals: false,
    canUseNotes: false,
    canUseAgenda: false,
  })

  useEffect(() => {
    if (userId) {
      requestAnimationFrame(() => setVisible(true))
      setFetching(true)
      fetch(`/api/admin/users/${userId}/details`)
        .then((r) => r.json())
        .then((data) => {
          setPlan(data.plan || 'FREE')
          setFeatures({
            canUseFinance: !!data.canUseFinance,
            canUseHabits: !!data.canUseHabits,
            canUseWorkout: !!data.canUseWorkout,
            canUseGoals: !!data.canUseGoals,
            canUseNotes: !!data.canUseNotes,
            canUseAgenda: !!data.canUseAgenda,
          })
        })
        .finally(() => setFetching(false))
    } else {
      setVisible(false)
    }
  }, [userId])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleSave = async () => {
    if (!userId) return
    setLoading(true)
    
    // Determine role based on plan
    let role = 'USER'
    if (plan === 'ADMIN') role = 'ADMIN'
    else if (plan === 'COURTESY') role = 'COURTESY'

    try {
      await changeUserAccess(userId, {
        plan,
        role,
        ...features
      })
      handleClose()
    } catch (error) {
      console.error('Failed to change access', error)
      alert('Erro ao alterar acesso. Verifique suas permissões.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (key: keyof FeatureFlags) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const applyDefaults = (selectedPlan: string) => {
    setPlan(selectedPlan)
    if (selectedPlan === 'PRO' || selectedPlan === 'PRO_YEARLY' || selectedPlan === 'ADMIN' || selectedPlan === 'COURTESY') {
      setFeatures({ canUseFinance: true, canUseHabits: true, canUseWorkout: true, canUseGoals: true, canUseNotes: true, canUseAgenda: true })
    } else if (selectedPlan === 'VIP' || selectedPlan === 'FREE_TRIAL') {
      setFeatures({ canUseFinance: true, canUseHabits: true, canUseWorkout: true, canUseGoals: false, canUseNotes: false, canUseAgenda: false })
    } else if (selectedPlan === 'FREE') {
      setFeatures({ canUseFinance: false, canUseHabits: false, canUseWorkout: false, canUseGoals: false, canUseNotes: false, canUseAgenda: false })
    }
  }

  if (!userId) return null

  const featureItems: { key: keyof FeatureFlags; label: string; icon: any }[] = [
    { key: 'canUseFinance', label: 'Finanças', icon: Lucide.DollarSign },
    { key: 'canUseHabits', label: 'Hábitos', icon: Lucide.CheckSquare },
    { key: 'canUseWorkout', label: 'Treinos', icon: Lucide.Activity },
    { key: 'canUseGoals', label: 'Metas', icon: Lucide.Target },
    { key: 'canUseNotes', label: 'Notas', icon: Lucide.StickyNote },
    { key: 'canUseAgenda', label: 'Agenda', icon: Lucide.Calendar },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-surface-900 border border-surface-200 dark:border-surface-700/60 transition-all duration-300 sm:duration-200 ${visible ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30">
          <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <Lucide.ShieldAlert className="w-5 h-5 text-brand-500" />
            Acessos e Recursos
          </h2>
          <button onClick={handleClose} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors">
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-10 text-surface-400">
              <Lucide.Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Carregando permissões...</p>
            </div>
          ) : (
            <>
              {/* Plan Selection */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500 mb-3">Plano</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['PRO', 'PRO_YEARLY', 'VIP', 'FREE_TRIAL', 'COURTESY', 'ADMIN', 'FREE'].map((p) => (
                    <button
                      key={p}
                      onClick={() => applyDefaults(p)}
                      className={`py-2 px-3 rounded-xl border text-sm font-bold transition-colors ${
                        plan === p
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                          : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      {p === 'FREE_TRIAL' ? 'TRIAL' : p === 'PRO_YEARLY' ? 'PRO ANUAL' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Toggles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500">Recursos Permitidos</h3>
                  <p className="text-xs text-surface-400">Pode ser modificado manualmente</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featureItems.map((item) => {
                    const Icon = item.icon
                    const isEnabled = features[item.key]
                    return (
                      <button
                        key={item.key}
                        onClick={() => toggleFeature(item.key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          isEnabled
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100'
                            : 'border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-surface-500 dark:text-surface-600 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-surface-200 dark:bg-surface-800 text-surface-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">{item.label}</span>
                        <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${isEnabled ? 'border-emerald-500 bg-emerald-500' : 'border-surface-300 dark:border-surface-700'}`}>
                          {isEnabled && <Lucide.Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
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
                    'Salvar'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
