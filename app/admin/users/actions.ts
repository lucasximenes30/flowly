'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import { SALT_ROUNDS } from '@/lib/constants'

async function ensureAdmin() {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') {
    throw new Error('Unauthorized access')
  }
}

export async function changeUserAccess(userId: string, type: 'ADMIN' | 'COURTESY' | 'VIP') {
  await ensureAdmin()

  let data: any = {}

  switch (type) {
    case 'ADMIN':
      data = { plan: 'PRO', role: 'ADMIN' }
      break
    case 'COURTESY':
      data = { plan: 'PRO', role: 'COURTESY' }
      break
    case 'VIP':
      data = { plan: 'PRO', role: 'USER' }
      break
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  })

  revalidatePath('/admin/users')
}

export async function changeUserStatus(userId: string, active: boolean) {
  await ensureAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: active ? 'ACTIVE' : 'INACTIVE',
    },
  })

  revalidatePath('/admin/users')
}

export async function generateTemporaryPassword(userId: string): Promise<string> {
  await ensureAdmin()

  // Generate an 8 character secure random string
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#'
  let tempPassword = ''
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    tempPassword += charset[randomIndex]
  }

  const hashedPassword = await hash(tempPassword, SALT_ROUNDS)

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  })

  return tempPassword
}

