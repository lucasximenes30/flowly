import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { registerUser } from '@/services/user.service'
import { setSession } from '@/lib/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  document: z.string().min(11, 'CPF inválido').max(14).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, document } = registerSchema.parse(body)

    const result = await registerUser({ name, email, password, document })
    
    // ── Check if user can access (same logic as login) ──────────────────
    const isPaidActive = result.user.subscriptionStatus === 'ACTIVE'
    const isPrivileged = result.user.role === 'ADMIN' || result.user.role === 'COURTESY'
    
    console.log('[Auth/Register] User registration:', {
      email: result.user.email,
      role: result.user.role,
      subscriptionStatus: result.user.subscriptionStatus,
      isPaidActive,
      isPrivileged,
      canAccess: isPaidActive || isPrivileged,
    })
    
    // ── IMPORTANT: Set session for all registered users (active AND inactive) ──
    // Inactive users need a valid session to call /api/payments/create
    // The middleware will block dashboard access based on subscriptionStatus
    // The frontend will redirect inactive users to the unlock screen
    console.log(`[Auth/Register] Setting session for new user ${result.user.email}`)
    await setSession({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      subscriptionStatus: result.user.subscriptionStatus,
      hasWorkoutModule: result.user.hasWorkoutModule,
      role: result.user.role,
      plan: result.user.plan,
      createdAt: result.user.createdAt ? new Date(result.user.createdAt).toISOString() : undefined,
      forcePasswordChange: result.user.forcePasswordChange,
      canUseFinance: result.user.canUseFinance,
      canUseHabits: result.user.canUseHabits,
      canUseWorkout: result.user.canUseWorkout,
      canUseGoals: result.user.canUseGoals,
      canUseNotes: result.user.canUseNotes,
      canUseAgenda: result.user.canUseAgenda,
    })

    // If user is inactive and not privileged, return inactive status
    // Frontend will redirect them to unlock screen instead of dashboard
    if (!isPaidActive && !isPrivileged) {
      console.log(`[Auth/Register] New user ${result.user.email} is INACTIVE - frontend will show unlock screen`)
      return NextResponse.json(
        {
          success: false,
          error: 'Sua conta foi criada! Agora você precisa fazer um pagamento para desbloquear o acesso.',
          status: 'inactive',
          user: result.user,
        },
        { status: 200 },
      )
    }

    // User has access (ACTIVE or privileged) - safe to redirect to dashboard
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
