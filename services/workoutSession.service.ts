'use server'

import { prisma } from '@/lib/prisma'

interface WorkoutDayRecord {
  id: string
  planId: string
}

interface WorkoutDayDelegate {
  findFirst(args: {
    where: Record<string, unknown>
    select?: Record<string, unknown>
  }): Promise<WorkoutDayRecord | null>
}

interface WorkoutDayExerciseRecord {
  id: string
  exerciseId: string
}

interface WorkoutDayExerciseDelegate {
  findMany(args: {
    where: Record<string, unknown>
    select?: Record<string, unknown>
    orderBy?: Record<string, unknown> | Array<Record<string, unknown>>
  }): Promise<WorkoutDayExerciseRecord[]>
}

interface WorkoutSessionRecord {
  id: string
  userId: string
  planId: string
  workoutDayId: string
  date: Date
  completed: boolean
  dayNotes: string | null
  createdAt: Date
  updatedAt: Date
}

interface WorkoutSessionDelegate {
  create(args: {
    data: Record<string, unknown>
  }): Promise<WorkoutSessionRecord>
}

interface WorkoutSessionExerciseRecord {
  id: string
  workoutSessionId: string
  exerciseId: string
  setsDone: number | null
  repsDone: string | null
  weightUsed: unknown
  completed: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface WorkoutSessionExerciseDelegate {
  createMany(args: {
    data: Array<Record<string, unknown>>
  }): Promise<{ count: number }>
  findMany(args: {
    where: Record<string, unknown>
    orderBy?: Record<string, unknown> | Array<Record<string, unknown>>
  }): Promise<WorkoutSessionExerciseRecord[]>
}

function workoutDayDelegate(client: unknown): WorkoutDayDelegate {
  return (client as { workoutDay: WorkoutDayDelegate }).workoutDay
}

function workoutDayExerciseDelegate(client: unknown): WorkoutDayExerciseDelegate {
  return (client as { workoutDayExercise: WorkoutDayExerciseDelegate }).workoutDayExercise
}

function workoutSessionDelegate(client: unknown): WorkoutSessionDelegate {
  return (client as { workoutSession: WorkoutSessionDelegate }).workoutSession
}

function workoutSessionExerciseDelegate(client: unknown): WorkoutSessionExerciseDelegate {
  return (client as { workoutSessionExercise: WorkoutSessionExerciseDelegate }).workoutSessionExercise
}

export interface CompleteWorkoutSessionInput {
  planId: string
  workoutDayId: string
  date?: string
  dayNotes?: string
  exercises: Array<{
    exerciseId: string
    setsDone?: number | null
    repsDone?: string | null
    weightUsed?: number | null
    completed?: boolean
    notes?: string
  }>
}

export interface WorkoutSessionExerciseDTO {
  id: string
  workoutSessionId: string
  exerciseId: string
  setsDone: number | null
  repsDone: string | null
  weightUsed: string | null
  completed: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkoutSessionDTO {
  id: string
  userId: string
  planId: string
  workoutDayId: string
  date: string
  completed: boolean
  dayNotes: string | null
  createdAt: string
  updatedAt: string
  exercises: WorkoutSessionExerciseDTO[]
}

function decimalToString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object' && value && 'toString' in value) {
    return String(value)
  }
  return null
}

