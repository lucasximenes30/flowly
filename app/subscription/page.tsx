import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import SubscriptionClient from './SubscriptionClient'

export default async function SubscriptionPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Se já for PRO ou ADMIN, não precisa de upgrade, redireciona pro dashboard
  if (session.plan === 'PRO' || session.role === 'ADMIN' || session.role === 'COURTESY') {
    redirect('/dashboard')
  }

  return <SubscriptionClient session={session} />
}
