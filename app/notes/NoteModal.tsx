'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'

const COLORS = [
  { value: 'default', label: 'Padrão' },
  { value: 'brand', label: 'Roxo' },
  { value: 'emerald', label: 'Verde' },
  { value: 'orange', label: 'Laranja' },
  { value: 'blue', label: 'Azul' },
  { value: 'rose', label: 'Rosa' },
]

export default function NoteModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  note 
}: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  note: any | null
}) {
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    color: 'default',
    isPinned: false,
  })

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        category: note.category || '',
        color: note.color || 'default',
        isPinned: note.isPinned || false,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: '',
        color: 'default',
        isPinned: false,
      })
    }
    setShowDeleteConfirm(false)
  }, [note, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const url = note ? `/api/notes/${note.id}` : '/api/notes'
      const method = note ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        onSuccess()
      } else {
        console.error('Erro ao salvar nota')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return
    try {
      setLoading(true)
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' })
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

  // Define background map for preview
  let bgClassPreview = 'bg-white dark:bg-surface-900 border-surface-100 dark:border-surface-800'
  if (formData.color === 'brand') bgClassPreview = 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30'
  if (formData.color === 'emerald') bgClassPreview = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
  if (formData.color === 'orange') bgClassPreview = 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
  if (formData.color === 'blue') bgClassPreview = 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
  if (formData.color === 'rose') bgClassPreview = 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 transition-opacity duration-200 opacity-100 backdrop-blur-sm`}>
      <div 
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border-t transition-colors duration-300 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in ${bgClassPreview}`}
        style={{ maxHeight: 'min(92vh, 44rem)' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
              {note ? 'Editar Nota' : 'Nova Smart Note'}
            </h2>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
              className={`p-1.5 rounded-full transition-all ${formData.isPinned ? 'bg-brand-500 text-white shadow-md' : 'text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800'}`}
              title="Fixar no topo"
            >
              <Lucide.Pin className="w-4 h-4" />
            </button>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
          >
            <Lucide.X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form id="note-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-transparent text-xl font-bold text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500 border-none focus:ring-0 p-0 mb-2"
                placeholder="Título (opcional)"
              />
            </div>

            <div>
              <textarea
                required
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-transparent text-sm sm:text-base text-surface-700 dark:text-surface-300 placeholder:text-surface-400 border-none focus:ring-0 p-0 resize-none min-h-[200px]"
                placeholder="Comece a escrever sua nota..."
              />
            </div>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="text-xs bg-surface-100 dark:bg-surface-800 border-none rounded-md px-3 py-1.5 font-medium text-surface-700 dark:text-surface-300 focus:ring-1 focus:ring-brand-500 w-32"
                placeholder="Categoria..."
              />

              <div className="flex gap-2">
                {COLORS.map(c => {
                  let btnBg = 'bg-surface-200 dark:bg-surface-700'
                  if (c.value === 'brand') btnBg = 'bg-brand-500'
                  if (c.value === 'emerald') btnBg = 'bg-emerald-500'
                  if (c.value === 'orange') btnBg = 'bg-orange-500'
                  if (c.value === 'blue') btnBg = 'bg-blue-500'
                  if (c.value === 'rose') btnBg = 'bg-rose-500'

                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-6 h-6 rounded-full ${btnBg} transition-all ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-surface-900 scale-110 shadow-md' : 'hover:scale-110'}`}
                      title={c.label}
                    />
                  )
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer Fixo */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-black/5 dark:bg-white/5 backdrop-blur-md">
          {showDeleteConfirm ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                Deseja excluir esta nota permanentemente?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="btn-secondary flex-1 border-surface-300 dark:border-surface-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700 ring-red-500 border-none"
                >
                  {loading ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {note && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 border border-transparent"
                >
                  <Lucide.Trash2 className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800"
              >
                Fechar
              </button>
              <button
                type="submit"
                form="note-form"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Salvando...' : 'Salvar Nota'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
