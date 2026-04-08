'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface HabitDTO {
  id: string
  title: string
  description?: string
  icon: string
  color: string
  order: number
  streak: number
  createdAt: string
}

interface CheckinDTO {
  habitId: string
  date: string
  completed: boolean
}

interface Props {
  session: { userId: string; name: string }
  initialHabits: HabitDTO[]
  initialCheckins: CheckinDTO[]
  weekDates: string[] // 7 dates YYYY-MM-DD, Sun → Sat
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const HABIT_COLORS = [
  { id: 'blue', hex: '#3b82f6', label: 'Azul' },
  { id: 'purple', hex: '#a855f7', label: 'Roxo' },
  { id: 'pink', hex: '#ec4899', label: 'Rosa' },
  { id: 'red', hex: '#ef4444', label: 'Vermelho' },
  { id: 'orange', hex: '#f97316', label: 'Laranja' },
  { id: 'green', hex: '#22c55e', label: 'Verde' },
  { id: 'teal', hex: '#14b8a6', label: 'Teal' },
  { id: 'yellow', hex: '#eab308', label: 'Amarelo' },
]

const HABIT_ICON_NAMES = [
  'Dumbbell', 'Heart', 'BookOpen', 'Coffee', 'Droplets', 'Moon', 'Sun',
  'Flame', 'Music', 'Code', 'Bike', 'Apple', 'Brain', 'Zap', 'Star',
  'Smile', 'Target', 'Trophy', 'Wind', 'Leaf', 'Pencil', 'Camera',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getColorHex(id: string) {
  return HABIT_COLORS.find((c) => c.id === id)?.hex ?? '#3b82f6'
}

/** Renders a Lucide icon by string name — safe fallback to Target */
function HabitIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (Lucide as unknown as Record<string, React.ElementType>)[name]
  if (!Icon) return <Lucide.Target className={className} />
  return <Icon className={className} />
}

/** Returns today's local YYYY-MM-DD */
function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HabitsClient({
  session,
  initialHabits,
  initialCheckins,
  weekDates,
}: Props) {
  const router = useRouter()
  const today = todayLocal()

  // State
  const [habits, setHabits] = useState<HabitDTO[]>(initialHabits)
  const [checkins, setCheckins] = useState<CheckinDTO[]>(initialCheckins)
  const [togglingKey, setTogglingKey] = useState<string | null>(null)

  // Drag and drop state
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitDTO | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formIcon, setFormIcon] = useState('Target')
  const [formColor, setFormColor] = useState('blue')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Document title
  useEffect(() => {
    document.title = 'Hábitos | Flowly'
  }, [])

  // ── Helpers ──
  const isChecked = useCallback(
    (habitId: string, date: string) =>
      checkins.some((c) => c.habitId === habitId && c.date === date && c.completed),
    [checkins]
  )

