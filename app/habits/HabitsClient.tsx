'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────
interface HabitDTO {
  id: string
  title: string
  description?: string
  icon: string
  color: string
  order: number
  currentStreak: number
  bestStreak: number
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
  initialPrevCheckins: CheckinDTO[]
  weekDates: string[] // 7 dates YYYY-MM-DD, Sun → Sat
  initialHistoricalScore: number
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
  initialPrevCheckins,
  weekDates,
  initialHistoricalScore,
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

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
        } else {
          // Sync exact calculated streaks from server
          const data = await res.json()
          if (data.currentStreak !== undefined && data.bestStreak !== undefined) {
            setHabits((prev) => prev.map(h => 
              h.id === habitId ? { ...h, currentStreak: data.currentStreak, bestStreak: data.bestStreak } : h
            ))
          }
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
  const handleDeleteTrigger = (id: string) => {
    setDeletingId(id)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/habits/${deletingId}`, { method: 'DELETE' })
      if (res.ok) {
        setHabits((prev) => prev.filter((h) => h.id !== deletingId))
        setCheckins((prev) => prev.filter((c) => c.habitId !== deletingId))
        setDeletingId(null)
      }
    } catch { 
      // silent failure mapping
    } finally {
      setIsDeleting(false)
    }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Semana atual</h2>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                  {new Date(weekDates[0] + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  {' – '}
                  {new Date(weekDates[6] + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {(() => {
                    // Daily progress & Gamification
                    const totalHabits = habits.length
                    const completedToday = checkins.filter(c => c.date === today && c.completed).length
                    const todayPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
                    const todayScore = (completedToday * 10) + (completedToday === totalHabits && totalHabits > 0 ? 20 : 0)
                    
                    // Weekly progress & Gamification
                    const possibleWeekCheckins = totalHabits * 7
                    const completedWeek = checkins.filter(c => weekDates.includes(c.date) && c.completed).length
                    const weekPct = possibleWeekCheckins > 0 ? Math.round((completedWeek / possibleWeekCheckins) * 100) : 0

                    // Total Gamification checkins calculation 
                    const byDate: Record<string, number> = {}
                    for (const c of checkins.filter(c => c.completed)) {
                      byDate[c.date] = (byDate[c.date] || 0) + 1
                    }
                    let currentWeekScore = 0
                    for (const d in byDate) {
                      currentWeekScore += byDate[d] * 10
                      if (byDate[d] === totalHabits && totalHabits > 0) {
                        currentWeekScore += 20
                      }
                    }
                    const totalScore = initialHistoricalScore + currentWeekScore

                    return (
                      <>
                        <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-md shadow-sm border border-surface-200 dark:border-surface-700">
                          <Lucide.Target className="h-3 w-3 text-brand-500" />
                          <span>Hoje: {completedToday}/{totalHabits} ({todayPct}%)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-md shadow-sm border border-surface-200 dark:border-surface-700">
                          <Lucide.CalendarDays className="h-3 w-3 text-surface-400" />
                          <span>Semana: {completedWeek}/{possibleWeekCheckins}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-md shadow-sm border border-purple-200/50 dark:border-purple-800/50 ml-auto sm:ml-0">
                          <span>✨ Score: {totalScore}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="self-end sm:self-center">
                <button 
                  onClick={openCreateModal} 
                  className="btn-primary text-sm px-4 py-2"
                >
                  Novo Hábito
                </button>
              </div>
            </div>

            {/* Day column headers FIXED TO GRID */}
            <div className="grid grid-cols-[minmax(160px,1fr)_repeat(7,40px)_68px] items-end gap-2 mb-2 min-w-[570px] px-1 pl-6">
              {/* Spacer for habit name column */}
              <div />
              {weekDates.map((date, i) => {
                const isToday = date === today
                return (
                  <div key={date} className="w-10 flex flex-col items-center gap-0.5 justify-self-center">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400 dark:text-surface-500'}`}>
                      {DAY_LABELS[i]}
                    </span>
                    <span className={`text-xs font-bold ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500 dark:text-surface-400'}`}>
                      {new Date(date + 'T12:00:00').getDate()}
                    </span>
                    {isToday && (
                      <div className="h-1 w-1 rounded-full bg-brand-500 mt-0.5 absolute -bottom-1.5" />
                    )}
                  </div>
                )
              })}
              {/* Spacer for actions column */}
              <div />
            </div>

            {/* Divider */}
            <div className="border-t border-surface-100 dark:border-surface-800 mb-1 min-w-[570px]" />

            {/* Habit rows */}
            <div className="min-w-[570px] pb-2">
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
                    className={`grid grid-cols-[minmax(160px,1fr)_repeat(7,40px)_68px] gap-2 items-center py-3 px-1 group transition-transform duration-200 ${
                      isDragging ? 'opacity-40 scale-95 origin-center' : 'opacity-100'
                    } hover:bg-surface-50/50 dark:hover:bg-surface-800/30 rounded-xl relative pl-6`}
                  >
                    {/* Drag Handle */}
                    <div className="absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 rounded hover:bg-surface-200/50 dark:hover:bg-surface-700/50 cursor-grab active:cursor-grabbing text-surface-400">
                      <Lucide.GripVertical className="h-4 w-4" />
                    </div>

                    {/* Habit info */}
                    <div className="flex items-center gap-2.5 overflow-hidden pr-2">
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
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded ${habit.currentStreak > 0 ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50' : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400 border border-surface-200 dark:border-surface-700/50'}`}>
                            {habit.currentStreak > 0 ? '🔥' : <span className="opacity-50">🔥</span>} 
                            <span>Atual: {habit.currentStreak}</span>
                          </p>
                          {habit.bestStreak > 0 && (
                            <p className="text-[10px] font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1">
                              🏆 Melhor: {habit.bestStreak}
                            </p>
                          )}
                        </div>
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
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 justify-self-center ${
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
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-self-end">
                      <button
                        onClick={() => openEditModal(habit)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200"
                        title="Editar hábito"
                      >
                        <Lucide.Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(habit.id)}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        title="Excluir hábito"
                      >
                        <Lucide.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Desempenho / Radar Gamification ── */}
        {habits.length > 0 && (() => {
          const totalHabits = habits.length
          const completedInWeek = checkins.filter(c => weekDates.includes(c.date) && c.completed).length
          const totalWeekPossible = totalHabits * 7
          
          // 1. Disciplina: % of habits completed inside week bounds
          const disciplinaPct = totalWeekPossible > 0 ? Math.round((completedInWeek / totalWeekPossible) * 100) : 0

          // 2. Consistência: Avg streak (21 days maxes out -> 100%)
          const avgStreak = habits.reduce((acc, h) => acc + h.currentStreak, 0) / (totalHabits || 1)
          const consistenciaPct = Math.min(100, Math.round((avgStreak / 21) * 100))

          // 3. Frequência: Active Days in week mapping
          const weekCheckinsSet = new Set(checkins.filter(c => weekDates.includes(c.date) && c.completed).map(c => c.date))
          const frequenciaPct = Math.round((weekCheckinsSet.size / 7) * 100)

          // 4. Evolução: Comparison vs PrevWeek 
          const prevCompleted = initialPrevCheckins.filter(c => c.completed).length
          let evolucaoPct = 50
          if (completedInWeek > prevCompleted) {
            evolucaoPct = 50 + Math.min(50, Math.round(((completedInWeek - prevCompleted) / (prevCompleted || 1)) * 50))
          } else if (completedInWeek < prevCompleted && prevCompleted > 0) {
            evolucaoPct = Math.max(0, 50 - Math.round(((prevCompleted - completedInWeek) / prevCompleted) * 50))
          }

          // 5. Controle: Zero-Day Penalization
          const zeroDays = 7 - weekCheckinsSet.size
          const controlePct = Math.max(0, 100 - (zeroDays * 15))

          // 6. Energia: Intensity mapped 
          const energiaPct = weekCheckinsSet.size > 0 
              ? Math.max(0, Math.min(100, Math.round(((completedInWeek / weekCheckinsSet.size) / totalHabits) * 100)))
              : 0

          const radarData = [
            { subject: 'Disciplina', A: disciplinaPct, fullMark: 100 },
            { subject: 'Consistência', A: consistenciaPct, fullMark: 100 },
            { subject: 'Frequência', A: frequenciaPct, fullMark: 100 },
            { subject: 'Evolução', A: evolucaoPct, fullMark: 100 },
            { subject: 'Controle', A: controlePct, fullMark: 100 },
            { subject: 'Energia', A: energiaPct, fullMark: 100 }
          ]

          return (
            <div className="card overflow-hidden animate-dashboard-fade">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
                <div className="sm:w-1/3 w-full space-y-2 text-center sm:text-left">
                  <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center justify-center sm:justify-start gap-2">
                    <Lucide.Activity className="w-4 h-4 text-brand-500" />
                    Desempenho da Semana
                  </h2>
                  <p className="text-xs text-surface-500 dark:text-surface-400 max-w-[250px] mx-auto sm:mx-0">
                    Sua análise combinando consistência, energia disparada e regularidade para evoluir suas rotinas.
                  </p>
                </div>
                
                <div className="w-full sm:w-2/3 h-64 -ml-4 sm:ml-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" className="dark:stroke-surface-700/50" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} 
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                          border: '1px solid rgba(55, 65, 81, 0.5)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        itemStyle={{ color: '#a855f7' }}
                        formatter={(value) => [`${value}%`, 'Score']}
                      />
                      <Radar 
                        name="Performance" 
                        dataKey="A" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        fill="#a855f7" 
                        fillOpacity={0.35} 
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        })()}

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

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeletingId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevated dark:bg-surface-900 dark:border dark:border-surface-700/60 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Lucide.Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">
              Excluir hábito
            </h3>
            <p className="text-sm text-center text-surface-500 dark:text-surface-400 mt-2">
              Tem certeza que deseja excluir este hábito?<br/>Essa ação não poderá ser desfeita. O histórico de progresso continuará salvo nas estatísticas passadas.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 019.95 9" fill="currentColor" />
                    </svg>
                    Excluindo...
                  </span>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
