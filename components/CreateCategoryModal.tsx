'use client'

import { useState, useEffect } from 'react'
import * as Lucide from 'lucide-react'
import { useApp } from '@/lib/i18n'

interface CreateCategoryModalProps {
  type: 'INCOME' | 'EXPENSE'
  onClose: () => void
  onCreated: (name: string, icon: string, color: string) => void
}

const INCOME_ICONS = [
  'Wallet', 'TrendingUp', 'Laptop', 'Briefcase', 'PiggyBank',
  'Gift', 'Banknote', 'Building', 'Landmark', 'Coins',
  'Gem', 'Award', 'Star', 'Zap', 'Rocket',
  'HeartHandshake', 'Shield', 'Crown', 'Flame', 'Sparkles',
  'Leaf', 'Music', 'Camera', 'Globe',
]

const EXPENSE_ICONS = [
  'Utensils', 'Car', 'Clapperboard', 'ShoppingBag', 'Receipt',
  'HeartPulse', 'Dumbbell', 'Coffee', 'House', 'Bus',
  'Train', 'Plane', 'Hotel', 'Smartphone', 'Wifi',
  'Fuel', 'ShoppingCart', 'Shirt', 'Dog', 'Stethoscope',
  'Pill', 'Scissors', 'Wrench', 'Book',
  'Cake', 'Beer', 'Baby', 'Cat',
]

const COLOR_PRESETS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#64748b', '#6b7280', '#94a3b8',
]

const LUCIDE_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet: Lucide.Wallet,
  TrendingUp: Lucide.TrendingUp,
  Laptop: Lucide.Laptop,
  Briefcase: Lucide.Briefcase,
  PiggyBank: Lucide.PiggyBank,
  Gift: Lucide.Gift,
  Banknote: Lucide.Banknote,
  Building: Lucide.Building,
  Landmark: Lucide.Landmark,
  Coins: Lucide.Coins,
  Gem: Lucide.Gem,
  Award: Lucide.Award,
  Star: Lucide.Star,
  Zap: Lucide.Zap,
  Rocket: Lucide.Rocket,
  HeartHandshake: Lucide.HeartHandshake,
  Shield: Lucide.Shield,
  Crown: Lucide.Crown,
  Flame: Lucide.Flame,
  Sparkles: Lucide.Sparkles,
  Leaf: Lucide.Leaf,
  Music: Lucide.Music,
  Camera: Lucide.Camera,
  Globe: Lucide.Globe,
  Utensils: Lucide.Utensils,
  Car: Lucide.Car,
  Clapperboard: Lucide.Clapperboard,
  ShoppingBag: Lucide.ShoppingBag,
  Receipt: Lucide.Receipt,
  HeartPulse: Lucide.HeartPulse,
  Dumbbell: Lucide.Dumbbell,
  Coffee: Lucide.Coffee,
  House: Lucide.House,
  Bus: Lucide.Bus,
  Train: Lucide.Train,
  Plane: Lucide.Plane,
  Hotel: Lucide.Hotel,
  Smartphone: Lucide.Smartphone,
  Wifi: Lucide.Wifi,
  Fuel: Lucide.Fuel,
  ShoppingCart: Lucide.ShoppingCart,
  Shirt: Lucide.Shirt,
  Dog: Lucide.Dog,
  Stethoscope: Lucide.Stethoscope,
  Pill: Lucide.Pill,
  Scissors: Lucide.Scissors,
  Wrench: Lucide.Wrench,
  Book: Lucide.Book,
  Cake: Lucide.Cake,
  Beer: Lucide.Beer,
  Baby: Lucide.Baby,
  Cat: Lucide.Cat,
}

function LucideIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const Icon = LUCIDE_MAP[name]
  if (!Icon) return null
  return <Icon className={className} />
}

export default function CreateCategoryModal({ type, onClose, onCreated }: CreateCategoryModalProps) {
  const { t, locale } = useApp()
  const isBRL = locale === 'pt-BR'
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('')
  const [selectedColor, setSelectedColor] = useState('#6366f1')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  const icons = type === 'INCOME' ? INCOME_ICONS : EXPENSE_ICONS

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const handleClose = () => { setVisible(false); setTimeout(onClose, 200) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !selectedIcon) {
      setError(isBRL ? 'Preencha nome e selecione um ícone' : 'Fill in name and select an icon')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon: selectedIcon, color: selectedColor }),
      })
      if (!res.ok) { setError(isBRL ? 'Erro ao criar categoria' : 'Failed to create category'); return }
      onCreated(name.trim(), selectedIcon, selectedColor)
    } catch { setError('Erro de rede') } finally { setSubmitting(false) }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-surface-900 dark:border dark:border-surface-700/60 transition-all duration-200 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="mb-5 flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {isBRL ? 'Nova Categoria' : 'New Category'}
          </h2>
          <button onClick={handleClose} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
              {isBRL ? 'Nome' : 'Name'}
            </label>
            <input
              type="text"
              required
              maxLength={30}
              className="input-field"
              placeholder={isBRL ? 'Ex: Streaming' : 'e.g., Streaming'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
              {isBRL ? 'Ícone' : 'Icon'}
            </label>
            <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto rounded-xl border border-surface-200 dark:border-surface-700/60 p-2.5 bg-surface-50 dark:bg-surface-800/50">
              {icons.map((iconName) => {
                const isSelected = selectedIcon === iconName
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`flex items-center justify-center rounded-lg p-2.5 transition-all duration-150 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md scale-105'
                        : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-150 dark:border-surface-700 text-surface-600 dark:text-surface-300'
                    }`}
                    title={iconName}
                  >
                    <LucideIcon name={iconName} className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
            {selectedIcon && (
              <p className="text-xs text-surface-400 dark:text-surface-500">
                {isBRL ? 'Selecionado' : 'Selected'}: {selectedIcon}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
              {isBRL ? 'Cor' : 'Color'}
            </label>
            <div className="grid grid-cols-10 gap-1.5">
              {COLOR_PRESETS.map((color) => {
                const isSelected = selectedColor === color
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 rounded-lg transition-all duration-150 ${
                      isSelected ? 'ring-2 ring-offset-2 ring-surface-900 dark:ring-surface-100 dark:ring-offset-surface-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                )
              })}
            </div>
          </div>

          {/* Preview */}
          {name.trim() && selectedIcon && (
            <div className="rounded-xl border border-surface-200 dark:border-surface-700/60 p-3 flex items-center gap-3">
              <LucideIcon name={selectedIcon} className="w-5 h-5" />
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedColor }} />
              <span className="text-sm font-medium text-surface-900 dark:text-surface-100">{name.trim()}</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose} className="btn-secondary flex-1" disabled={submitting}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? (isBRL ? 'Criando...' : 'Creating...') : (isBRL ? 'Criar Categoria' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
