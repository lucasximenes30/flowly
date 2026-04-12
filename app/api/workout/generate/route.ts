import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { generateAndCreateWorkoutPlan, WorkoutGenerationError } from '@/services/workoutPlanGenerator.service'

const generateWorkoutPlanSchema = z.object({
  objective: z.enum(['muscle_gain', 'fat_loss', 'strength', 'endurance', 'general_fitness']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().int().min(1).max(7),
  focus: z.string().min(1).max(500),
  language: z.enum(['pt-BR', 'en']),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let language: 'pt-BR' | 'en' = 'pt-BR'

  try {
    const body = await request.json()
    const data = generateWorkoutPlanSchema.parse(body)
    language = data.language

    const result = await generateAndCreateWorkoutPlan(session.userId, {
      ...data,
      sex: undefined, // Will be fetched from user profile
    })

    return NextResponse.json({ plan: result }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message ?? (language === 'pt-BR' ? 'Dados inválidos' : 'Invalid data')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (error instanceof WorkoutGenerationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    if (error instanceof Error) {
      console.error('[Workout API] Unexpected generation error', error)
      return NextResponse.json(
        {
          error:
            language === 'pt-BR'
              ? 'Não foi possível concluir a geração do treino agora. Tente novamente em instantes.'
              : 'Could not complete workout generation right now. Please try again shortly.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error:
          language === 'pt-BR'
            ? 'Não foi possível concluir a geração do treino agora. Tente novamente em instantes.'
            : 'Could not complete workout generation right now. Please try again shortly.',
      },
      { status: 500 }
    )
  }
}
