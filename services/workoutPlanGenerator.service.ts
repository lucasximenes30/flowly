import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { AIServiceError, generateAIText } from '@/services/ai.service'

export type WorkoutObjective =
  | 'muscle_gain'
  | 'fat_loss'
  | 'strength'
  | 'endurance'
  | 'general_fitness'
export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced'
export type UserSex = 'MALE' | 'FEMALE' | 'PREFER_NOT_SAY' | null

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

const MUSCLE_GROUP_VALUES: ExerciseMuscleGroup[] = [
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'ABS',
  'GLUTES',
  'CARDIO',
  'FULL_BODY',
  'OTHER',
]

const generatedExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1).max(30),
  targetWeight: z.string().max(40).optional(),
  notes: z.string().max(400).optional(),
  muscleGroup: z.enum(MUSCLE_GROUP_VALUES),
})

const generatedWorkoutDaySchema = z.object({
  name: z.string().min(1).max(120),
  exercises: z.array(generatedExerciseSchema).min(1).max(30),
})

const generatedWorkoutPlanSchema = z.object({
  planName: z.string().min(1).max(120),
  days: z.array(generatedWorkoutDaySchema).min(1).max(7),
})

export interface GenerateWorkoutPlanInput {
  objective: WorkoutObjective
  level: WorkoutLevel
  daysPerWeek: number
  focus: string
  sex?: UserSex
  language: 'pt-BR' | 'en'
}

export interface GeneratedExercise {
  name: string
  sets: number
  reps: string
  targetWeight?: string
  notes?: string
  muscleGroup: ExerciseMuscleGroup
}

export interface GeneratedWorkoutDay {
  name: string
  exercises: GeneratedExercise[]
}

export interface GeneratedWorkoutPlan {
  planName: string
  days: GeneratedWorkoutDay[]
}

export class WorkoutGenerationError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 503) {
    super(message)
    this.name = 'WorkoutGenerationError'
    this.statusCode = statusCode
  }
}

function extractJSONObject(text: string): string {
  const trimmed = text.trim()

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed
  }

  const withoutMarkdown = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  const start = withoutMarkdown.indexOf('{')
  const end = withoutMarkdown.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return withoutMarkdown.slice(start, end + 1)
  }

  return withoutMarkdown
}

function parseTargetWeight(weight: string | undefined): number | null {
  if (!weight) return null

  const match = weight.replace(',', '.').match(/\d+(\.\d+)?/)
  if (!match) return null

  const parsed = Number(match[0])
  if (!Number.isFinite(parsed) || parsed < 0) return null

  return Math.round(parsed * 100) / 100
}

function mapObjectiveText(objective: WorkoutObjective, language: 'pt-BR' | 'en'): string {
  const isBRL = language === 'pt-BR'
  if (objective === 'muscle_gain') return isBRL ? 'ganho de massa muscular' : 'muscle gain / hypertrophy'
  if (objective === 'fat_loss') return isBRL ? 'perda de gordura / definição' : 'fat loss / definition'
  if (objective === 'strength') return isBRL ? 'ganho de força' : 'strength gain'
  if (objective === 'endurance') return isBRL ? 'resistência cardiovascular' : 'cardiovascular endurance'
  return isBRL ? 'condicionamento geral' : 'general fitness'
}

function mapLevelText(level: WorkoutLevel, language: 'pt-BR' | 'en'): string {
  const isBRL = language === 'pt-BR'
  if (level === 'beginner') return isBRL ? 'iniciante' : 'beginner'
  if (level === 'intermediate') return isBRL ? 'intermediário' : 'intermediate'
  return isBRL ? 'avançado' : 'advanced'
}

function mapSexContext(sex: UserSex, language: 'pt-BR' | 'en'): string {
  const isBRL = language === 'pt-BR'
  if (sex === 'MALE') return isBRL ? 'usuário homem' : 'male user'
  if (sex === 'FEMALE') return isBRL ? 'usuária mulher' : 'female user'
  if (sex === 'PREFER_NOT_SAY') {
    return isBRL ? 'usuário prefere não informar o sexo' : 'user prefers not to say sex'
  }
  return isBRL ? 'sexo não informado' : 'sex not informed'
}

