'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/i18n'
import * as Lucide from 'lucide-react'
import { LUCIDE_MAP, CatIcon } from './CategorySelect'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  userId: string | null
}

interface ManageCategoriesModalProps {
  onClose: () => void
  onRefresh: () => void
}

const COLOR_PRESETS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#64748b', '#6b7280', '#94a3b8',
]

const ALL_ICONS = [
  'Wallet', 'TrendingUp', 'Laptop', 'Briefcase', 'PiggyBank',
  'Gift', 'Banknote', 'Building', 'Landmark', 'Coins',
  'Gem', 'Award', 'Star', 'Zap', 'Rocket',
  'HeartHandshake', 'Shield', 'Crown', 'Flame', 'Sparkles',
  'Leaf', 'Music', 'Camera', 'Globe',
  'Utensils', 'Car', 'Clapperboard', 'ShoppingBag', 'Receipt',
  'HeartPulse', 'Dumbbell', 'Coffee', 'House', 'Bus',
  'Train', 'Plane', 'Hotel', 'Smartphone', 'Wifi',
  'Fuel', 'ShoppingCart', 'Shirt', 'Dog', 'Stethoscope',
  'Pill', 'Scissors', 'Wrench', 'Book',
  'Cake', 'Beer', 'Baby', 'Cat', 'GraduationCap',
  'MoreHorizontal',
]

