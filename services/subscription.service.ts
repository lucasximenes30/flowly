import { PrismaClient, UserSubscriptionStatus, UserPlan } from '@prisma/client'

const prisma = new PrismaClient()

interface ActivateVipInput {
  userId: string
  transactionId?: string
}

/**
 * Shared helper to activate a user's VIP access.
 * Sets the user to ACTIVE, assigns PRO plan, and sets the subscription window to 30 days from now.
 */
export async function activateVipAccess({ userId, transactionId }: ActivateVipInput) {
  const now = new Date()
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days

  const updateData: any = {
    subscriptionStatus: UserSubscriptionStatus.ACTIVE,
    plan: UserPlan.PRO,
    billingProvider: 'blackpayments',
    billingApprovedAt: now,
    subscriptionStartDate: now,
    subscriptionEndDate: endDate,
  }

  if (transactionId) {
    updateData.caktoOrderId = transactionId
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  console.log(`[Subscription Service] User ${updatedUser.email} ACTIVATED: subscriptionStatus=ACTIVE, plan=PRO. Ends at ${endDate.toISOString()}`)
  return updatedUser
}
