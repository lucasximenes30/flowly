'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  return (
    <AnimatePresence>
      {isOpen && goal && (
        <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-sm bg-surface-50 dark:bg-surface-950 sm:rounded-[2.5rem] rounded-t-[2.5rem] p-1.5 shadow-2xl relative border border-white/10"
          >
            <div className="bg-white dark:bg-surface-900 rounded-t-[calc(2.5rem-0.375rem)] sm:rounded-[calc(2.5rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 z-10 opacity-70" />
              
              {/* Mobile Drag Pill */}
              <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0 relative z-20">
                <div className="w-12 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-6 sm:p-8 pb-4 pt-2 sm:pt-8">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-surface-900 dark:text-white leading-tight">
                    Atualizar Progresso
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 truncate max-w-[200px] sm:max-w-[250px] font-medium">
                    {goal.title}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-full text-surface-400 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors"
                >
                  <Lucide.X strokeWidth={1.5} className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 scrollbar-thin">
                <form id="tx-form" onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-500/20"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex bg-surface-100/50 dark:bg-surface-800/50 p-1.5 rounded-2xl border border-surface-200 dark:border-surface-700/50">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'DEPOSIT' })}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${formData.type === 'DEPOSIT' ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}`}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'WITHDRAW' })}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${formData.type === 'WITHDRAW' ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'}`}
                    >
                      Retirar
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">
                      Valor (R$)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full font-mono text-2xl font-bold tracking-tight rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-50 dark:bg-surface-800 px-5 py-4 text-surface-900 dark:text-white placeholder:text-surface-300 dark:placeholder:text-surface-600 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 mb-2">
                      Descrição (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-2xl border border-surface-200 dark:border-surface-700/80 bg-surface-50 dark:bg-surface-800 px-5 py-3.5 text-base font-medium text-surface-900 dark:text-white placeholder:text-surface-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Ex: Bônus do mês"
                    />
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-6 sm:p-8 pt-6 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex gap-3 pb-safe">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-full border border-surface-200 dark:border-surface-700 font-semibold text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="tx-form"
                  disabled={loading}
                  className={`flex-1 py-3.5 rounded-full text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${formData.type === 'WITHDRAW' ? 'bg-surface-800 hover:bg-surface-900 dark:bg-surface-100 dark:hover:bg-white dark:text-surface-900 shadow-lg shadow-black/10' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_8px_16px_-6px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(16,185,129,0.6)]'}`}
                >
                  {loading ? (
                    <>
                      <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${formData.type === 'WITHDRAW' ? 'border-white dark:border-surface-900' : 'border-white'}`} />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>Confirmar</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
