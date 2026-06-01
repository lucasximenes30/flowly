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
      whereClause.plan = 'PRO'
      whereClause.role = { notIn: ['ADMIN', 'COURTESY'] }
    } else if (plan === 'COURTESY') {
      whereClause.role = 'COURTESY'
    } else if (plan === 'ADMIN') {
      whereClause.role = 'ADMIN'
    } else if (plan === 'FREE') {
      whereClause.plan = 'FREE'
      whereClause.role = { notIn: ['ADMIN', 'COURTESY'] }
    }
  }

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

      <UserTable initialUsers={formattedUsers} initialSearch={search} initialPlan={plan} initialStatus={status} />
    </div>
  )
}