  // ── Toggle check-in (optimistic) ──
  const handleToggle = useCallback(
    async (habitId: string, date: string) => {
      const key = `${habitId}-${date}`
      if (togglingKey === key) return

      const current = checkins.some(
        (c) => c.habitId === habitId && c.date === date && c.completed
      )
      const newCompleted = !current

      // Optimistic update
      setCheckins((prev) => {
        const idx = prev.findIndex((c) => c.habitId === habitId && c.date === date)
        if (idx >= 0) {
          return prev.map((c, i) => (i === idx ? { ...c, completed: newCompleted } : c))
        }
        return [...prev, { habitId, date, completed: newCompleted }]
      })

      setTogglingKey(key)
      try {
        const res = await fetch('/api/habits/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habitId, date, completed: newCompleted }),
        })
        if (!res.ok) {
          // Revert
          setCheckins((prev) => {
            const idx = prev.findIndex((c) => c.habitId === habitId && c.date === date)
            if (idx >= 0) return prev.map((c, i) => (i === idx ? { ...c, completed: current } : c))
            return prev
          })
        }
      } catch {
        // Revert
        setCheckins((prev) => {
          const idx = prev.findIndex((c) => c.habitId === habitId && c.date === date)
          if (idx >= 0) return prev.map((c, i) => (i === idx ? { ...c, completed: current } : c))
          return prev
        })
      } finally {
        setTogglingKey(null)
      }
    },
    [togglingKey, checkins]
  )

  // ── Drag and Drop ──
  const handleDragStart = (e: React.DragEvent, habitId: string) => {
    setDraggedHabitId(habitId)
    // Create a generic transparent image to remove the default OS drag ghost
    const dragImg = new Image()
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(dragImg, 0, 0)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, habitId: string) => {
    e.preventDefault() // Necessary to allow dropping
    if (!draggedHabitId || draggedHabitId === habitId) return

    setHabits((prev) => {
      const oldIndex = prev.findIndex((h) => h.id === draggedHabitId)
      const newIndex = prev.findIndex((h) => h.id === habitId)
      if (oldIndex < 0 || newIndex < 0) return prev

      const newHabits = [...prev]
      const [movedItem] = newHabits.splice(oldIndex, 1)
      newHabits.splice(newIndex, 0, movedItem)
      return newHabits
    })
  }

  const handleDragEnd = async () => {
    setDraggedHabitId(null)
    if (isSavingOrder) return

    setIsSavingOrder(true)
    try {
      const ids = habits.map((h) => h.id)
      await fetch('/api/habits/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
    } catch {
      // Silently fail or add a toast
    } finally {
      setIsSavingOrder(false)
    }
  }

  // ── Save habit (Create or Edit) ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSubmitting(true)
    
    // Using PATCH for edit, POST for create
    const isEdit = !!editingHabit
    const url = isEdit ? `/api/habits/${editingHabit.id}` : '/api/habits'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim() || undefined,
          icon: formIcon,
          color: formColor,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error ?? 'Erro ao salvar hábito')
        return
      }
      const { habit } = await res.json()
      
      if (isEdit) {
        setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)))
      } else {
        setHabits((prev) => [...prev, habit])
      }
      
      closeModal()
    } catch {
      setFormError('Erro de conexão')
    } finally {
      setFormSubmitting(false)
    }
  }

  // ── Delete habit ──
  const handleDelete = async (id: string) => {
    if (!confirm('Remover este hábito? O histórico será mantido.')) return
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setHabits((prev) => prev.filter((h) => h.id !== id))
        setCheckins((prev) => prev.filter((c) => c.habitId !== id))
      }
    } catch { /* silent */ }
  }

  // ── Modal helpers ──
  const openCreateModal = () => {
    setEditingHabit(null)
    setFormTitle(''); setFormDesc(''); setFormIcon('Target'); setFormColor('blue')
    setFormError('')
    setShowModal(true)
  }
  
  const openEditModal = (habit: HabitDTO) => {
    setEditingHabit(habit)
    setFormTitle(habit.title)
    setFormDesc(habit.description ?? '')
    setFormIcon(habit.icon)
    setFormColor(habit.color)
    setFormError('')
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setTimeout(() => setEditingHabit(null), 200) // Clear after animation
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 reports-page-enter">

      {/* ── Header ── */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="text-base font-bold text-surface-900 dark:text-surface-100 tracking-tight">Hábitos</h1>
            <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">Construa uma rotina consistente</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-surface-500 dark:text-surface-400">
              Olá, {session.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Empty state */}
        {habits.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center animate-dashboard-fade">
            <div className="mb-5 rounded-full bg-brand-50 dark:bg-brand-900/20 p-5">
              <Lucide.CheckSquare className="h-10 w-10 text-brand-500" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
              Nenhum hábito ainda
            </h2>
            <p className="mt-2 max-w-sm text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              Crie seu primeiro hábito e comece a construir uma rotina consistente, dia após dia.
            </p>
            <button onClick={openCreateModal} className="mt-6 btn-primary">
              <Lucide.Plus className="h-4 w-4 mr-1.5 inline-block" />
              Criar primeiro hábito
            </button>
          </div>
        ) : (
          /* ── Weekly Grid ── */
          <div className="card overflow-x-auto animate-dashboard-fade">
            {/* Grid header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Semana atual</h2>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                  {new Date(weekDates[0] + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  {' – '}
                  {new Date(weekDates[6] + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={openCreateModal} 
                className="btn-primary text-sm px-4 py-2"
              >
                Novo Hábito
              </button>
            </div>

            {/* Day column headers */}
            <div className="flex items-end gap-2 mb-2 min-w-[560px]">
              {/* Spacer for habit name column */}
              <div className="flex-1 min-w-[160px]" />
              {weekDates.map((date, i) => {
                const isToday = date === today
                return (
                  <div key={date} className="w-10 shrink-0 flex flex-col items-center gap-0.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400 dark:text-surface-500'}`}>
                      {DAY_LABELS[i]}
                    </span>
                    <span className={`text-xs font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500 dark:text-surface-400'}`}>
                      {new Date(date + 'T12:00:00').getDate()}
                    </span>
                    {isToday && (
                      <div className="h-1 w-1 rounded-full bg-brand-500 mt-0.5" />
                    )}
                  </div>
                )
              })}
              {/* Spacer for delete button column */}
              <div className="w-8 shrink-0" />
            </div>

            {/* Divider */}
            <div className="border-t border-surface-100 dark:border-surface-800 mb-1 min-w-[560px]" />

            {/* Habit rows */}
            <div className="min-w-[560px] pb-2">
              {habits.map((habit) => {
                const colorHex = getColorHex(habit.color)
                const isDragging = draggedHabitId === habit.id
                return (
                  <div 
                    key={habit.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, habit.id)}
                    onDragOver={(e) => handleDragOver(e, habit.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 py-3 px-1 group transition-transform duration-200 ${
                      isDragging ? 'opacity-40 scale-95 origin-center' : 'opacity-100'
                    } hover:bg-surface-50/50 dark:hover:bg-surface-800/30 rounded-xl relative`}
                  >
                    {/* Drag Handle */}
                    <div className="absolute left-[-18px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 rounded hover:bg-surface-200/50 dark:hover:bg-surface-700/50 cursor-grab active:cursor-grabbing text-surface-400">
                      <Lucide.GripVertical className="h-4 w-4" />
                    </div>

                    {/* Habit info */}
                    <div className="flex-1 min-w-[160px] flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${colorHex}1a`, color: colorHex }}
                      >
                        <HabitIcon name={habit.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate leading-tight">
                          {habit.title}
                        </p>
                        <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5 flex items-center gap-1">
                          {habit.streak > 0 ? (
                            <>
                              <span>🔥</span>
                              <span>{habit.streak} {habit.streak === 1 ? 'dia' : 'dias'}</span>
                            </>
                          ) : (
                            <span>Sem sequência</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Day cells */}
                    {weekDates.map((date) => {
                      const checked = isChecked(habit.id, date)
                      const isFuture = date > today
                      const isToday = date === today
                      const key = `${habit.id}-${date}`
                      const isToggling = togglingKey === key

                      return (
                        <button
                          key={date}
                          onClick={() => !isFuture && handleToggle(habit.id, date)}
                          disabled={isFuture || isToggling}
                          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isFuture
                              ? 'opacity-25 cursor-not-allowed bg-surface-100 dark:bg-surface-800/40 border border-dashed border-surface-300 dark:border-surface-700'
                              : checked
                              ? 'shadow-sm hover:opacity-80 active:scale-95 cursor-pointer'
                              : [
                                  'bg-surface-100 dark:bg-surface-800 border border-surface-200/80 dark:border-surface-700/50',
                                  'hover:bg-surface-200/60 dark:hover:bg-surface-700/60 hover:border-surface-300 dark:hover:border-surface-600',
                                  'active:scale-95 cursor-pointer',
                                  isToday ? 'ring-2 ring-brand-400/40 dark:ring-brand-500/30' : '',
                                ].join(' ')
                          }`}
                          style={checked ? { backgroundColor: colorHex } : undefined}
                          title={checked ? 'Clique para desmarcar' : isFuture ? 'Dia futuro' : 'Clique para marcar'}
                        >
                          {isToggling ? (
                            <svg className="h-3 w-3 animate-spin text-white dark:text-surface-300" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                              <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
                            </svg>
                          ) : checked ? (
                            <Lucide.Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                          ) : null}
                        </button>
                      )
                    })}

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(habit)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200"
                      >
                        <Lucide.Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-surface-400 hover:!text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      >
                        <Lucide.Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Create Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-900 shadow-elevated border border-surface-200 dark:border-surface-700/60 p-6 space-y-5 animate-dashboard-fade"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
              </h2>
              <button
                onClick={closeModal}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <Lucide.X className="h-4 w-4" />
              </button>
            </div>

            {/* Live preview */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50">
              <div
                className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${getColorHex(formColor)}1a`, color: getColorHex(formColor) }}
              >
                <HabitIcon name={formIcon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                  {formTitle || <span className="text-surface-400 dark:text-surface-500 font-normal">Nome do hábito</span>}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5 truncate">
                  {formDesc || 'Descrição opcional'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  autoFocus
                  className="input-field"
                  placeholder="Ex: Exercitar-se, Leitura, Meditação..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Descrição</label>
                <input
                  type="text"
                  maxLength={200}
                  className="input-field"
                  placeholder="Opcional"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* Icon picker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Ícone</label>
                <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50">
                  {HABIT_ICON_NAMES.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormIcon(ic)}
                      className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${
                        formIcon === ic
                          ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/30'
                          : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:text-surface-700 dark:hover:text-surface-200'
                      }`}
                      title={ic}
                    >
                      <HabitIcon name={ic} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormColor(c.id)}
                      className={`h-8 w-8 rounded-full transition-all hover:scale-110 ${
                        formColor === c.id
                          ? 'ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-surface-900 scale-110'
                          : ''
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || !formTitle.trim()}
                  className="btn-primary flex-1"
                >
                  {formSubmitting ? 'Salvando...' : editingHabit ? 'Salvar Alterações' : 'Criar Hábito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
