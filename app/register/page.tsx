import type { Metadata } from 'next'
import AuthPage from '@/app/login/AuthPage'

import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Criar conta',
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="register" />
    </Suspense>
  )
}
