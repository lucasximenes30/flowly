'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function ensureAdmin() {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') {
    throw new Error('Unauthorized access')
  }
}

export async function changeUserAccess(userId: string, type: 'FREE' | 'VIP' | 'COURTESY') {
  await ensureAdmin()

  let data: any = {}

  switch (type) {
    case 'FREE':
      data = { plan: 'FREE', role: 'USER' }
      break
    case 'VIP':
      data = { plan: 'PRO', role: 'USER' }
      break
    case 'COURTESY':
      data = { plan: 'PRO', role: 'COURTESY' }
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