export default function ManageCategoriesModal({ onClose, onRefresh }: ManageCategoriesModalProps) {
  const { t, locale } = useApp()
  const isBRL = locale === 'pt-BR'
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState('#6366f1')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [creating, setCreating] = useState(false)
  const [showEditIcons, setShowEditIcons] = useState(false)
  const [showNewIcons, setShowNewIcons] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const fetchCategories = useCallback(() => {
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((data) => {
        setCategories(data.categories || [])
        setLoading(false)
      })
      .catch(() => { setCategories([]); setLoading(false) })
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleClose = () => { setVisible(false); setTimeout(onClose, 200) }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditIcon(cat.icon)
    setEditColor(cat.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editIcon) return
    setSaving(true)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), icon: editIcon, color: editColor }),
      })
      if (res.ok) {
        setEditingId(null)
        fetchCategories()
        onRefresh()
      }
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const deleteCategory = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCategories()
        onRefresh()
      }
    } catch { /* ignore */ } finally { setDeletingId(null) }
  }

  const createCategory = async () => {
    if (!newName.trim()) return
    if (!newIcon) {
      setCreateError(isBRL ? 'Por favor, selecione um ícone visual' : 'Please select a visual icon')
      return
    }
    setCreateError('')
    setCreating(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), icon: newIcon, color: newColor }),
      })
      if (res.ok) {
        setShowCreate(false)
        setNewName(''); setNewIcon(''); setNewColor('#6366f1'); setCreateError('')
        fetchCategories()
        onRefresh()
      }
    } catch { /* ignore */ } finally { setCreating(false) }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4 transition-all duration-300 ${
        visible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-none'
      }`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl dark:bg-surface-900 dark:border dark:border-surface-700/60 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 sm:translate-y-8 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 dark:border-surface-700/60">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {isBRL ? 'Gerenciar Categorias' : 'Manage Categories'}
          </h2>
          <button type="button" onClick={handleClose} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-12 text-center text-sm text-surface-400">{isBRL ? 'Carregando...' : 'Loading...'}</div>
          ) : (
            <>
              {/* Category list */}
              <div className="space-y-3 sm:space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-surface-200 dark:border-surface-700/60 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-colors hover:bg-surface-50/50 dark:hover:bg-surface-800/50">
                    {editingId === cat.id ? (
                      <>
                        {/* Edit mode */}
                        <div className="flex-1 grid gap-3 sm:grid-cols-2 w-full">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            maxLength={30}
                            className="input-field text-sm sm:col-span-2"
                            placeholder={isBRL ? 'Nome' : 'Name'}
                          />
                          {/* Icon picker button */}
                          <button
                            type="button"
                            onClick={() => setShowEditIcons(!showEditIcons)}
                            className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 px-4 py-3 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                          >
                            {editIcon ? <CatIcon name={editIcon} className="w-5 h-5" /> : <Lucide.Smile className="w-5 h-5" />}
                            <span className="font-medium">{isBRL ? 'Selecionar Ícone' : 'Select Icon'}</span>
                            <Lucide.ChevronDown className={`ml-auto w-4 h-4 text-surface-400 transition-transform ${showEditIcons ? 'rotate-180' : ''}`} />
                          </button>
                          {/* Icon picker grid */}
                          {showEditIcons && (
                            <div className="sm:col-span-2 grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-surface-200 dark:border-surface-700/60 p-3 bg-surface-50 dark:bg-surface-800/50">
                              {ALL_ICONS.map((iconName) => (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => setEditIcon(iconName)}
                                  className={`flex items-center justify-center rounded-xl p-2.5 transition-all ${
                                    editIcon === iconName
                                      ? 'bg-brand-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.3)] scale-105 ring-2 ring-brand-500'
                                      : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-150 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:scale-105'
                                  }`}
                                  title={iconName}
                                >
                                  <CatIcon name={iconName} className="w-5 h-5" />
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Color picker inline */}
                          <div className="flex items-center gap-3 sm:col-span-2 pt-1 border-t border-surface-100 dark:border-surface-800/50 pt-3">
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="h-10 w-10 rounded-lg cursor-pointer border-0 shrink-0"
                            />
                            <div className="flex flex-wrap gap-2">
                              {COLOR_PRESETS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setEditColor(c)}
                                  className={`h-7 w-7 sm:h-6 sm:w-6 rounded-md transition-transform ${editColor === c ? 'ring-2 ring-offset-2 ring-surface-900 dark:ring-surface-100 dark:ring-offset-surface-900 scale-110' : 'hover:scale-110'}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-surface-200 dark:border-surface-700/60 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto">
                          <button type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex-1 sm:flex-none p-2 rounded-lg bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors flex items-center justify-center"
                          >
                            <Lucide.X className="w-4 h-4" />
                          </button>
                          <button type="button"
                            onClick={() => saveEdit(cat.id)}
                            disabled={saving || !editName.trim() || !editIcon}
                            className="flex-1 sm:flex-none p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center"
                          >
                            <Lucide.Check className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* View mode */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            <CatIcon name={cat.icon} className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                              {t(`category.${cat.name}`) || cat.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-surface-500 dark:text-surface-400">
                              {cat.userId === null ? (isBRL ? 'Padrão' : 'Default') : (isBRL ? 'Pessoal' : 'Custom')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                          <button type="button"
                            onClick={() => startEdit(cat)}
                            className="p-2 text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20"
                            title={isBRL ? 'Editar' : 'Edit'}
                          >
                            <Lucide.Pencil className="w-4 h-4" />
                          </button>
                          <button type="button"
                            onClick={() => deleteCategory(cat.id)}
                            disabled={deletingId === cat.id}
                            className="p-2 text-surface-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                            title={isBRL ? 'Remover' : 'Delete'}
                          >
                            {deletingId === cat.id ? (
                              <Lucide.Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Lucide.Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Create new category */}
              {showCreate ? (
                <div className="mt-4 rounded-xl border border-brand-200 dark:border-brand-700/50 bg-brand-50 dark:bg-brand-900/10 p-4 sm:p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-brand-800 dark:text-brand-300 uppercase tracking-wider">
                    {isBRL ? 'Nova Categoria' : 'New Category'}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      maxLength={30}
                      className="input-field text-sm"
                      placeholder={isBRL ? 'Nome da categoria' : 'Category name'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewIcons(!showNewIcons)}
                      className="flex w-full items-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 px-4 py-3 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      {newIcon ? <CatIcon name={newIcon} className="w-4 h-4" /> : <Lucide.Smile className="w-4 h-4" />}
                      <span>{isBRL ? 'Ícones' : 'Icons'}</span>
                      <Lucide.ChevronDown className={`ml-auto w-3.5 h-3.5 text-surface-400 transition-transform ${showNewIcons ? 'rotate-180' : ''}`} />
                    </button>
                    {createError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <Lucide.AlertCircle className="w-3 h-3" />
                        {createError}
                      </p>
                    )}
                    {showNewIcons && (
                      <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto rounded-xl border border-surface-200 dark:border-surface-700/60 p-3 bg-surface-50 dark:bg-surface-800/50">
                        {ALL_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewIcon(iconName)}
                            className={`flex items-center justify-center rounded-xl p-2.5 transition-all ${
                              newIcon === iconName
                                ? 'bg-brand-600 text-white shadow-[0_2px_8px_rgba(79,70,229,0.3)] scale-105 ring-2 ring-brand-500'
                                : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-150 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:scale-105'
                            }`}
                            title={iconName}
                          >
                            <CatIcon name={iconName} className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="h-10 w-10 rounded-lg cursor-pointer border-0 shrink-0"
                      />
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewColor(c)}
                            className={`h-7 w-7 sm:h-6 sm:w-6 rounded-md transition-transform ${newColor === c ? 'ring-2 ring-offset-2 ring-surface-900 dark:ring-surface-100 dark:ring-offset-surface-900 scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {newName && newIcon && (
                    <div className="flex items-center gap-3 rounded-xl border border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 p-3 mt-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${newColor}20`, color: newColor }}>
                        <CatIcon name={newIcon} className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{newName}</span>
                    </div>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <button type="button" onClick={() => { setShowCreate(false); setNewName(''); setNewIcon(''); setCreateError(''); }} className="btn-secondary w-full sm:flex-1 py-3 text-sm">
                      {t('common.cancel')}
                    </button>
                    <button type="button"
                      onClick={createCategory}
                      disabled={creating || !newName.trim()}
                      className="btn-primary w-full sm:flex-1 py-3 text-sm"
                    >
                      {creating ? (isBRL ? 'Criando...' : 'Creating...') : (isBRL ? 'Criar Categoria' : 'Create Category')}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 text-sm font-semibold text-surface-500 dark:text-surface-400 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all duration-200"
                >
                  <Lucide.Plus className="w-5 h-5" />
                  {isBRL ? 'Adicionar Nova Categoria' : 'Add New Category'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}