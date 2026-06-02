import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UnlockClient from './UnlockClient'

export default async function UnlockPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { state } = await searchParams

  return <UnlockClient session={session} state={state} />
}
