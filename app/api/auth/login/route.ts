import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { loginUser } from '@/services/user.service'
import { setSession } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const result = await loginUser({ email, password })
    await setSession({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      subscriptionStatus: result.user.subscriptionStatus,
      hasWorkoutModule: result.user.hasWorkoutModule,
    })

    return NextResponse.json({ success: true, user: result.user })
  } catch (error: any) {
    const message = error instanceof z.ZodError
      ? error.errors[0]?.message ?? 'Invalid input'
      : error.message ?? 'Something went wrong'

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    )
  }
}
