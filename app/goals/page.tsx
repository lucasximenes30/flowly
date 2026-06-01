import { Metadata } from 'next'
import GoalsClient from './GoalsClient'

export const metadata: Metadata = {
  title: 'Metas Financeiras | Vynta',
  description: 'Acompanhe e alcance seus objetivos financeiros.',
}

export default function GoalsPage() {
  return <GoalsClient />
}
