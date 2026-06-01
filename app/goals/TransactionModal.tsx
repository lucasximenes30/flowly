'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'

export default function TransactionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  goal 
}: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  goal: any | null
}) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'DEPOSIT',
    description: '',
  })

  useEffect(() => {
    setFormData({
      amount: '',
      type: 'DEPOSIT',
      description: '',
    })
    setErrorMsg('')
  }, [isOpen, goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) return
    setErrorMsg('')
    try {
      setLoading(true)
      const res = await fetch(`/api/goals/${goal.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Erro ao processar transação')
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !goal) return null

  return (
    <div className={`fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 transition-opacity duration-200 opacity-100 backdrop-blur-sm`}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-surface-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border-t border-surface-100 dark:border-surface-800/80 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 z-10" />
        
        {/* Header Fixo */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4 border-b border-surface-100 dark:border-surface-800">
          <div>
            <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white leading-tight">
              Atualizar Progresso
            </h2>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 truncate max-w-[250px]">
              {goal.title}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors"
          >
            <Lucide.X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-100 dark:border-red-500/20">
                {errorMsg}
              </div>
            )}

            <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'DEPOSIT' })}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.type === 'DEPOSIT' ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}`}
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'WITHDRAW' })}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.type === 'WITHDRAW' ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}`}
              >
                Retirar
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Valor (R$) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="input-field text-lg font-bold"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Descrição (Opcional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Ex: Bônus do mês"
              />
            </div>
          </form>
        </div>

        {/* Footer Fixo */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={loading}
            className={`btn-primary flex-1 flex items-center justify-center gap-2 ${formData.type === 'WITHDRAW' ? 'bg-surface-800 hover:bg-surface-900 dark:bg-surface-100 dark:hover:bg-white dark:text-surface-900' : 'bg-emerald-500 hover:bg-emerald-600 ring-emerald-500'}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Confirmar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
