'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'

const COLORS = [
  { value: 'bg-brand-500', label: 'Roxo (Padrão)' },
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-emerald-500', label: 'Verde' },
  { value: 'bg-orange-500', label: 'Laranja' },
  { value: 'bg-pink-500', label: 'Rosa' },
  { value: 'bg-yellow-500', label: 'Amarelo' },
]

const CATEGORIES = ['Viagem', 'Reserva de Emergência', 'Educação', 'Investimento', 'Veículo', 'Imóvel', 'Geral']

export default function GoalModal({ 
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'Geral',
    description: '',
    color: 'bg-brand-500',
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
        category: goal.category || 'Geral',
        description: goal.description || '',
        color: goal.color || 'bg-brand-500',
      })
    } else {
      setFormData({
        title: '',
        targetAmount: '',
        deadline: '',
        category: 'Geral',
        description: '',
        color: 'bg-brand-500',
      })
    }
    setShowDeleteConfirm(false)
  }, [goal, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const url = goal ? `/api/goals/${goal.id}` : '/api/goals'
      const method = goal ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
      } else {
        console.error('Erro ao salvar meta')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!goal) return
    try {
      setLoading(true)
      const res = await fetch(`/api/goals/${goal.id}`, { method: 'DELETE' })
      if (res.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 transition-opacity duration-200 opacity-100 backdrop-blur-sm`}>
      <div 
        className="w-full max-w-md bg-white dark:bg-surface-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border-t border-surface-100 dark:border-surface-800/80 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-300" 
        style={{ maxHeight: 'min(92vh, 44rem)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-pink-500 z-10" />
        
        {/* Header Fixo */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4 border-b border-surface-100 dark:border-surface-800">
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
            {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
          </h2>
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
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Título *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Ex: Viagem para Europa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Valor Alvo (R$) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount}
                  onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="input-field"
                  placeholder="10000.00"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Prazo (Opcional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Categoria</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Cor</label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-8 h-8 rounded-full ${c.value} transition-all duration-200 ${formData.color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-surface-900 shadow-lg shadow-brand-500/20' : 'hover:scale-110 hover:shadow-md opacity-80 hover:opacity-100'}`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Descrição</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field resize-none min-h-[80px]"
                placeholder="Por que essa meta é importante?"
              />
            </div>
          </form>
        </div>

        {/* Footer Fixo */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50">
          {showDeleteConfirm ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-2 items-start text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
                <Lucide.AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  Tem certeza que deseja excluir esta meta? Isso não apagará o dinheiro real, mas o progresso será perdido.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="btn-secondary flex-1"
                >
                  Manter
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700 hover:shadow-red-500/20 ring-red-500"
                >
                  {loading ? 'Excluindo...' : 'Excluir Meta'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {goal && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                  title="Excluir meta"
                >
                  <Lucide.Trash2 className="w-5 h-5" />
                </button>
              )}
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
                form="goal-form"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>{goal ? 'Salvar Edição' : 'Criar Meta'}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
