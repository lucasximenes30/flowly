import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { hash } from 'bcryptjs'
import { SALT_ROUNDS } from '@/lib/constants'

// Create a new user manually
export async function createUserAdmin(data: { name: string; email: string; phone?: string | null }) {
  const charset = '0123456789'
  let rawPassword = ''
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    rawPassword += charset[randomIndex]
  }

  const hashedPassword = await hash(rawPassword, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: 'COURTESY',
      plan: 'FREE',
      subscriptionStatus: 'ACTIVE',
      forcePasswordChange: true,
      phone: data.phone,
    },
  })

  return { user, rawPassword }
}

// Update user manually
export async function updateUserAdmin(id: string, data: { name: string; email: string; phone?: string | null }) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
    },
  })
  return user
}

// Delete user manually
export async function deleteUserAdmin(id: string) {
  await prisma.user.delete({
    where: { id },
  })
}

// Reset password manually
export async function resetUserPasswordAdmin(id: string) {
  const charset = '0123456789'
  let rawPassword = ''
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    rawPassword += charset[randomIndex]
  }

  const hashedPassword = await hash(rawPassword, SALT_ROUNDS)

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      forcePasswordChange: true,
    },
  })

  return rawPassword
}

// Get full user details for admin modal
export const getUserDetails = cache(async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      plan: true,
      subscriptionStatus: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      subscriptionExpiresAt: true,
      billingApprovedAt: true,
      billingProvider: true,
      createdAt: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          provider: true,
          providerTransactionId: true,
          amount: true,
          paymentMethod: true,
          status: true,
          paidAt: true,
          expiresAt: true,
          createdAt: true,
        },
      },
    },
  })
})

