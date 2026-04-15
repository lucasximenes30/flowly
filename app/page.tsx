'use client'

import Link from 'next/link'
import BrandLogo from '@/components/BrandLogo'

export default function Home() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-50 px-4 py-10 transition-colors duration-300 dark:bg-surface-950 sm:px-6">
      <div className="w-full max-w-2xl animate-auth-fade text-center">
        <div className="card space-y-7 sm:space-y-8">
          <BrandLogo size="lg" className="justify-center" textClassName="font-display text-2xl sm:text-3xl" priority />

          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold text-surface-900 dark:text-surface-100 sm:text-5xl">
              Vynta
            </h1>
            <p className="mx-auto max-w-xl text-[1.03rem] leading-relaxed text-surface-500 dark:text-surface-400 sm:text-xl">
              Organize sua vida com clareza, consistência e controle.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link href="/login" className="btn-primary w-full px-8 py-3 text-base sm:w-auto">
              Entrar
            </Link>
            <Link href="/register" className="btn-secondary w-full px-8 py-3 text-base sm:w-auto">
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
