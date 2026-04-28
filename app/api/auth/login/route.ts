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
    
    // ── Check account status before setting session ──────────────────────
    const isPaidActive = result.user.subscriptionStatus === 'ACTIVE'
    const isPrivileged = result.user.role === 'ADMIN' || result.user.role === 'COURTESY' || result.user.role === 'LEGACY'
    
    console.log('[Auth/Login] User authentication:', {
      email: result.user.email,
      subscriptionStatus: result.user.subscriptionStatus,
      role: result.user.role,
      isPaidActive,
      isPrivileged,
      canAccess: isPaidActive || isPrivileged,
    })
    
    // Block inactive unpaid users from accessing the app
    if (!isPaidActive && !isPrivileged) {
      console.log(`[Auth/Login] User ${result.user.email} is INACTIVE and not privileged - blocking access`)
      return NextResponse.json(
        {
          success: false,
          error: 'Sua conta está inativa. Finalize o pagamento para liberar seu acesso.',
          status: 'inactive',
          user: result.user, // Return user info so frontend can show unlock screen
        },
        { status: 200 }, // 200 so frontend treats this as expected flow, not network error
      )
    }

    // User is active or privileged - set session
    console.log(`[Auth/Login] User ${result.user.email} granted access (ACTIVE: ${isPaidActive}, Privileged: ${isPrivileged})`)
    await setSession({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      subscriptionStatus: result.user.subscriptionStatus,
      hasWorkoutModule: result.user.hasWorkoutModule,
      role: result.user.role,
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
