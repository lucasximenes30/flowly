import { Metadata } from 'next'
import NotesClient from './NotesClient'

export const metadata: Metadata = {
  title: 'Smart Notes | Vynta',
  description: 'Anotações rápidas e integradas ao seu ecosistema.',
}

export default function NotesPage() {
  return <NotesClient />
}
