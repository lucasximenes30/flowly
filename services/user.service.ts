'use server'

import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { SALT_ROUNDS } from '@/lib/constants'
import { signToken, JWTPayload } from '@/lib/auth'

export interface RegisterInput {
  name: string
  email: string
  password: string
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
      },
    })

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    }

    const token = await signToken(payload)

    return { user: { id: user.id, name: user.name, email: user.email }, token }
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
  }

  const token = await signToken(payload)

  return { user: { id: user.id, name: user.name, email: user.email }, token }
}
