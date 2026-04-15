import type { Metadata } from 'next'
import AuthPage from '@/app/login/AuthPage'

export const metadata: Metadata = {
  title: 'Criar conta',
}

export default function RegisterPage() {
  return <AuthPage mode="register" />
}