function buildWorkoutPrompt(input: GenerateWorkoutPlanInput): string {
  const isBRL = input.language === 'pt-BR'
  const objectiveText = mapObjectiveText(input.objective, input.language)
  const levelText = mapLevelText(input.level, input.language)
  const sexContext = mapSexContext(input.sex ?? null, input.language)

  return `You are an expert fitness trainer creating a personalized workout plan.

USER PROFILE:
- Objective: ${objectiveText}
- Experience level: ${levelText}
- Days per week available: ${input.daysPerWeek}
- Focus areas: ${input.focus}
- Additional context (sex): ${sexContext}

STRICT RULES:
1. PRIMARY (absolute): objective, level, days per week, and focus must drive the plan.
2. CONTEXTUAL (secondary): sex can only be used as a subtle context signal when useful. Never produce stereotyped plans.
3. Do not override the user's goal because of sex.
4. Generate exactly ${input.daysPerWeek} workout days.
5. Keep volume and intensity aligned with level.
6. Output language: ${isBRL ? 'Brazilian Portuguese' : 'English'}.

Return ONLY valid JSON (no markdown/code block), with this structure:
{
  "planName": "string",
  "days": [
    {
      "name": "string",
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string",
          "targetWeight": "optional string",
          "notes": "optional string",
          "muscleGroup": "CHEST|BACK|LEGS|SHOULDERS|BICEPS|TRICEPS|ABS|GLUTES|CARDIO|FULL_BODY|OTHER"
        }
      ]
    }
  ]
}`
}

async function generateWorkoutPlan(input: GenerateWorkoutPlanInput): Promise<GeneratedWorkoutPlan> {
  const prompt = buildWorkoutPrompt(input)

  try {
    const response = await generateAIText({
      purpose: 'workout',
      prompt,
      temperature: 0.7,
    })

    const jsonText = extractJSONObject(response.text)
    const parsed = JSON.parse(jsonText)
    const validated = generatedWorkoutPlanSchema.parse(parsed)

    return {
      planName: validated.planName,
      days: validated.days,
    }
  } catch (error: unknown) {
    const isBRL = input.language === 'pt-BR'

    if (error instanceof AIServiceError) {
      throw new WorkoutGenerationError(
        isBRL
          ? 'A geração de treino está temporariamente indisponível. Tente novamente em instantes.'
          : 'Workout generation is temporarily unavailable. Please try again shortly.',
        503
      )
    }

    console.error('[Workout AI] Invalid model response', {
      message: error instanceof Error ? error.message : String(error),
    })

    throw new WorkoutGenerationError(
      isBRL
        ? 'Não foi possível processar a resposta de geração de treino. Tente novamente em instantes.'
        : 'Could not process workout generation response. Please try again shortly.',
      503
    )
  }
}

export async function generateAndCreateWorkoutPlan(
  userId: string,
  input: GenerateWorkoutPlanInput
): Promise<{ planId: string; planName: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sex: true },
  })

  const sexToUse = input.sex ?? user?.sex ?? null

  const generatedPlan = await generateWorkoutPlan({
    ...input,
    sex: sexToUse as UserSex,
  })

  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId,
      name: generatedPlan.planName,
      isActive: true,
    },
  })

  await prisma.workoutPlan.updateMany({
    where: { userId, isActive: true, id: { not: workoutPlan.id } },
    data: { isActive: false },
  })

  for (let dayIndex = 0; dayIndex < generatedPlan.days.length; dayIndex++) {
    const dayData = generatedPlan.days[dayIndex]

    const workoutDay = await prisma.workoutDay.create({
      data: {
        planId: workoutPlan.id,
        name: dayData.name,
        order: dayIndex + 1,
        weekDay: null,
      },
    })

    for (let exerciseIndex = 0; exerciseIndex < dayData.exercises.length; exerciseIndex++) {
      const exerciseData = dayData.exercises[exerciseIndex]

      let exercise = await prisma.exercise.findFirst({
        where: {
          AND: [
            {
              OR: [
                { namePt: exerciseData.name },
                { nameEn: exerciseData.name },
              ],
            },
            { isSystem: true },
          ],
        },
      })

      if (!exercise) {
        exercise = await prisma.exercise.create({
          data: {
            namePt: exerciseData.name,
            nameEn: exerciseData.name,
            muscleGroup: exerciseData.muscleGroup,
            isSystem: true,
            source: 'SYSTEM',
          },
        })
      }

      await prisma.workoutDayExercise.create({
        data: {
          workoutDayId: workoutDay.id,
          exerciseId: exercise.id,
          order: exerciseIndex + 1,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          targetWeight: parseTargetWeight(exerciseData.targetWeight),
          notes: exerciseData.notes || null,
        },
      })
    }
  }

  return {
    planId: workoutPlan.id,
    planName: workoutPlan.name,
  }
}