function toWorkoutSessionExerciseDTO(
  item: WorkoutSessionExerciseRecord
): WorkoutSessionExerciseDTO {
  return {
    id: item.id,
    workoutSessionId: item.workoutSessionId,
    exerciseId: item.exerciseId,
    setsDone: item.setsDone,
    repsDone: item.repsDone,
    weightUsed: decimalToString(item.weightUsed),
    completed: item.completed,
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

function toWorkoutSessionDTO(
  session: WorkoutSessionRecord,
  exercises: WorkoutSessionExerciseRecord[]
): WorkoutSessionDTO {
  return {
    id: session.id,
    userId: session.userId,
    planId: session.planId,
    workoutDayId: session.workoutDayId,
    date: session.date.toISOString(),
    completed: session.completed,
    dayNotes: session.dayNotes,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    exercises: exercises.map(toWorkoutSessionExerciseDTO),
  }
}

async function ensureWorkoutDayOwnership(
  userId: string,
  planId: string,
  workoutDayId: string
): Promise<WorkoutDayRecord> {
  const day = await workoutDayDelegate(prisma).findFirst({
    where: {
      id: workoutDayId,
      planId,
      plan: { userId },
    },
    select: {
      id: true,
      planId: true,
    },
  })

  if (!day) {
    throw new Error('Treino nao encontrado')
  }

  return day
}

function normalizeSessionDate(value?: string): Date {
  if (!value) return new Date()

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Data da sessao invalida')
  }

  return parsed
}

function normalizeDayNotes(value?: string): string | null {
  if (!value) return null

  const normalized = value.trim()
  if (!normalized) return null

  if (normalized.length > 1000) {
    throw new Error('Observacao do treino muito longa')
  }

  return normalized
}

function normalizeOptionalSetsDone(value?: number | null): number | null {
  if (value === null || value === undefined) return null

  if (!Number.isInteger(value) || value < 1 || value > 50) {
    throw new Error('Series realizadas invalidas')
  }

  return value
}

function normalizeOptionalRepsDone(value?: string | null): string | null {
  if (value === null || value === undefined) return null

  const normalized = value.trim()
  if (!normalized) return null

  if (normalized.length > 30) {
    throw new Error('Repeticoes realizadas muito longas')
  }

  return normalized
}

function normalizeOptionalWeightUsed(value?: number | null): number | null {
  if (value === null || value === undefined) return null

  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Carga utilizada invalida')
  }

  return Math.round(value * 100) / 100
}

function normalizeOptionalExerciseNotes(value?: string): string | null {
  if (!value) return null

  const normalized = value.trim()
  if (!normalized) return null

  if (normalized.length > 600) {
    throw new Error('Observacao do exercicio muito longa')
  }

  return normalized
}

export async function completeWorkoutSession(
  userId: string,
  input: CompleteWorkoutSessionInput
): Promise<WorkoutSessionDTO> {
  await ensureWorkoutDayOwnership(userId, input.planId, input.workoutDayId)

  if (input.exercises.length === 0) {
    throw new Error('Informe os exercicios realizados')
  }

  const plannedExercises = await workoutDayExerciseDelegate(prisma).findMany({
    where: { workoutDayId: input.workoutDayId },
    select: { id: true, exerciseId: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })

  if (plannedExercises.length === 0) {
    throw new Error('Este treino nao possui exercicios')
  }

  const allowedExerciseIds = new Set(plannedExercises.map((item) => item.exerciseId))

  const normalizedExercises = input.exercises.map((item) => {
    if (!item.exerciseId || !allowedExerciseIds.has(item.exerciseId)) {
      throw new Error('Exercicio invalido para este treino')
    }

    return {
      exerciseId: item.exerciseId,
      setsDone: normalizeOptionalSetsDone(item.setsDone),
      repsDone: normalizeOptionalRepsDone(item.repsDone),
      weightUsed: normalizeOptionalWeightUsed(item.weightUsed),
      completed: Boolean(item.completed),
      notes: normalizeOptionalExerciseNotes(item.notes),
    }
  })

  const date = normalizeSessionDate(input.date)
  const dayNotes = normalizeDayNotes(input.dayNotes)

  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await workoutSessionDelegate(tx).create({
      data: {
        userId,
        planId: input.planId,
        workoutDayId: input.workoutDayId,
        date,
        completed: true,
        dayNotes,
      },
    })

    await workoutSessionExerciseDelegate(tx).createMany({
      data: normalizedExercises.map((item) => ({
        workoutSessionId: createdSession.id,
        exerciseId: item.exerciseId,
        setsDone: item.setsDone,
        repsDone: item.repsDone,
        weightUsed: item.weightUsed,
        completed: item.completed,
        notes: item.notes,
      })),
    })

    return createdSession
  })

  const sessionExercises = await workoutSessionExerciseDelegate(prisma).findMany({
    where: { workoutSessionId: session.id },
    orderBy: [{ createdAt: 'asc' }],
  })

  return toWorkoutSessionDTO(session, sessionExercises)
}
