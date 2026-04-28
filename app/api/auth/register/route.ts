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
    
    // If user is inactive and not privileged, do NOT set session
    // They must complete payment to access
    if (!isPaidActive && !isPrivileged) {
      console.log(`[Auth/Register] New user ${result.user.email} is INACTIVE - redirecting to unlock screen`)
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

    // User has access (ACTIVE or privileged) - set session
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
