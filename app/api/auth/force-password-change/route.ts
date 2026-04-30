import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, setSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { SALT_ROUNDS } from '@/lib/constants'
import { z } from 'zod'

const forcePasswordChangeSchema = z.object({
  newPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const { newPassword } = forcePasswordChangeSchema.parse(body)

    const hashedPassword = await hash(newPassword, SALT_ROUNDS)

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedPassword,
        forcePasswordChange: false,
      },
    })

    // Update the session to reflect forcePasswordChange is now false
    await setSession({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      subscriptionStatus: updatedUser.subscriptionStatus,
      hasWorkoutModule: updatedUser.hasWorkoutModule,
      role: updatedUser.role,
      forcePasswordChange: updatedUser.forcePasswordChange,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message = error instanceof z.ZodError
      ? error.errors[0]?.message ?? 'Invalid input'
      : error.message ?? 'Something went wrong'

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
