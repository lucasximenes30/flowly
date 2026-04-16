'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/i18n'
import BrandLogo from '@/components/BrandLogo'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const { t } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email, password } : { name, email, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Algo deu errado')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-y-auto bg-surface-950 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,88,249,0.26),transparent_45%),radial-gradient(circle_at_bottom,rgba(17,31,171,0.2),transparent_36%)]" />

      <div className="relative w-full max-w-md space-y-6 animate-auth-fade">
        <div className="text-center">
          <BrandLogo
            size="lg"
            className="justify-center"
            textClassName="font-display text-3xl text-white"
            priority
          />
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Comece com tranquilidade'}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[1.03rem] leading-relaxed text-surface-200 sm:text-lg">
            Organize sua vida com clareza, consistência e controle.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card space-y-5 border-surface-700/70 bg-surface-900/85 px-5 py-6 shadow-elevated backdrop-blur sm:px-8 sm:py-8"
        >
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-surface-200">
                {t('common.name')}
              </label>
              <input
                id="name"
                type="text"
                required
                className="input-field"
                placeholder={t('auth.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-surface-200">
              {t('common.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-surface-200">
              {t('common.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-900/40 bg-red-900/20 p-3 text-sm text-red-300">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary h-11 w-full text-sm font-semibold">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'login' ? t('auth.signingIn') : t('auth.creatingAccount')}
              </span>
            ) : (
              mode === 'login' ? t('common.signIn') : t('common.signUp')
            )}
          </button>
        </form>

        {mode === 'register' && (
          <p className="text-center text-sm text-surface-300">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-brand-300 transition-colors hover:text-brand-200"
            >
              Entrar
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
