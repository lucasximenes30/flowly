import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserTable from './UserTable'
import * as Lucide from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const session = await requireAuth().catch(() => null)
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams?.search || ''

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      role: true,
      subscriptionStatus: true,
      createdAt: true,
    },
  })

  // Provide fallback phone logic - UI will simply show 'Não informado'
  const formattedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
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

      <UserTable initialUsers={formattedUsers} initialSearch={search} />
    </div>
  )
}
