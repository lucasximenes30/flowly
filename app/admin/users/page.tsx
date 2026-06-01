import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserTable from './UserTable'
import * as Lucide from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; plan?: string; status?: string }>
}) {
  const session = await requireAuth().catch(() => null)
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams?.search || ''
  const plan = resolvedSearchParams?.plan || 'all'
  const status = resolvedSearchParams?.status || 'all'

  const whereClause: any = {}

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status !== 'all') {
    if (status === 'ACTIVE') whereClause.subscriptionStatus = 'ACTIVE'
    else if (status === 'INACTIVE') whereClause.subscriptionStatus = 'INACTIVE'
    else if (status === 'PENDING') whereClause.subscriptionStatus = 'PENDING'
  }

  if (plan !== 'all') {
    if (plan === 'VIP') {
      whereClause.plan = 'VIP'
    } else if (plan === 'PRO') {
      whereClause.plan = 'PRO'
    } else if (plan === 'COURTESY') {
      whereClause.plan = 'COURTESY'
    } else if (plan === 'ADMIN') {
      whereClause.plan = 'ADMIN'
    } else if (plan === 'FREE_TRIAL') {
      whereClause.plan = 'FREE_TRIAL'
    } else if (plan === 'FREE') {
      whereClause.plan = 'FREE'
    }
  }

  // Analytics queries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const startOfDayAfterTomorrow = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000);

  const [
    activeVip,
    activePro,
    courtesyUsers,
    freeTrialUsers,
    pendingUsers,
    expiredUsers, // Simplified: Users with INACTIVE or PAST_DUE and plan not Admin/Courtesy
  ] = await Promise.all([
    prisma.user.count({ where: { plan: 'VIP', subscriptionStatus: 'ACTIVE' } }),
    prisma.user.count({ where: { plan: 'PRO', subscriptionStatus: 'ACTIVE' } }),
    prisma.user.count({ where: { plan: 'COURTESY' } }),
    prisma.user.count({ where: { plan: 'FREE_TRIAL' } }),
    prisma.user.count({ where: { subscriptionStatus: 'PENDING' } }),
    prisma.user.count({ where: { subscriptionStatus: { in: ['INACTIVE', 'PAST_DUE'] }, plan: { notIn: ['ADMIN', 'COURTESY'] } } }),
  ]);

  // Free Trial Specific Analytics
  const allFreeTrials = await prisma.user.findMany({
    where: { plan: 'FREE_TRIAL' },
    select: { createdAt: true }
  });

  let trialActive = 0;
  let trialExpiringToday = 0;
  let trialExpiringTomorrow = 0;
  let trialExpired = 0;

  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  allFreeTrials.forEach(u => {
    const expiresAt = new Date(u.createdAt.getTime() + threeDaysMs);
    if (expiresAt < now) {
      trialExpired++;
    } else {
      trialActive++;
      if (expiresAt >= startOfToday && expiresAt < startOfTomorrow) {
        trialExpiringToday++;
      } else if (expiresAt >= startOfTomorrow && expiresAt < startOfDayAfterTomorrow) {
        trialExpiringTomorrow++;
      }
    }
  });

  const users = await prisma.user.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      role: true,
      subscriptionStatus: true,
      createdAt: true,
      phone: true,
      subscriptionExpiresAt: true,
      subscriptionEndDate: true,
    },
  })

  // Provide fallback phone logic - UI will simply show 'Não informado'
  const formattedUsers = users.map((user: any) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() || null,
    subscriptionEndDate: user.subscriptionEndDate?.toISOString() || null,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-surface-900 dark:text-white">
            Usuários
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Gerencie acessos e contas de usuários.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300">
            Total: {users.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-1">VIP Ativos</span>
          <span className="text-2xl font-bold text-brand-500">{activeVip}</span>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-1">PRO Ativos</span>
          <span className="text-2xl font-bold text-purple-500">{activePro}</span>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-1">Courtesy</span>
          <span className="text-2xl font-bold text-emerald-500">{courtesyUsers}</span>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-1">Testes Ativos</span>
          <span className="text-2xl font-bold text-blue-500">{trialActive}</span>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-1">Expirados</span>
          <span className="text-2xl font-bold text-red-500">{expiredUsers + trialExpired}</span>
        </div>
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-surface-500 font-medium uppercase tracking-wider mb-1">Pendentes</span>
          <span className="text-2xl font-bold text-amber-500">{pendingUsers}</span>
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Testes Grátis (Free Trial)</h3>
          <p className="text-xs text-blue-700 dark:text-blue-400/80 mt-1">Acompanhamento do funil de testes de 3 dias.</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">{trialExpiringToday}</span>
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-blue-800/60 dark:text-blue-400/60">Expiram Hoje</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">{trialExpiringTomorrow}</span>
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-blue-800/60 dark:text-blue-400/60">Expiram Amanhã</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold text-red-500 dark:text-red-400">{trialExpired}</span>
            <span className="text-[0.65rem] uppercase tracking-wider font-semibold text-red-800/60 dark:text-red-400/60">Já Expirados</span>
          </div>
        </div>
      </div>

      <UserTable initialUsers={formattedUsers} initialSearch={search} initialPlan={plan} initialStatus={status} />
    </div>
  )
}
