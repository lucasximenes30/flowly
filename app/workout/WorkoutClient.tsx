'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { useApp } from '@/lib/i18n'

interface WorkoutPlanDTO {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface WorkoutDayDTO {
  id: string
  planId: string
  name: string
  order: number
  weekDay: number | null
  createdAt: string
  updatedAt: string
}

type ExerciseMuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'LEGS'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'ABS'
  | 'GLUTES'
  | 'CARDIO'
  | 'FULL_BODY'
  | 'OTHER'

interface ExerciseDTO {
  id: string
  namePt: string
  nameEn: string
  muscleGroup: ExerciseMuscleGroup
  equipment: string | null
  imageUrl: string | null
  isSystem: boolean
  userId: string | null
  createdAt: string
  updatedAt: string
}

interface WorkoutDayExerciseDTO {
  id: string
  workoutDayId: string
  exerciseId: string
  order: number
  sets: number
  reps: string
  targetWeight: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  exercise: ExerciseDTO
}

interface WorkoutExecutionExerciseState {
  workoutDayExerciseId: string
  exerciseId: string
  exercise: ExerciseDTO
  plannedSets: number
  plannedReps: string
  plannedTargetWeight: string | null
  setsDone: string
  repsDone: string
  weightUsed: string
  notes: string
  completed: boolean
}

interface Props {
  session: { userId: string; name: string }
  initialPlan: WorkoutPlanDTO | null
  initialDays: WorkoutDayDTO[]
  initialDayExercises: WorkoutDayExerciseDTO[]
}

const WEEK_DAY_OPTIONS = [
  { value: 0, label: 'Segunda-feira' },
  { value: 1, label: 'Terca-feira' },
  { value: 2, label: 'Quarta-feira' },
  { value: 3, label: 'Quinta-feira' },
  { value: 4, label: 'Sexta-feira' },
  { value: 5, label: 'Sabado' },
  { value: 6, label: 'Domingo' },
]

const MUSCLE_GROUP_OPTIONS: Array<{
  value: 'ALL' | ExerciseMuscleGroup
  labelPt: string
  labelEn: string
}> = [
  { value: 'ALL', labelPt: 'Todos', labelEn: 'All' },
  { value: 'CHEST', labelPt: 'Peito', labelEn: 'Chest' },
  { value: 'BACK', labelPt: 'Costas', labelEn: 'Back' },
  { value: 'LEGS', labelPt: 'Pernas', labelEn: 'Legs' },
  { value: 'SHOULDERS', labelPt: 'Ombros', labelEn: 'Shoulders' },
  { value: 'BICEPS', labelPt: 'Biceps', labelEn: 'Biceps' },
  { value: 'TRICEPS', labelPt: 'Triceps', labelEn: 'Triceps' },
  { value: 'ABS', labelPt: 'Abdomen', labelEn: 'Abs' },
  { value: 'GLUTES', labelPt: 'Gluteos', labelEn: 'Glutes' },
  { value: 'CARDIO', labelPt: 'Cardio', labelEn: 'Cardio' },
  { value: 'FULL_BODY', labelPt: 'Corpo inteiro', labelEn: 'Full body' },
  { value: 'OTHER', labelPt: 'Outros', labelEn: 'Other' },
]

function sortWorkoutDays(items: WorkoutDayDTO[]): WorkoutDayDTO[] {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.createdAt.localeCompare(b.createdAt)
  })
}

function sortWorkoutDayExercises(items: WorkoutDayExerciseDTO[]): WorkoutDayExerciseDTO[] {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.createdAt.localeCompare(b.createdAt)
  })
}

function groupExercisesByWorkoutDay(items: WorkoutDayExerciseDTO[]): Record<string, WorkoutDayExerciseDTO[]> {
  const grouped: Record<string, WorkoutDayExerciseDTO[]> = {}

  for (const item of items) {
    if (!grouped[item.workoutDayId]) {
      grouped[item.workoutDayId] = []
    }
    grouped[item.workoutDayId].push(item)
  }

  for (const dayId of Object.keys(grouped)) {
    grouped[dayId] = sortWorkoutDayExercises(grouped[dayId])
  }

  return grouped
}

function getWeekDayLabel(weekDay: number | null): string | null {
  if (weekDay === null) return null
  return WEEK_DAY_OPTIONS.find((item) => item.value === weekDay)?.label ?? null
}

function getNextWorkoutDayName(days: WorkoutDayDTO[]): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nextIndex = days.length

  if (nextIndex < alphabet.length) {
    return alphabet[nextIndex]
  }

  return `Treino ${nextIndex + 1}`
}

function getExerciseDisplayName(exercise: ExerciseDTO, locale: 'pt-BR' | 'en'): string {
  if (locale === 'pt-BR') {
    return exercise.namePt || exercise.nameEn
  }
  return exercise.nameEn || exercise.namePt
}

function getMuscleGroupLabel(group: ExerciseMuscleGroup, locale: 'pt-BR' | 'en'): string {
  const option = MUSCLE_GROUP_OPTIONS.find((item) => item.value === group)
  if (!option) return group
  return locale === 'pt-BR' ? option.labelPt : option.labelEn
}

function parseOptionalWeightInput(input: string): number | null {
  const normalized = input.replace(',', '.').trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Carga alvo invalida')
  }

  return Math.round(parsed * 100) / 100
}

function parseSetsInput(input: string): number {
  const parsed = Number(input)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
    throw new Error('Series invalidas')
  }
  return parsed
}

function parseOptionalSetsDoneInput(input: string): number | null {
  const normalized = input.trim()
  if (!normalized) return null
  return parseSetsInput(normalized)
}

function parseOptionalRepsDoneInput(input: string): string | null {
  const normalized = input.trim()

  if (!normalized) return null

  if (normalized.length > 30) {
    throw new Error('Repeticoes realizadas muito longas')
  }

  return normalized
}

function getTodayWeekDayIndex(date = new Date()): number {
  return (date.getDay() + 6) % 7
}

function formatDateLabel(date: Date, locale: 'pt-BR' | 'en'): string {
  const formatter = new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return formatter.format(date)
}

