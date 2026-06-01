import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = {
  title: 'Configurações',
}

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <SettingsClient session={session} />
  )
}
