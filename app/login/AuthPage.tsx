'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/i18n'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const { t, resolvedTheme } = useApp()
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
    <div className="flex min-h-screen items-center justify-center p-6 transition-colors duration-300 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md space-y-8 animate-auth-fade">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-surface-900 dark:text-surface-100">Flowly</h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="card px-8 py-8 space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
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
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
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
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
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
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
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

        {/* Footer link */}
        <p className="text-center text-sm text-surface-500 dark:text-surface-400">
          {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
          <Link
            href={mode === 'login' ? '/register' : '/login'}
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            {mode === 'login' ? t('common.signUp') : t('common.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
