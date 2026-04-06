'use client'

import Link from 'next/link'
import { useApp } from '@/lib/i18n'

export default function Home() {
  const { resolvedTheme } = useApp()

  return (
    <div className="flex min-h-screen items-center justify-center p-6 transition-colors duration-300 bg-brand-50 dark:bg-surface-950">
      <div className="w-full max-w-xl text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight text-surface-900 dark:text-surface-100">Flowly</h1>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            Gestão financeira pessoal, de um jeito simples e bonito.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="btn-primary px-8 py-3 text-base">
            Entrar
          </Link>
          <Link href="/register" className="btn-secondary px-8 py-3 text-base">
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  )
}
