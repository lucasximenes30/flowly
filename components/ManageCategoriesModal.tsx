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
    if (!newName.trim() || !newIcon) return
    setCreating(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), icon: newIcon, color: newColor }),
      })
      if (res.ok) {
        setShowCreate(false)
        setNewName(''); setNewIcon(''); setNewColor('#6366f1')
        fetchCategories()
        onRefresh()
      }
    } catch { /* ignore */ } finally { setCreating(false) }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-2xl dark:bg-surface-900 dark:border dark:border-surface-700/60 transition-all duration-200 flex flex-col ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 dark:border-surface-700/60">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {isBRL ? 'Gerenciar Categorias' : 'Manage Categories'}
          </h2>
          <button onClick={handleClose} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
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
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-surface-200 dark:border-surface-700/60 p-3 flex items-center gap-3">
                    {editingId === cat.id ? (
                      <>
                        {/* Edit mode */}
                        <div className="flex-1 grid gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            maxLength={30}
                            className="input-field text-sm py-1.5"
                          />
                          {/* Icon picker button */}
                          <button
                            type="button"
                            onClick={() => setShowEditIcons(!showEditIcons)}
                            className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                          >
                            {editIcon ? <CatIcon name={editIcon} className="w-4 h-4" /> : <Lucide.Smile className="w-4 h-4" />}
                            <span>{isBRL ? 'Ícones' : 'Icons'}</span>
                            {editIcon && <span className="ml-auto text-xs text-surface-400">{editIcon}</span>}
                            <Lucide.ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${showEditIcons ? 'rotate-180' : ''}`} />
                          </button>
                          {/* Icon picker grid */}
                          {showEditIcons && (
                            <div className="sm:col-span-2 grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto rounded-lg border border-surface-200 dark:border-surface-700/60 p-2 bg-surface-50 dark:bg-surface-800/50">
                              {ALL_ICONS.map((iconName) => (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => setEditIcon(iconName)}
                                  className={`flex items-center justify-center rounded-lg p-2 transition-all ${
                                    editIcon === iconName
                                      ? 'bg-brand-600 text-white shadow-md scale-105 ring-2 ring-brand-500'
                                      : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-150 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:scale-105'
                                  }`}
                                  title={iconName}
                                >
                                  <CatIcon name={iconName} className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Color picker inline */}
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="h-8 w-8 rounded cursor-pointer border-0"
                            />
                            <div className="flex flex-wrap gap-1">
                              {COLOR_PRESETS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setEditColor(c)}
                                  className={`h-6 w-6 rounded-sm transition-transform ${editColor === c ? 'ring-2 ring-offset-1 ring-surface-900 dark:ring-surface-100 dark:ring-offset-surface-900 scale-110' : ''}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                        >
                          <Lucide.X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => saveEdit(cat.id)}
                          disabled={saving || !editName.trim() || !editIcon}
                          className="p-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors disabled:opacity-50"
                        >
                          <Lucide.Check className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* View mode */}
                        <CatIcon name={cat.icon} className="w-5 h-5 text-surface-600 dark:text-surface-300" />
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="flex-1 text-sm font-medium text-surface-800 dark:text-surface-200">
                          {t(`category.${cat.name}`) || cat.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-surface-500">
                          {cat.userId === null ? (isBRL ? 'Padrão' : 'Default') : (isBRL ? 'Pessoal' : 'Custom')}
                        </span>
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-surface-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
                          title={isBRL ? 'Editar' : 'Edit'}
                        >
                          <Lucide.Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 text-surface-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
                          title={isBRL ? 'Remover' : 'Delete'}
                        >
                          {deletingId === cat.id ? (
                            <Lucide.Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lucide.Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Create new category */}
              {showCreate ? (
                <div className="mt-4 rounded-xl border border-brand-200 dark:border-brand-700/50 bg-brand-50 dark:bg-brand-900/10 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    {isBRL ? 'Nova Categoria' : 'New Category'}
                  </h3>
                  <div className="space-y-2">
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
                      className="flex items-center gap-2 rounded-lg border border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      {newIcon ? <CatIcon name={newIcon} className="w-4 h-4" /> : <Lucide.Smile className="w-4 h-4" />}
                      <span>{isBRL ? 'Ícones' : 'Icons'}</span>
                      {newIcon && <span className="ml-auto text-xs text-surface-400">{newIcon}</span>}
                      <Lucide.ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${showNewIcons ? 'rotate-180' : ''}`} />
                    </button>
                    {showNewIcons && (
                      <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto rounded-lg border border-surface-200 dark:border-surface-700/60 p-2 bg-surface-50 dark:bg-surface-800/50">
                        {ALL_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setNewIcon(iconName)}
                            className={`flex items-center justify-center rounded-lg p-2 transition-all ${
                              newIcon === iconName
                                ? 'bg-brand-600 text-white shadow-md scale-105 ring-2 ring-brand-500'
                                : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-150 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:scale-105'
                            }`}
                            title={iconName}
                          >
                            <CatIcon name={iconName} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <div className="flex flex-wrap gap-1">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewColor(c)}
                            className={`h-6 w-6 rounded-sm transition-transform ${newColor === c ? 'ring-2 ring-offset-1 ring-surface-900 dark:ring-surface-100 dark:ring-offset-surface-900 scale-110' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {newName && newIcon && (
                    <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-surface-800 p-2">
                      <CatIcon name={newIcon} className="w-4 h-4" />
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: newColor }} />
                      <span className="text-sm font-medium text-surface-800 dark:text-surface-200">{newName}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowCreate(false); setNewName(''); setNewIcon(''); }} className="btn-secondary flex-1 text-xs py-2">
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={createCategory}
                      disabled={creating || !newName.trim() || !newIcon}
                      className="btn-primary flex-1 text-xs py-2"
                    >
                      {creating ? (isBRL ? 'Criando...' : 'Creating...') : (isBRL ? 'Criar' : 'Create')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 text-sm font-medium text-surface-500 dark:text-surface-400 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <Lucide.Plus className="w-4 h-4" />
                  {isBRL ? 'Adicionar Categoria' : 'Add Category'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}