export default function WorkoutClient({ session, initialPlan, initialDays, initialDayExercises }: Props) {
  const router = useRouter()
  const { locale } = useApp()

  const [plan, setPlan] = useState<WorkoutPlanDTO | null>(initialPlan)
  const [days, setDays] = useState<WorkoutDayDTO[]>(sortWorkoutDays(initialDays))
  const [dayExercisesByDay, setDayExercisesByDay] = useState<Record<string, WorkoutDayExerciseDTO[]>>(
    groupExercisesByWorkoutDay(initialDayExercises)
  )

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createPlanModalVisible, setCreatePlanModalVisible] = useState(false)
  const [planName, setPlanName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createPlanError, setCreatePlanError] = useState('')
  const [planActionError, setPlanActionError] = useState('')

  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false)
  const [deletingPlan, setDeletingPlan] = useState(false)

  const [showDayModal, setShowDayModal] = useState(false)
  const [dayModalVisible, setDayModalVisible] = useState(false)
  const [editingDay, setEditingDay] = useState<WorkoutDayDTO | null>(null)
  const [dayName, setDayName] = useState('')
  const [dayWeekDay, setDayWeekDay] = useState('')
  const [daySubmitting, setDaySubmitting] = useState(false)
  const [dayFormError, setDayFormError] = useState('')
  const [dayActionError, setDayActionError] = useState('')

  const [deletingDayId, setDeletingDayId] = useState<string | null>(null)
  const [deletingDay, setDeletingDay] = useState(false)
  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null)

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false)
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false)
  const [exerciseTargetDay, setExerciseTargetDay] = useState<WorkoutDayDTO | null>(null)
  const [availableExercises, setAvailableExercises] = useState<ExerciseDTO[]>([])
  const [loadingAvailableExercises, setLoadingAvailableExercises] = useState(false)
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [exerciseGroupFilter, setExerciseGroupFilter] = useState<'ALL' | ExerciseMuscleGroup>('ALL')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [newExerciseSets, setNewExerciseSets] = useState('3')
  const [newExerciseReps, setNewExerciseReps] = useState('10-12')
  const [newExerciseTargetWeight, setNewExerciseTargetWeight] = useState('')
  const [newExerciseNotes, setNewExerciseNotes] = useState('')
  const [addingExerciseSubmitting, setAddingExerciseSubmitting] = useState(false)
  const [addExerciseError, setAddExerciseError] = useState('')
  const [exerciseActionError, setExerciseActionError] = useState('')

  const [showCreateCustomExerciseModal, setShowCreateCustomExerciseModal] = useState(false)
  const [customExerciseName, setCustomExerciseName] = useState('')
  const [customExerciseMuscleGroup, setCustomExerciseMuscleGroup] = useState<ExerciseMuscleGroup>('OTHER')
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState('')
  const [creatingCustomExercise, setCreatingCustomExercise] = useState(false)
  const [createCustomExerciseError, setCreateCustomExerciseError] = useState('')

  const [showEditDayExerciseModal, setShowEditDayExerciseModal] = useState(false)
  const [editDayExerciseModalVisible, setEditDayExerciseModalVisible] = useState(false)
  const [editingDayExercise, setEditingDayExercise] = useState<WorkoutDayExerciseDTO | null>(null)
  const [editExerciseSets, setEditExerciseSets] = useState('3')
  const [editExerciseReps, setEditExerciseReps] = useState('10-12')
  const [editExerciseTargetWeight, setEditExerciseTargetWeight] = useState('')
  const [editExerciseNotes, setEditExerciseNotes] = useState('')
  const [savingEditDayExercise, setSavingEditDayExercise] = useState(false)
  const [editDayExerciseError, setEditDayExerciseError] = useState('')

  const [showWorkoutExecutionModal, setShowWorkoutExecutionModal] = useState(false)
  const [workoutExecutionModalVisible, setWorkoutExecutionModalVisible] = useState(false)
  const [workoutExecutionDay, setWorkoutExecutionDay] = useState<WorkoutDayDTO | null>(null)
  const [workoutExecutionDateISO, setWorkoutExecutionDateISO] = useState('')
  const [workoutExecutionNotes, setWorkoutExecutionNotes] = useState('')
  const [workoutExecutionExercises, setWorkoutExecutionExercises] = useState<
    WorkoutExecutionExerciseState[]
  >([])
  const [savingWorkoutSession, setSavingWorkoutSession] = useState(false)
  const [workoutExecutionError, setWorkoutExecutionError] = useState('')
  const [workoutSessionSuccess, setWorkoutSessionSuccess] = useState('')

  const [deletingDayExercise, setDeletingDayExercise] = useState<{
    id: string
    workoutDayId: string
    label: string
  } | null>(null)
  const [deletingDayExerciseSubmitting, setDeletingDayExerciseSubmitting] = useState(false)
  const [deleteDayExerciseError, setDeleteDayExerciseError] = useState('')
  const [reorderingDayExerciseId, setReorderingDayExerciseId] = useState<string | null>(null)

  useEffect(() => {
    document.title = locale === 'pt-BR' ? 'Treino | Flowly' : 'Workout | Flowly'
  }, [locale])

  const selectedExercise = useMemo(
    () => availableExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null,
    [availableExercises, selectedExerciseId]
  )

  const filteredExercises = useMemo(() => {
    const normalizedQuery = exerciseQuery.trim().toLowerCase()

    return availableExercises.filter((exercise) => {
      if (exerciseGroupFilter !== 'ALL' && exercise.muscleGroup !== exerciseGroupFilter) {
        return false
      }

      if (!normalizedQuery) return true

      return (
        exercise.namePt.toLowerCase().includes(normalizedQuery) ||
        exercise.nameEn.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [availableExercises, exerciseQuery, exerciseGroupFilter])

  const todayWeekDayIndex = getTodayWeekDayIndex()

  const todayWorkout = useMemo(
    () => days.find((item) => item.weekDay === todayWeekDayIndex) ?? null,
    [days, todayWeekDayIndex]
  )

  const todayWorkoutExercises = useMemo(() => {
    if (!todayWorkout) return []
    return sortWorkoutDayExercises(dayExercisesByDay[todayWorkout.id] ?? [])
  }, [dayExercisesByDay, todayWorkout])

  const todayDateLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })

    return formatter.format(new Date())
  }, [locale])

  const workoutExecutionDateLabel = useMemo(() => {
    if (!workoutExecutionDateISO) return ''

    const parsed = new Date(workoutExecutionDateISO)
    if (Number.isNaN(parsed.getTime())) return ''

    return formatDateLabel(parsed, locale)
  }, [locale, workoutExecutionDateISO])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const openCreateModal = () => {
    setCreatePlanError('')
    setPlanName('')
    setShowCreateModal(true)
    requestAnimationFrame(() => setCreatePlanModalVisible(true))
  }

  const closeCreateModal = () => {
    setCreatePlanModalVisible(false)
    window.setTimeout(() => setShowCreateModal(false), 200)
  }

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (submitting) return

    const trimmedName = planName.trim()
    if (!trimmedName) {
      setCreatePlanError('Informe o nome do plano')
      return
    }

    setSubmitting(true)
    setCreatePlanError('')

    try {
      const response = await fetch('/api/workout/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      })

      const payload: { error?: string; plan?: WorkoutPlanDTO } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setCreatePlanError(payload.error ?? 'Nao foi possivel criar o plano')
        return
      }

      if (payload.plan) {
        setPlan(payload.plan)
      }

      setDays([])
      setDayExercisesByDay({})
      closeCreateModal()
      router.refresh()
    } catch {
      setCreatePlanError('Erro de conexao. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const openDeletePlanModal = () => {
    setPlanActionError('')
    setShowDeletePlanModal(true)
  }

  const closeDeletePlanModal = () => {
    if (deletingPlan) return
    setShowDeletePlanModal(false)
  }

  const handleDeletePlan = async () => {
    if (!plan || deletingPlan) return

    setDeletingPlan(true)
    setPlanActionError('')

    try {
      const response = await fetch(`/api/workout/plan/${plan.id}`, {
        method: 'DELETE',
      })

      const payload: { error?: string } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setPlanActionError(payload.error ?? 'Nao foi possivel remover o plano')
        return
      }

      setPlan(null)
      setDays([])
      setDayExercisesByDay({})
      setShowDeletePlanModal(false)
      router.refresh()
    } catch {
      setPlanActionError('Erro de conexao. Tente novamente.')
    } finally {
      setDeletingPlan(false)
    }
  }

  const openCreateDayModal = () => {
    if (!plan) return

    setEditingDay(null)
    setDayFormError('')
    setDayName(getNextWorkoutDayName(days))
    setDayWeekDay('')
    setShowDayModal(true)
    requestAnimationFrame(() => setDayModalVisible(true))
  }

  const openEditDayModal = (day: WorkoutDayDTO) => {
    setEditingDay(day)
    setDayFormError('')
    setDayName(day.name)
    setDayWeekDay(day.weekDay === null ? '' : String(day.weekDay))
    setShowDayModal(true)
    requestAnimationFrame(() => setDayModalVisible(true))
  }

  const closeDayModal = () => {
    setDayModalVisible(false)
    window.setTimeout(() => {
      setShowDayModal(false)
      setEditingDay(null)
    }, 200)
  }

  const handleSaveDay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!plan || daySubmitting) return

    const trimmedName = dayName.trim()
    if (!trimmedName) {
      setDayFormError('Informe o nome do treino')
      return
    }

    setDaySubmitting(true)
    setDayFormError('')

    const weekDayValue = dayWeekDay === '' ? null : Number(dayWeekDay)
    const isEditing = !!editingDay

    try {
      const response = await fetch(isEditing ? `/api/workout/days/${editingDay.id}` : '/api/workout/days', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          weekDay: weekDayValue,
          ...(isEditing ? {} : { planId: plan.id }),
        }),
      })

      const payload: { error?: string; day?: WorkoutDayDTO } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setDayFormError(payload.error ?? 'Nao foi possivel salvar o treino')
        return
      }

      if (!payload.day) {
        setDayFormError('Resposta invalida do servidor')
        return
      }

      const savedDay = payload.day

      setDays((prev) => {
        if (isEditing) {
          return sortWorkoutDays(prev.map((item) => (item.id === savedDay.id ? savedDay : item)))
        }
        return sortWorkoutDays([...prev, savedDay])
      })

      closeDayModal()
    } catch {
      setDayFormError('Erro de conexao. Tente novamente.')
    } finally {
      setDaySubmitting(false)
    }
  }

  const openDeleteDayModal = (dayId: string) => {
    setDayActionError('')
    setDeletingDayId(dayId)
  }

  const closeDeleteDayModal = () => {
    if (deletingDay) return
    setDeletingDayId(null)
  }

  const handleDeleteDay = async () => {
    if (!deletingDayId || deletingDay) return

    setDeletingDay(true)
    setDayActionError('')

    try {
      const response = await fetch(`/api/workout/days/${deletingDayId}`, {
        method: 'DELETE',
      })

      const payload: { error?: string } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setDayActionError(payload.error ?? 'Nao foi possivel remover o treino')
        return
      }

      const dayIdToRemove = deletingDayId

      setDays((prev) => prev.filter((day) => day.id !== dayIdToRemove))
      setDayExercisesByDay((prev) => {
        const next = { ...prev }
        delete next[dayIdToRemove]
        return next
      })
      setDeletingDayId(null)
    } catch {
      setDayActionError('Erro de conexao. Tente novamente.')
    } finally {
      setDeletingDay(false)
    }
  }

  const handleMoveDay = async (dayId: string, direction: 'up' | 'down') => {
    if (reorderingDayId) return

    const currentIndex = days.findIndex((item) => item.id === dayId)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= days.length) return

    setDayActionError('')
    setReorderingDayId(dayId)

    const previousDays = days
    const optimisticDays = [...days]
    const currentDay = optimisticDays[currentIndex]
    const targetDay = optimisticDays[targetIndex]

    optimisticDays[currentIndex] = { ...targetDay, order: currentDay.order }
    optimisticDays[targetIndex] = { ...currentDay, order: targetDay.order }

    setDays(sortWorkoutDays(optimisticDays))

    try {
      const response = await fetch('/api/workout/days/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, direction }),
      })

      const payload: { error?: string; days?: WorkoutDayDTO[] } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setDays(previousDays)
        setDayActionError(payload.error ?? 'Nao foi possivel reordenar os treinos')
        return
      }

      if (payload.days) {
        setDays(sortWorkoutDays(payload.days))
      }
    } catch {
      setDays(previousDays)
      setDayActionError('Erro de conexao. Tente novamente.')
    } finally {
      setReorderingDayId(null)
    }
  }

  const loadAvailableExercises = async () => {
    setLoadingAvailableExercises(true)
    setAddExerciseError('')

    try {
      const response = await fetch('/api/workout/exercises')
      const payload: { error?: string; exercises?: ExerciseDTO[] } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setAddExerciseError(payload.error ?? 'Nao foi possivel carregar os exercicios')
        return
      }

      setAvailableExercises(payload.exercises ?? [])
    } catch {
      setAddExerciseError('Erro de conexao. Tente novamente.')
    } finally {
      setLoadingAvailableExercises(false)
    }
  }

  const openAddExerciseModal = async (day: WorkoutDayDTO) => {
    setExerciseActionError('')
    setExerciseTargetDay(day)
    setExerciseQuery('')
    setExerciseGroupFilter('ALL')
    setSelectedExerciseId(null)
    setNewExerciseSets('3')
    setNewExerciseReps('10-12')
    setNewExerciseTargetWeight('')
    setNewExerciseNotes('')
    setAddExerciseError('')
    setShowAddExerciseModal(true)
    requestAnimationFrame(() => setAddExerciseModalVisible(true))
    await loadAvailableExercises()
  }

  const closeAddExerciseModal = () => {
    if (addingExerciseSubmitting) return

    setAddExerciseModalVisible(false)
    window.setTimeout(() => {
      setShowAddExerciseModal(false)
      setExerciseTargetDay(null)
      setSelectedExerciseId(null)
    }, 200)
  }

  const openCreateCustomExerciseModal = () => {
    setCreateCustomExerciseError('')
    setCustomExerciseName(exerciseQuery.trim())
    setCustomExerciseMuscleGroup(exerciseGroupFilter === 'ALL' ? 'OTHER' : exerciseGroupFilter)
    setCustomExerciseEquipment('')
    setShowCreateCustomExerciseModal(true)
  }

  const closeCreateCustomExerciseModal = () => {
    if (creatingCustomExercise) return
    setShowCreateCustomExerciseModal(false)
  }

  const handleCreateCustomExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (creatingCustomExercise) return

    const trimmedName = customExerciseName.trim()
    if (!trimmedName) {
      setCreateCustomExerciseError('Informe o nome do exercicio')
      return
    }

    setCreatingCustomExercise(true)
    setCreateCustomExerciseError('')

    try {
      const response = await fetch('/api/workout/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          muscleGroup: customExerciseMuscleGroup,
          equipment: customExerciseEquipment.trim() || undefined,
        }),
      })

      const payload: { error?: string; exercise?: ExerciseDTO } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setCreateCustomExerciseError(payload.error ?? 'Nao foi possivel criar o exercicio')
        return
      }

      if (!payload.exercise) {
        setCreateCustomExerciseError('Resposta invalida do servidor')
        return
      }

      const createdExercise = payload.exercise

      setAvailableExercises((prev) => {
        const merged = [...prev, createdExercise]
        return merged.sort((a, b) => {
          if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1
          return a.namePt.localeCompare(b.namePt)
        })
      })

      setSelectedExerciseId(createdExercise.id)
      setShowCreateCustomExerciseModal(false)
    } catch {
      setCreateCustomExerciseError('Erro de conexao. Tente novamente.')
    } finally {
      setCreatingCustomExercise(false)
    }
  }

  const handleAddExerciseToDay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!exerciseTargetDay || !selectedExerciseId || addingExerciseSubmitting) return

    let setsValue: number
    let targetWeightValue: number | null

    try {
      setsValue = parseSetsInput(newExerciseSets)
      targetWeightValue = parseOptionalWeightInput(newExerciseTargetWeight)
    } catch (error: unknown) {
      setAddExerciseError(error instanceof Error ? error.message : 'Dados invalidos')
      return
    }

    const repsValue = newExerciseReps.trim()
    if (!repsValue) {
      setAddExerciseError('Informe as repeticoes')
      return
    }

    setAddingExerciseSubmitting(true)
    setAddExerciseError('')

    try {
      const response = await fetch('/api/workout/day-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutDayId: exerciseTargetDay.id,
          exerciseId: selectedExerciseId,
          sets: setsValue,
          reps: repsValue,
          targetWeight: targetWeightValue,
          notes: newExerciseNotes.trim() || undefined,
        }),
      })

      const payload: { error?: string; workoutDayExercise?: WorkoutDayExerciseDTO } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        setAddExerciseError(payload.error ?? 'Nao foi possivel adicionar o exercicio')
        return
      }

      if (!payload.workoutDayExercise) {
        setAddExerciseError('Resposta invalida do servidor')
        return
      }

      const createdWorkoutDayExercise = payload.workoutDayExercise

      setDayExercisesByDay((prev) => {
        const current = prev[exerciseTargetDay.id] ?? []
        return {
          ...prev,
          [exerciseTargetDay.id]: sortWorkoutDayExercises([...current, createdWorkoutDayExercise]),
        }
      })

      closeAddExerciseModal()
    } catch {
      setAddExerciseError('Erro de conexao. Tente novamente.')
    } finally {
      setAddingExerciseSubmitting(false)
    }
  }

  const openEditDayExerciseModal = (item: WorkoutDayExerciseDTO) => {
    setEditingDayExercise(item)
    setEditExerciseSets(String(item.sets))
    setEditExerciseReps(item.reps)
    setEditExerciseTargetWeight(item.targetWeight ?? '')
    setEditExerciseNotes(item.notes ?? '')
    setEditDayExerciseError('')
    setShowEditDayExerciseModal(true)
    requestAnimationFrame(() => setEditDayExerciseModalVisible(true))
  }

  const closeEditDayExerciseModal = () => {
    if (savingEditDayExercise) return
    setEditDayExerciseModalVisible(false)
    window.setTimeout(() => {
      setShowEditDayExerciseModal(false)
      setEditingDayExercise(null)
    }, 200)
  }

  const handleUpdateDayExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editingDayExercise || savingEditDayExercise) return

    let setsValue: number
    let targetWeightValue: number | null

    try {
      setsValue = parseSetsInput(editExerciseSets)
      targetWeightValue = parseOptionalWeightInput(editExerciseTargetWeight)
    } catch (error: unknown) {
      setEditDayExerciseError(error instanceof Error ? error.message : 'Dados invalidos')
      return
    }

    const repsValue = editExerciseReps.trim()
    if (!repsValue) {
      setEditDayExerciseError('Informe as repeticoes')
      return
    }

    setSavingEditDayExercise(true)
    setEditDayExerciseError('')

    try {
      const response = await fetch(`/api/workout/day-exercises/${editingDayExercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sets: setsValue,
          reps: repsValue,
          targetWeight: targetWeightValue,
          notes: editExerciseNotes.trim() || undefined,
        }),
      })

      const payload: { error?: string; workoutDayExercise?: WorkoutDayExerciseDTO } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        setEditDayExerciseError(payload.error ?? 'Nao foi possivel atualizar o exercicio')
        return
      }

      if (!payload.workoutDayExercise) {
        setEditDayExerciseError('Resposta invalida do servidor')
        return
      }

      const updatedItem = payload.workoutDayExercise

      setDayExercisesByDay((prev) => {
        const current = prev[updatedItem.workoutDayId] ?? []
        return {
          ...prev,
          [updatedItem.workoutDayId]: sortWorkoutDayExercises(
            current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
          ),
        }
      })

      closeEditDayExerciseModal()
    } catch {
      setEditDayExerciseError('Erro de conexao. Tente novamente.')
    } finally {
      setSavingEditDayExercise(false)
    }
  }

  const openDeleteDayExerciseModal = (item: WorkoutDayExerciseDTO) => {
    setDeleteDayExerciseError('')
    setDeletingDayExercise({
      id: item.id,
      workoutDayId: item.workoutDayId,
      label: getExerciseDisplayName(item.exercise, locale),
    })
  }

  const closeDeleteDayExerciseModal = () => {
    if (deletingDayExerciseSubmitting) return
    setDeletingDayExercise(null)
  }

  const handleDeleteDayExercise = async () => {
    if (!deletingDayExercise || deletingDayExerciseSubmitting) return

    setDeletingDayExerciseSubmitting(true)
    setDeleteDayExerciseError('')

    try {
      const response = await fetch(`/api/workout/day-exercises/${deletingDayExercise.id}`, {
        method: 'DELETE',
      })

      const payload: { error?: string } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setDeleteDayExerciseError(payload.error ?? 'Nao foi possivel remover o exercicio')
        return
      }

      const dayId = deletingDayExercise.workoutDayId
      const exerciseId = deletingDayExercise.id

      setDayExercisesByDay((prev) => {
        const current = prev[dayId] ?? []
        return {
          ...prev,
          [dayId]: current.filter((item) => item.id !== exerciseId),
        }
      })

      setDeletingDayExercise(null)
    } catch {
      setDeleteDayExerciseError('Erro de conexao. Tente novamente.')
    } finally {
      setDeletingDayExerciseSubmitting(false)
    }
  }

  const handleMoveDayExercise = async (
    workoutDayId: string,
    id: string,
    direction: 'up' | 'down'
  ) => {
    if (reorderingDayExerciseId) return

    const dayItems = dayExercisesByDay[workoutDayId] ?? []
    const currentIndex = dayItems.findIndex((item) => item.id === id)
    if (currentIndex < 0) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= dayItems.length) return

    setExerciseActionError('')
    setReorderingDayExerciseId(id)

    const previousItems = dayItems
    const optimisticItems = [...dayItems]
    const currentItem = optimisticItems[currentIndex]
    const targetItem = optimisticItems[targetIndex]

    optimisticItems[currentIndex] = { ...targetItem, order: currentItem.order }
    optimisticItems[targetIndex] = { ...currentItem, order: targetItem.order }

    setDayExercisesByDay((prev) => ({
      ...prev,
      [workoutDayId]: sortWorkoutDayExercises(optimisticItems),
    }))

    try {
      const response = await fetch('/api/workout/day-exercises/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      })

      const payload: { error?: string; exercises?: WorkoutDayExerciseDTO[] } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        setDayExercisesByDay((prev) => ({ ...prev, [workoutDayId]: previousItems }))
        setExerciseActionError(payload.error ?? 'Nao foi possivel reordenar os exercicios')
        return
      }

      if (payload.exercises) {
        setDayExercisesByDay((prev) => ({
          ...prev,
          [workoutDayId]: sortWorkoutDayExercises(payload.exercises ?? []),
        }))
      }
    } catch {
      setDayExercisesByDay((prev) => ({ ...prev, [workoutDayId]: previousItems }))
      setExerciseActionError('Erro de conexao. Tente novamente.')
    } finally {
      setReorderingDayExerciseId(null)
    }
  }

  const openWorkoutExecutionModal = (day: WorkoutDayDTO) => {
    if (!plan) return

    const dayExercises = sortWorkoutDayExercises(dayExercisesByDay[day.id] ?? [])
    if (dayExercises.length === 0) {
      setWorkoutSessionSuccess('')
      setWorkoutExecutionError(
        locale === 'pt-BR'
          ? 'Adicione exercicios ao treino para iniciar a execucao.'
          : 'Add exercises to this workout before starting execution.'
      )
      return
    }

    setWorkoutSessionSuccess('')
    setWorkoutExecutionError('')
    setWorkoutExecutionDay(day)
    setWorkoutExecutionDateISO(new Date().toISOString())
    setWorkoutExecutionNotes('')
    setWorkoutExecutionExercises(
      dayExercises.map((item) => ({
        workoutDayExerciseId: item.id,
        exerciseId: item.exerciseId,
        exercise: item.exercise,
        plannedSets: item.sets,
        plannedReps: item.reps,
        plannedTargetWeight: item.targetWeight,
        setsDone: String(item.sets),
        repsDone: item.reps,
        weightUsed: item.targetWeight ?? '',
        notes: '',
        completed: false,
      }))
    )

    setShowWorkoutExecutionModal(true)
    requestAnimationFrame(() => setWorkoutExecutionModalVisible(true))
  }

  const closeWorkoutExecutionModal = (force = false) => {
    if (savingWorkoutSession && !force) return

    setWorkoutExecutionModalVisible(false)
    window.setTimeout(() => {
      setShowWorkoutExecutionModal(false)
      setWorkoutExecutionDay(null)
      setWorkoutExecutionExercises([])
      setWorkoutExecutionError('')
      setWorkoutExecutionNotes('')
      setWorkoutExecutionDateISO('')
    }, 200)
  }

  const updateWorkoutExecutionExercise = (
    workoutDayExerciseId: string,
    updates: Partial<WorkoutExecutionExerciseState>
  ) => {
    setWorkoutExecutionExercises((prev) =>
      prev.map((item) => (item.workoutDayExerciseId === workoutDayExerciseId ? { ...item, ...updates } : item))
    )
  }

  const handleCompleteWorkoutSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!plan || !workoutExecutionDay || savingWorkoutSession) return

    setSavingWorkoutSession(true)
    setWorkoutExecutionError('')

    try {
      const exercisesPayload = workoutExecutionExercises.map((item) => {
        const setsDone = parseOptionalSetsDoneInput(item.setsDone)
        const repsDone = parseOptionalRepsDoneInput(item.repsDone)
        const weightUsed = parseOptionalWeightInput(item.weightUsed)
        const notes = item.notes.trim()

        if (notes.length > 600) {
          throw new Error('Observacao do exercicio muito longa')
        }

        return {
          exerciseId: item.exerciseId,
          setsDone,
          repsDone,
          weightUsed,
          completed: item.completed,
          notes: notes || undefined,
        }
      })

      const dayNotes = workoutExecutionNotes.trim()
      if (dayNotes.length > 1000) {
        throw new Error('Observacao do treino muito longa')
      }

      const response = await fetch('/api/workout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          workoutDayId: workoutExecutionDay.id,
          date: workoutExecutionDateISO || new Date().toISOString(),
          dayNotes: dayNotes || undefined,
          exercises: exercisesPayload,
        }),
      })

      const payload: { error?: string } = await response.json().catch(() => ({}))

      if (!response.ok) {
        setWorkoutExecutionError(payload.error ?? 'Nao foi possivel concluir o treino')
        return
      }

      setWorkoutSessionSuccess(
        locale === 'pt-BR'
          ? 'Treino concluido e salvo com sucesso.'
          : 'Workout completed and saved successfully.'
      )
      closeWorkoutExecutionModal(true)
    } catch (error: unknown) {
      setWorkoutExecutionError(
        error instanceof Error ? error.message : 'Erro de conexao. Tente novamente.'
      )
    } finally {
      setSavingWorkoutSession(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 reports-page-enter">
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="text-base font-bold tracking-tight text-surface-900 dark:text-surface-100">
              {locale === 'pt-BR' ? 'Treino' : 'Workout'}
            </h1>
            <p className="hidden text-xs text-surface-500 dark:text-surface-400 sm:block">
              {locale === 'pt-BR'
                ? 'Organize seus treinos e acompanhe sua evolucao'
                : 'Organize your workouts and track progress'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-surface-500 dark:text-surface-400 sm:inline">
              {locale === 'pt-BR' ? 'Ola' : 'Hi'}, {session.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-surface-500 transition-colors hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200"
            >
              {locale === 'pt-BR' ? 'Sair' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {!plan ? (
          <section className="card animate-dashboard-fade relative flex min-h-[65vh] flex-col items-center justify-center overflow-hidden px-6 py-14 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-500/10 to-transparent" />

            <div className="relative mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-400/30 bg-brand-500/15 text-brand-500 shadow-lg shadow-brand-900/10">
              <Lucide.Dumbbell className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-100 sm:text-3xl">
              {locale === 'pt-BR' ? 'Treino' : 'Workout'}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-surface-500 dark:text-surface-400 sm:text-base">
              {locale === 'pt-BR'
                ? 'Organize seus treinos e acompanhe sua evolucao'
                : 'Organize your workouts and track progress'}
            </p>

            <button onClick={openCreateModal} className="btn-primary mt-8 w-full sm:w-auto">
              <Lucide.Plus className="mr-1.5 h-4 w-4" />
              {locale === 'pt-BR' ? 'Criar plano de treino' : 'Create workout plan'}
            </button>
          </section>
        ) : (
          <>
            <section className="card animate-dashboard-fade space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-surface-500 dark:text-surface-400">
                    {locale === 'pt-BR' ? 'Seu plano atual' : 'Current plan'}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-100">
                    {plan.name}
                  </h2>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    disabled
                    className="btn-secondary w-full opacity-60 disabled:cursor-not-allowed sm:w-auto"
                  >
                    <Lucide.Pencil className="mr-1.5 h-4 w-4" />
                    {locale === 'pt-BR' ? 'Editar plano' : 'Edit plan'}
                  </button>
                  <button
                    type="button"
                    onClick={openDeletePlanModal}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 sm:w-auto"
                  >
                    <Lucide.Trash2 className="mr-1.5 h-4 w-4" />
                    {locale === 'pt-BR' ? 'Remover plano' : 'Remove plan'}
                  </button>
                </div>
              </div>

              {planActionError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {planActionError}
                </p>
              )}
            </section>

            <section className="card animate-dashboard-fade relative overflow-hidden border border-brand-400/20 bg-gradient-to-br from-brand-500/10 via-white to-surface-50 dark:border-brand-700/40 dark:from-brand-500/10 dark:via-surface-900 dark:to-surface-950">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-500/20 to-transparent" />

              <div className="relative space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
                      {locale === 'pt-BR' ? 'Treino de hoje' : "Today's workout"}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-surface-900 dark:text-surface-100 sm:text-2xl">
                      {todayWorkout
                        ? todayWorkout.name
                        : locale === 'pt-BR'
                          ? 'Nenhum treino programado para hoje'
                          : 'No workout scheduled for today'}
                    </h3>
                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{todayDateLabel}</p>
                  </div>

                  {todayWorkout && (
                    <button
                      type="button"
                      onClick={() => openWorkoutExecutionModal(todayWorkout)}
                      disabled={todayWorkoutExercises.length === 0}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      <Lucide.Play className="mr-1.5 h-4 w-4" />
                      {locale === 'pt-BR' ? 'Iniciar treino' : 'Start workout'}
                    </button>
                  )}
                </div>

                {todayWorkout ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-surface-200/80 bg-white/80 p-4 dark:border-surface-700/70 dark:bg-surface-900/70">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-surface-500 dark:text-surface-400">
                        {locale === 'pt-BR' ? 'Dia da semana' : 'Week day'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-surface-900 dark:text-surface-100">
                        {getWeekDayLabel(todayWorkout.weekDay) ??
                          (locale === 'pt-BR' ? 'Sem dia fixo' : 'No fixed day')}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-surface-200/80 bg-white/80 p-4 dark:border-surface-700/70 dark:bg-surface-900/70">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-surface-500 dark:text-surface-400">
                        {locale === 'pt-BR' ? 'Exercicios' : 'Exercises'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-surface-900 dark:text-surface-100">
                        {todayWorkoutExercises.length}{' '}
                        {locale === 'pt-BR' ? 'configurados' : 'configured'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-surface-300/90 bg-white/70 p-5 text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-900/60 dark:text-surface-400">
                    {locale === 'pt-BR'
                      ? 'Nenhum treino programado para hoje'
                      : 'No workout scheduled for today'}
                  </div>
                )}

                {todayWorkout && todayWorkoutExercises.length === 0 && (
                  <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                    {locale === 'pt-BR'
                      ? 'Este treino ainda nao possui exercicios. Adicione exercicios para iniciar.'
                      : 'This workout has no exercises yet. Add exercises before starting.'}
                  </p>
                )}

                {workoutSessionSuccess && (
                  <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                    {workoutSessionSuccess}
                  </p>
                )}

                {!showWorkoutExecutionModal && workoutExecutionError && (
                  <p className="rounded-xl border border-red-200/80 bg-red-50/80 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                    {workoutExecutionError}
                  </p>
                )}
              </div>
            </section>

            <section className="card animate-dashboard-fade">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {locale === 'pt-BR' ? 'Seus treinos' : 'Your workouts'}
                </h3>
                <button type="button" onClick={openCreateDayModal} className="btn-primary w-full sm:w-auto">
                  <Lucide.Plus className="mr-1.5 h-4 w-4" />
                  {locale === 'pt-BR' ? 'Adicionar treino' : 'Add workout'}
                </button>
              </div>

              {dayActionError && (
                <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {dayActionError}
                </p>
              )}

              {exerciseActionError && (
                <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {exerciseActionError}
                </p>
              )}

              {days.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-surface-300 bg-surface-50/80 p-6 text-center dark:border-surface-700 dark:bg-surface-900/60">
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    {locale === 'pt-BR' ? 'Voce ainda nao criou seus treinos' : "You haven't created workouts yet"}
                  </p>
                  <button type="button" onClick={openCreateDayModal} className="btn-secondary mt-4 w-full sm:w-auto">
                    <Lucide.Plus className="mr-1.5 h-4 w-4" />
                    {locale === 'pt-BR' ? 'Adicionar treino' : 'Add workout'}
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {days.map((day, index) => {
                    const weekDayLabel = getWeekDayLabel(day.weekDay)
                    const canMoveUp = index > 0
                    const canMoveDown = index < days.length - 1
                    const dayExercises = sortWorkoutDayExercises(dayExercisesByDay[day.id] ?? [])

                    return (
                      <article
                        key={day.id}
                        className="rounded-2xl border border-surface-200/90 bg-white p-4 shadow-sm transition-colors dark:border-surface-700/60 dark:bg-surface-900/70 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-base font-semibold text-surface-900 dark:text-surface-100">{day.name}</h4>
                            {weekDayLabel && (
                              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">{weekDayLabel}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveDay(day.id, 'up')}
                              disabled={!canMoveUp || !!reorderingDayId}
                              className="h-9 w-9 rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                              title={locale === 'pt-BR' ? 'Mover para cima' : 'Move up'}
                            >
                              <Lucide.ArrowUp className="mx-auto h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveDay(day.id, 'down')}
                              disabled={!canMoveDown || !!reorderingDayId}
                              className="h-9 w-9 rounded-lg text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                              title={locale === 'pt-BR' ? 'Mover para baixo' : 'Move down'}
                            >
                              <Lucide.ArrowDown className="mx-auto h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditDayModal(day)}
                              className="h-9 w-9 rounded-lg text-surface-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                              title={locale === 'pt-BR' ? 'Editar treino' : 'Edit workout'}
                            >
                              <Lucide.Pencil className="mx-auto h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteDayModal(day.id)}
                              className="h-9 w-9 rounded-lg text-surface-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              title={locale === 'pt-BR' ? 'Remover treino' : 'Remove workout'}
                            >
                              <Lucide.Trash2 className="mx-auto h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => openAddExerciseModal(day)}
                            className="btn-secondary w-full sm:w-auto"
                          >
                            <Lucide.Plus className="mr-1.5 h-4 w-4" />
                            {locale === 'pt-BR' ? 'Adicionar exercicio' : 'Add exercise'}
                          </button>

                          {dayExercises.length === 0 ? (
                            <div className="mt-3 rounded-xl border border-dashed border-surface-300/80 bg-surface-50 px-3 py-3 text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-400">
                              {locale === 'pt-BR' ? 'Nenhum exercicio adicionado ainda' : 'No exercises added yet'}
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {dayExercises.map((item, itemIndex) => {
                                const canMoveExerciseUp = itemIndex > 0
                                const canMoveExerciseDown = itemIndex < dayExercises.length - 1

                                return (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-surface-200 bg-surface-50/70 p-3 dark:border-surface-700/60 dark:bg-surface-900/70"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-surface-900 dark:text-surface-100">
                                          {getExerciseDisplayName(item.exercise, locale)}
                                        </p>
                                        <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                                          {item.sets} x {item.reps}
                                          {item.targetWeight ? ` • ${item.targetWeight} kg` : ''}
                                        </p>
                                        {item.notes && (
                                          <p className="mt-1 break-words text-xs text-surface-400 dark:text-surface-500">
                                            {item.notes}
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex shrink-0 items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleMoveDayExercise(day.id, item.id, 'up')}
                                          disabled={!canMoveExerciseUp || !!reorderingDayExerciseId}
                                          className="h-8 w-8 rounded-lg text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-700 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                                          title={locale === 'pt-BR' ? 'Mover para cima' : 'Move up'}
                                        >
                                          <Lucide.ArrowUp className="mx-auto h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMoveDayExercise(day.id, item.id, 'down')}
                                          disabled={!canMoveExerciseDown || !!reorderingDayExerciseId}
                                          className="h-8 w-8 rounded-lg text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-700 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                                          title={locale === 'pt-BR' ? 'Mover para baixo' : 'Move down'}
                                        >
                                          <Lucide.ArrowDown className="mx-auto h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => openEditDayExerciseModal(item)}
                                          className="h-8 w-8 rounded-lg text-surface-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                                          title={locale === 'pt-BR' ? 'Editar exercicio' : 'Edit exercise'}
                                        >
                                          <Lucide.Pencil className="mx-auto h-4 w-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => openDeleteDayExerciseModal(item)}
                                          className="h-8 w-8 rounded-lg text-surface-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                          title={locale === 'pt-BR' ? 'Remover exercicio' : 'Remove exercise'}
                                        >
                                          <Lucide.Trash2 className="mx-auto h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {showCreateModal && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 transition-opacity duration-200 sm:items-center sm:p-4 ${
            createPlanModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.target === e.currentTarget && !submitting && closeCreateModal()}
        >
          <div
            className={`w-full rounded-t-3xl border border-surface-200/80 bg-white shadow-xl transition-all duration-200 dark:border-surface-700/60 dark:bg-surface-900 sm:max-w-lg sm:rounded-2xl ${
              createPlanModalVisible
                ? 'translate-y-0 opacity-100 sm:scale-100'
                : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-200/80 p-5 dark:border-surface-800">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {locale === 'pt-BR' ? 'Criar plano de treino' : 'Create workout plan'}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR'
                    ? 'Defina um nome para o seu plano atual.'
                    : 'Set a name for your current plan.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting}
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <Lucide.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-5 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                  {locale === 'pt-BR' ? 'Nome do plano' : 'Plan name'}
                </label>
                <input
                  type="text"
                  maxLength={80}
                  className="input-field"
                  placeholder={locale === 'pt-BR' ? 'Ex: Hipertrofia - Abril' : 'Ex: Hypertrophy - April'}
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  autoFocus
                />
              </div>

              {createPlanError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {createPlanError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="btn-secondary w-full sm:w-auto"
                >
                  {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                  {submitting
                    ? locale === 'pt-BR'
                      ? 'Criando...'
                      : 'Creating...'
                    : locale === 'pt-BR'
                      ? 'Criar plano'
                      : 'Create plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDayModal && (
        <div
          className={`fixed inset-0 z-[55] flex items-end justify-center bg-black/60 p-0 transition-opacity duration-200 sm:items-center sm:p-4 ${
            dayModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.target === e.currentTarget && !daySubmitting && closeDayModal()}
        >
          <div
            className={`w-full rounded-t-3xl border border-surface-200/80 bg-white shadow-xl transition-all duration-200 dark:border-surface-700/60 dark:bg-surface-900 sm:max-w-lg sm:rounded-2xl ${
              dayModalVisible
                ? 'translate-y-0 opacity-100 sm:scale-100'
                : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-200/80 p-5 dark:border-surface-800">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {editingDay
                    ? locale === 'pt-BR'
                      ? 'Editar treino'
                      : 'Edit workout'
                    : locale === 'pt-BR'
                      ? 'Adicionar treino'
                      : 'Add workout'}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR'
                    ? 'Personalize seu treino e prepare a estrutura para os exercicios.'
                    : 'Customize your workout and prepare exercise structure.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDayModal}
                disabled={daySubmitting}
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <Lucide.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDay} className="space-y-5 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                  {locale === 'pt-BR' ? 'Nome do treino' : 'Workout name'}
                </label>
                <input
                  type="text"
                  maxLength={80}
                  className="input-field"
                  placeholder={locale === 'pt-BR' ? 'Ex: A, Peito e triceps' : 'Ex: A, Chest and triceps'}
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">
                  {locale === 'pt-BR' ? 'Dia da semana (opcional)' : 'Week day (optional)'}
                </label>
                <select className="input-field" value={dayWeekDay} onChange={(e) => setDayWeekDay(e.target.value)}>
                  <option value="">{locale === 'pt-BR' ? 'Sem dia fixo' : 'No fixed day'}</option>
                  {WEEK_DAY_OPTIONS.map((item) => (
                    <option key={item.value} value={String(item.value)}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {dayFormError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {dayFormError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDayModal}
                  disabled={daySubmitting}
                  className="btn-secondary w-full sm:w-auto"
                >
                  {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" disabled={daySubmitting} className="btn-primary w-full sm:w-auto">
                  {daySubmitting
                    ? locale === 'pt-BR'
                      ? 'Salvando...'
                      : 'Saving...'
                    : editingDay
                      ? locale === 'pt-BR'
                        ? 'Salvar treino'
                        : 'Save workout'
                      : locale === 'pt-BR'
                        ? 'Adicionar treino'
                        : 'Add workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddExerciseModal && (
        <div
          className={`fixed inset-0 z-[58] flex items-end justify-center bg-black/60 p-0 transition-opacity duration-200 sm:items-center sm:p-4 ${
            addExerciseModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.target === e.currentTarget && closeAddExerciseModal()}
        >
          <div
            className={`w-full rounded-t-3xl border border-surface-200/80 bg-white shadow-xl transition-all duration-200 dark:border-surface-700/60 dark:bg-surface-900 sm:max-w-2xl sm:rounded-2xl ${
              addExerciseModalVisible
                ? 'translate-y-0 opacity-100 sm:scale-100'
                : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-200/80 p-5 dark:border-surface-800">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {locale === 'pt-BR' ? 'Adicionar exercicio' : 'Add exercise'}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  {exerciseTargetDay
                    ? locale === 'pt-BR'
                      ? `Treino ${exerciseTargetDay.name}`
                      : `Workout ${exerciseTargetDay.name}`
                    : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddExerciseModal}
                disabled={addingExerciseSubmitting}
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <Lucide.X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <input
                  type="text"
                  className="input-field"
                  placeholder={locale === 'pt-BR' ? 'Buscar por nome (PT ou EN)' : 'Search by name (PT or EN)'}
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                />
                <select
                  className="input-field"
                  value={exerciseGroupFilter}
                  onChange={(e) => setExerciseGroupFilter(e.target.value as 'ALL' | ExerciseMuscleGroup)}
                >
                  {MUSCLE_GROUP_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {locale === 'pt-BR' ? item.labelPt : item.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={openCreateCustomExerciseModal} className="btn-secondary w-full sm:w-auto">
                  <Lucide.Plus className="mr-1.5 h-4 w-4" />
                  {locale === 'pt-BR' ? 'Criar exercicio' : 'Create exercise'}
                </button>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {loadingAvailableExercises ? (
                  <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-400">
                    {locale === 'pt-BR' ? 'Carregando exercicios...' : 'Loading exercises...'}
                  </div>
                ) : filteredExercises.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-400">
                    {locale === 'pt-BR'
                      ? 'Nenhum exercicio encontrado. Crie um exercicio customizado.'
                      : 'No exercises found. Create a custom one.'}
                  </div>
                ) : (
                  filteredExercises.map((exercise) => {
                    const selected = selectedExerciseId === exercise.id

                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => setSelectedExerciseId(exercise.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                          selected
                            ? 'border-brand-400 bg-brand-50/70 dark:border-brand-500/50 dark:bg-brand-900/20'
                            : 'border-surface-200 bg-surface-50 hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800/50 dark:hover:bg-surface-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-surface-900 dark:text-surface-100">
                              {getExerciseDisplayName(exercise, locale)}
                            </p>
                            <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                              {getMuscleGroupLabel(exercise.muscleGroup, locale)}
                              {exercise.equipment ? ` • ${exercise.equipment}` : ''}
                              {exercise.isSystem ? '' : ` • ${locale === 'pt-BR' ? 'Personalizado' : 'Custom'}`}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                              selected
                                ? 'bg-brand-500 text-white'
                                : 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                            }`}
                          >
                            {selected ? (locale === 'pt-BR' ? 'Selecionado' : 'Selected') : locale === 'pt-BR' ? 'Escolher' : 'Choose'}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {selectedExercise && (
                <form
                  onSubmit={handleAddExerciseToDay}
                  className="space-y-4 rounded-2xl border border-brand-300/40 bg-gradient-to-br from-brand-500/10 via-white to-surface-50 p-4 dark:border-brand-700/40 dark:from-brand-500/10 dark:via-surface-900 dark:to-surface-950 sm:p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-brand-600 dark:text-brand-300">
                        {locale === 'pt-BR' ? 'Configurar no treino' : 'Configure in workout'}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-surface-900 dark:text-surface-100">
                        {getExerciseDisplayName(selectedExercise, locale)}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full border border-surface-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-surface-500 dark:border-surface-700/80 dark:bg-surface-900/70 dark:text-surface-300">
                      {getMuscleGroupLabel(selectedExercise.muscleGroup, locale)}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                        {locale === 'pt-BR' ? 'Series' : 'Sets'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        className="input-field"
                        value={newExerciseSets}
                        onChange={(e) => setNewExerciseSets(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                        {locale === 'pt-BR' ? 'Repeticoes' : 'Reps'}
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={newExerciseReps}
                        onChange={(e) => setNewExerciseReps(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                      {locale === 'pt-BR' ? 'Carga alvo (opcional)' : 'Target weight (optional)'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: 40"
                      value={newExerciseTargetWeight}
                      onChange={(e) => setNewExerciseTargetWeight(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                      {locale === 'pt-BR' ? 'Observacao (opcional)' : 'Notes (optional)'}
                    </label>
                    <textarea
                      className="input-field min-h-[96px] resize-y"
                      value={newExerciseNotes}
                      onChange={(e) => setNewExerciseNotes(e.target.value)}
                    />
                  </div>

                  {addExerciseError && (
                    <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {addExerciseError}
                    </p>
                  )}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeAddExerciseModal}
                      disabled={addingExerciseSubmitting}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button type="submit" disabled={addingExerciseSubmitting} className="btn-primary w-full sm:w-auto">
                      {addingExerciseSubmitting
                        ? locale === 'pt-BR'
                          ? 'Adicionando...'
                          : 'Adding...'
                        : locale === 'pt-BR'
                          ? 'Adicionar ao treino'
                          : 'Add to workout'}
                    </button>
                  </div>
                </form>
              )}

              {!selectedExercise && addExerciseError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {addExerciseError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateCustomExerciseModal && (
        <div
          className="fixed inset-0 z-[62] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeCreateCustomExerciseModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-surface-200/80 bg-white shadow-elevated dark:border-surface-700/60 dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-200/80 p-5 dark:border-surface-800">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {locale === 'pt-BR' ? 'Criar exercicio' : 'Create exercise'}
                </h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR'
                    ? 'Adicione um exercicio personalizado para sua conta.'
                    : 'Add a custom exercise for your account.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateCustomExerciseModal}
                disabled={creatingCustomExercise}
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <Lucide.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-4 p-5">
              <div className="space-y-1">
                <label className="block text-xs text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR' ? 'Nome do exercicio' : 'Exercise name'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  maxLength={80}
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR' ? 'Grupo muscular' : 'Muscle group'}
                </label>
                <select
                  className="input-field"
                  value={customExerciseMuscleGroup}
                  onChange={(e) => setCustomExerciseMuscleGroup(e.target.value as ExerciseMuscleGroup)}
                >
                  {MUSCLE_GROUP_OPTIONS.filter((item) => item.value !== 'ALL').map((item) => (
                    <option key={item.value} value={item.value}>
                      {locale === 'pt-BR' ? item.labelPt : item.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR' ? 'Equipamento (opcional)' : 'Equipment (optional)'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customExerciseEquipment}
                  onChange={(e) => setCustomExerciseEquipment(e.target.value)}
                  maxLength={80}
                />
              </div>

              {createCustomExerciseError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {createCustomExerciseError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateCustomExerciseModal}
                  disabled={creatingCustomExercise}
                  className="btn-secondary w-full sm:w-auto"
                >
                  {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" disabled={creatingCustomExercise} className="btn-primary w-full sm:w-auto">
                  {creatingCustomExercise
                    ? locale === 'pt-BR'
                      ? 'Criando...'
                      : 'Creating...'
                    : locale === 'pt-BR'
                      ? 'Criar exercicio'
                      : 'Create exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditDayExerciseModal && editingDayExercise && (
        <div
          className={`fixed inset-0 z-[63] flex items-end justify-center bg-black/60 p-0 transition-opacity duration-200 sm:items-center sm:p-4 ${
            editDayExerciseModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.target === e.currentTarget && closeEditDayExerciseModal()}
        >
          <div
            className={`w-full rounded-t-3xl border border-surface-200/80 bg-white shadow-xl transition-all duration-200 dark:border-surface-700/60 dark:bg-surface-900 sm:max-w-2xl sm:rounded-2xl ${
              editDayExerciseModalVisible
                ? 'translate-y-0 opacity-100 sm:scale-100'
                : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-200/80 p-5 dark:border-surface-800">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-brand-600 dark:text-brand-300">
                  {locale === 'pt-BR' ? 'Editar configuracao' : 'Edit configuration'}
                </p>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {locale === 'pt-BR' ? 'Editar exercicio' : 'Edit exercise'}
                </h3>
                <p className="mt-1 truncate text-sm text-surface-500 dark:text-surface-400">
                  {getExerciseDisplayName(editingDayExercise.exercise, locale)}
                </p>
                <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
                  {getMuscleGroupLabel(editingDayExercise.exercise.muscleGroup, locale)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditDayExerciseModal}
                disabled={savingEditDayExercise}
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <Lucide.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDayExercise} className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl border border-surface-200/80 bg-surface-50/80 p-4 dark:border-surface-700/80 dark:bg-surface-900/80">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR' ? 'Parametros principais' : 'Main parameters'}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                      {locale === 'pt-BR' ? 'Series' : 'Sets'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="input-field"
                      value={editExerciseSets}
                      onChange={(e) => setEditExerciseSets(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                      {locale === 'pt-BR' ? 'Repeticoes' : 'Reps'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={editExerciseReps}
                      onChange={(e) => setEditExerciseReps(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-200/80 bg-surface-50/80 p-4 dark:border-surface-700/80 dark:bg-surface-900/80">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                  {locale === 'pt-BR' ? 'Carga e observacoes' : 'Weight and notes'}
                </p>

                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                      {locale === 'pt-BR' ? 'Carga alvo (opcional)' : 'Target weight (optional)'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={editExerciseTargetWeight}
                      onChange={(e) => setEditExerciseTargetWeight(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                      {locale === 'pt-BR' ? 'Observacao (opcional)' : 'Notes (optional)'}
                    </label>
                    <textarea
                      className="input-field min-h-[96px] resize-y"
                      value={editExerciseNotes}
                      onChange={(e) => setEditExerciseNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {editDayExerciseError && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {editDayExerciseError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditDayExerciseModal}
                  disabled={savingEditDayExercise}
                  className="btn-secondary w-full sm:w-auto"
                >
                  {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                </button>
                <button type="submit" disabled={savingEditDayExercise} className="btn-primary w-full sm:w-auto">
                  {savingEditDayExercise
                    ? locale === 'pt-BR'
                      ? 'Salvando...'
                      : 'Saving...'
                    : locale === 'pt-BR'
                      ? 'Salvar'
                      : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWorkoutExecutionModal && workoutExecutionDay && (
        <div
          className={`fixed inset-0 z-[67] flex items-end justify-center bg-black/70 p-0 transition-opacity duration-200 sm:p-4 ${
            workoutExecutionModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.target === e.currentTarget && closeWorkoutExecutionModal()}
        >
          <div
            className={`flex h-[100dvh] w-full flex-col overflow-hidden border border-surface-200/80 bg-white shadow-xl transition-all duration-200 dark:border-surface-700/60 dark:bg-surface-900 sm:h-[90vh] sm:max-w-4xl sm:rounded-2xl ${
              workoutExecutionModalVisible
                ? 'translate-y-0 opacity-100 sm:scale-100'
                : 'translate-y-8 opacity-0 sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-surface-200/80 bg-gradient-to-br from-brand-500/12 via-white to-surface-50 p-4 dark:border-surface-700/70 dark:from-brand-500/10 dark:via-surface-900 dark:to-surface-950 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
                    {locale === 'pt-BR' ? 'Execucao do treino' : 'Workout execution'}
                  </p>
                  <h3 className="mt-1 truncate text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-100">
                    {workoutExecutionDay.name}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                    {workoutExecutionDateLabel}
                    {` • ${workoutExecutionExercises.length} ${
                      locale === 'pt-BR' ? 'exercicios' : 'exercises'
                    }`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => closeWorkoutExecutionModal()}
                  disabled={savingWorkoutSession}
                  className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
                >
                  <Lucide.X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCompleteWorkoutSession} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                <div className="rounded-2xl border border-surface-200/80 bg-surface-50/80 p-4 dark:border-surface-700/70 dark:bg-surface-900/70">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                    {locale === 'pt-BR' ? 'Observacoes do treino (opcional)' : 'Session notes (optional)'}
                  </label>
                  <textarea
                    className="input-field mt-2 min-h-[90px] resize-y"
                    value={workoutExecutionNotes}
                    onChange={(e) => setWorkoutExecutionNotes(e.target.value)}
                    placeholder={
                      locale === 'pt-BR'
                        ? 'Como foi o treino de hoje?'
                        : 'How did today\'s workout feel?'
                    }
                  />
                </div>

                <div className="space-y-3">
                  {workoutExecutionExercises.map((item, index) => (
                    <article
                      key={item.workoutDayExerciseId}
                      className="rounded-2xl border border-surface-200/90 bg-white p-4 shadow-sm dark:border-surface-700/70 dark:bg-surface-900/80 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 sm:text-base">
                            {index + 1}. {getExerciseDisplayName(item.exercise, locale)}
                          </p>
                          <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                            {locale === 'pt-BR' ? 'Planejado' : 'Planned'}: {item.plannedSets} x {item.plannedReps}
                            {item.plannedTargetWeight ? ` • ${item.plannedTargetWeight} kg` : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateWorkoutExecutionExercise(item.workoutDayExerciseId, {
                              completed: !item.completed,
                            })
                          }
                          className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                            item.completed
                              ? 'border-emerald-500/60 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'border-surface-300 bg-surface-100 text-surface-600 hover:bg-surface-200 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
                          }`}
                        >
                          <Lucide.CheckCircle2 className="mr-1.5 h-4 w-4" />
                          {item.completed
                            ? locale === 'pt-BR'
                              ? 'Concluido'
                              : 'Done'
                            : locale === 'pt-BR'
                              ? 'Marcar concluido'
                              : 'Mark done'}
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                            {locale === 'pt-BR' ? 'Series feitas' : 'Sets done'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            className="input-field"
                            value={item.setsDone}
                            onChange={(e) =>
                              updateWorkoutExecutionExercise(item.workoutDayExerciseId, {
                                setsDone: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                            {locale === 'pt-BR' ? 'Repeticoes feitas' : 'Reps done'}
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={item.repsDone}
                            onChange={(e) =>
                              updateWorkoutExecutionExercise(item.workoutDayExerciseId, {
                                repsDone: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                            {locale === 'pt-BR' ? 'Carga usada' : 'Weight used'}
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            value={item.weightUsed}
                            onChange={(e) =>
                              updateWorkoutExecutionExercise(item.workoutDayExerciseId, {
                                weightUsed: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500 dark:text-surface-400">
                          {locale === 'pt-BR' ? 'Observacoes (opcional)' : 'Notes (optional)'}
                        </label>
                        <textarea
                          className="input-field min-h-[84px] resize-y"
                          value={item.notes}
                          onChange={(e) =>
                            updateWorkoutExecutionExercise(item.workoutDayExerciseId, {
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>
                    </article>
                  ))}
                </div>

                {workoutExecutionError && (
                  <p className="rounded-lg border border-red-200/80 bg-red-50/80 p-2.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                    {workoutExecutionError}
                  </p>
                )}
              </div>

              <div className="border-t border-surface-200/80 p-4 dark:border-surface-700/70 sm:p-5">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => closeWorkoutExecutionModal()}
                    disabled={savingWorkoutSession}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button type="submit" disabled={savingWorkoutSession} className="btn-primary w-full sm:w-auto">
                    {savingWorkoutSession
                      ? locale === 'pt-BR'
                        ? 'Salvando treino...'
                        : 'Saving workout...'
                      : locale === 'pt-BR'
                        ? 'Concluir treino'
                        : 'Complete workout'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeletePlanModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeDeletePlanModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-surface-200/80 bg-white p-6 shadow-elevated dark:border-surface-700/60 dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Lucide.Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-center text-base font-semibold text-surface-900 dark:text-surface-100">
              {locale === 'pt-BR' ? 'Remover plano de treino?' : 'Remove workout plan?'}
            </h3>
            <p className="mt-2 text-center text-sm text-surface-500 dark:text-surface-400">
              {locale === 'pt-BR'
                ? 'Essa acao nao pode ser desfeita. Todos os treinos serao removidos.'
                : 'This action cannot be undone. All workouts will be removed.'}
            </p>

            {planActionError && (
              <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {planActionError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={closeDeletePlanModal} disabled={deletingPlan} className="btn-secondary flex-1">
                {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={deletingPlan}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingPlan
                  ? locale === 'pt-BR'
                    ? 'Removendo...'
                    : 'Removing...'
                  : locale === 'pt-BR'
                    ? 'Remover'
                    : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingDayId && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeDeleteDayModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-surface-200/80 bg-white p-6 shadow-elevated dark:border-surface-700/60 dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Lucide.Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-center text-base font-semibold text-surface-900 dark:text-surface-100">
              {locale === 'pt-BR' ? 'Remover treino?' : 'Remove workout?'}
            </h3>
            <p className="mt-2 text-center text-sm text-surface-500 dark:text-surface-400">
              {locale === 'pt-BR'
                ? 'Os exercicios associados serao removidos.'
                : 'Associated exercises will be removed.'}
            </p>

            {dayActionError && (
              <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {dayActionError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={closeDeleteDayModal} disabled={deletingDay} className="btn-secondary flex-1">
                {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteDay}
                disabled={deletingDay}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingDay
                  ? locale === 'pt-BR'
                    ? 'Removendo...'
                    : 'Removing...'
                  : locale === 'pt-BR'
                    ? 'Remover'
                    : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingDayExercise && (
        <div
          className="fixed inset-0 z-[66] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeDeleteDayExerciseModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-surface-200/80 bg-white p-6 shadow-elevated dark:border-surface-700/60 dark:bg-surface-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Lucide.Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-center text-base font-semibold text-surface-900 dark:text-surface-100">
              {locale === 'pt-BR' ? 'Remover exercicio?' : 'Remove exercise?'}
            </h3>
            <p className="mt-2 text-center text-sm text-surface-500 dark:text-surface-400">
              {locale === 'pt-BR'
                ? `Deseja remover ${deletingDayExercise.label} deste treino?`
                : `Do you want to remove ${deletingDayExercise.label} from this workout?`}
            </p>

            {deleteDayExerciseError && (
              <p className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {deleteDayExerciseError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeDeleteDayExerciseModal}
                disabled={deletingDayExerciseSubmitting}
                className="btn-secondary flex-1"
              >
                {locale === 'pt-BR' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteDayExercise}
                disabled={deletingDayExerciseSubmitting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingDayExerciseSubmitting
                  ? locale === 'pt-BR'
                    ? 'Removendo...'
                    : 'Removing...'
                  : locale === 'pt-BR'
                    ? 'Remover'
                    : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
