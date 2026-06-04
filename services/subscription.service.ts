import { PrismaClient, UserSubscriptionStatus, UserPlan } from '@prisma/client'

const prisma = new PrismaClient()

interface ActivateVipInput {
  userId: string
  transactionId?: string
  planTier?: 'VIP' | 'PRO' | 'PRO_YEARLY'
  usedUpgradeOffer?: boolean
}

/**
 * Shared helper to activate a user's subscription.
 * Sets the user to ACTIVE, assigns the plan, and sets the subscription window to 30 days from now.
 */
export async function activateVipAccess({ userId, transactionId, planTier = 'PRO', usedUpgradeOffer }: ActivateVipInput) {
  const now = new Date()
  const daysToAdd = planTier === 'PRO_YEARLY' ? 365 : 30
  const endDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

  const isProTier = planTier === 'PRO' || planTier === 'PRO_YEARLY'

  const updateData: any = {
    subscriptionStatus: UserSubscriptionStatus.ACTIVE,
    plan: planTier,
    billingProvider: 'abacatepay',
    billingApprovedAt: now,
    subscriptionStartDate: now,
    subscriptionEndDate: endDate,
    canUseNotes: isProTier,
    canUseAgenda: isProTier,
    canUseGoals: isProTier,
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

  console.log(`[Subscription Service] User ${updatedUser.email} ACTIVATED: subscriptionStatus=ACTIVE, plan=${planTier}. Ends at ${endDate.toISOString()}`)
  return updatedUser
}
