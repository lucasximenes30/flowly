import type { Metadata } from 'next'
import AuthPage from './AuthPage'

import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Entrar',
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="login" />
    </Suspense>
  )
}
