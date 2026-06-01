import { Metadata } from 'next'
import CalendarClient from './CalendarClient'

export const metadata: Metadata = {
  title: 'Agenda | Vynta',
  description: 'Organize seus eventos e rotina no Vynta.',
}

export default function CalendarPage() {
  return <CalendarClient />
}
