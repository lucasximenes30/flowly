import { PrismaClient, UserSubscriptionStatus, UserPlan } from '@prisma/client'

const prisma = new PrismaClient()

interface ActivateVipInput {
  userId: string
  transactionId?: string
  planTier?: 'VIP' | 'PRO'
  usedUpgradeOffer?: boolean
}

/**
 * Shared helper to activate a user's subscription.
 * Sets the user to ACTIVE, assigns the plan, and sets the subscription window to 30 days from now.
 */
export async function activateVipAccess({ userId, transactionId, planTier = 'PRO', usedUpgradeOffer }: ActivateVipInput) {
  const now = new Date()
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days

  const updateData: any = {
    subscriptionStatus: UserSubscriptionStatus.ACTIVE,
    plan: planTier,
    billingProvider: 'abacatepay',
    billingApprovedAt: now,
    subscriptionStartDate: now,
    subscriptionEndDate: endDate,
    canUseNotes: planTier === 'PRO',
    canUseAgenda: planTier === 'PRO',
    canUseGoals: planTier === 'PRO',
  }

  if (usedUpgradeOffer !== undefined) {
    updateData.usedUpgradeOffer = usedUpgradeOffer;
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
