'use server'

import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { SALT_ROUNDS } from '@/lib/constants'
import { signToken, JWTPayload } from '@/lib/auth'

export interface RegisterInput {
  name: string
  email: string
  password: string
  document?: string
}

export interface LoginInput {
  email: string
  password: string
}

export async function registerUser(input: RegisterInput) {
  const hashedPassword = await hash(input.password, SALT_ROUNDS)

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashedPassword,
        document: input.document || null,
        plan: 'FREE_TRIAL',
        subscriptionStatus: 'ACTIVE',
      },
    })

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
      hasWorkoutModule: user.hasWorkoutModule,
      forcePasswordChange: user.forcePasswordChange,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt.toISOString(),
      canUseFinance: user.canUseFinance,
      canUseHabits: user.canUseHabits,
      canUseWorkout: user.canUseWorkout,
      canUseGoals: user.canUseGoals,
      canUseNotes: user.canUseNotes,
      canUseAgenda: user.canUseAgenda,
    }

    const token = await signToken(payload)

    return { user: { id: user.id, name: user.name, email: user.email, subscriptionStatus: user.subscriptionStatus, hasWorkoutModule: user.hasWorkoutModule, role: user.role, plan: user.plan, forcePasswordChange: user.forcePasswordChange, createdAt: user.createdAt, canUseFinance: user.canUseFinance, canUseHabits: user.canUseHabits, canUseWorkout: user.canUseWorkout, canUseGoals: user.canUseGoals, canUseNotes: user.canUseNotes, canUseAgenda: user.canUseAgenda }, token }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Email already registered')
    }
    throw error
  }
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  const validPassword = await compare(input.password, user.password)
  if (!validPassword) {
    throw new Error('Invalid email or password')
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    subscriptionStatus: user.subscriptionStatus,
    hasWorkoutModule: user.hasWorkoutModule,
    forcePasswordChange: user.forcePasswordChange,
    role: user.role,
    plan: user.plan,
    createdAt: user.createdAt.toISOString(),
    canUseFinance: user.canUseFinance,
    canUseHabits: user.canUseHabits,
    canUseWorkout: user.canUseWorkout,
    canUseGoals: user.canUseGoals,
    canUseNotes: user.canUseNotes,
    canUseAgenda: user.canUseAgenda,
  }

  const token = await signToken(payload)

  return { user: { id: user.id, name: user.name, email: user.email, subscriptionStatus: user.subscriptionStatus, hasWorkoutModule: user.hasWorkoutModule, role: user.role, plan: user.plan, forcePasswordChange: user.forcePasswordChange, createdAt: user.createdAt, canUseFinance: user.canUseFinance, canUseHabits: user.canUseHabits, canUseWorkout: user.canUseWorkout, canUseGoals: user.canUseGoals, canUseNotes: user.canUseNotes, canUseAgenda: user.canUseAgenda }, token }
}
