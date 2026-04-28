'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/lib/i18n'
import BrandLogo from '@/components/BrandLogo'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [document, setDocument] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')
  
  // Track if user is currently on the inactive screen
  const [isInactive, setIsInactive] = useState(searchParams.get('error') === 'inactive')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password, document: document.replace(/\D/g, '') }

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

      // ── Check if login returned inactive status ───────────────────────
      if (data.status === 'inactive') {
        console.log('[Auth] User is inactive - showing unlock screen')
        setIsInactive(true)
        setPaymentData(null) // Reset payment data
        return
      }

      // ── User is active - proceed to dashboard ──────────────────────────
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlockAccess = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create', { method: 'POST' })
      const data = await res.json()
      
      console.log('[Auth/Unlock] Payment creation response:', {
        ok: data.ok,
        status: data.status,
        hasRedirectUrl: !!data.redirectUrl,
        hasPixData: !!data.pix,
        pixQrcodeExists: !!data.pix?.qrcode,
        pixCopyPasteExists: !!data.pix?.copyPaste,
      })

      if (!data.ok || data.error) {
        setError(data.error || 'Erro ao gerar pagamento')
        return
      }

      // If BlackPayments returned a redirect URL (non-Pix), redirect user
      if (data.redirectUrl) {
        console.log('[Auth/Unlock] Redirecting to payment URL')
        window.location.href = data.redirectUrl
        return
      }

      // Check if we have Pix data
      if (!data.pix || !data.pix.qrcode) {
        console.error('[Auth/Unlock] Payment created but no Pix data received:', data)
        setError('Erro ao processar pagamento PIX. Tente novamente.')
        return
      }

      // Display Pix payment data
      console.log('[Auth/Unlock] Displaying Pix data')
      setPaymentData(data)
    } catch (err) {
      console.error('[Auth/Unlock] Error:', err)
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckPaymentStatus = async () => {
    setCheckingPayment(true)
    setPaymentMessage('')
    try {
      const res = await fetch('/api/subscription/status', { method: 'POST' })
      const data = await res.json()
      
      console.log('[Auth/CheckPayment] Status response:', data)

      if (data.status === 'approved') {
        // Payment approved! User should now be ACTIVE
        setPaymentMessage('✓ Pagamento confirmado! Redirecionando...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
        return
      }

      if (data.status === 'pending') {
        setPaymentMessage('⏳ Pagamento ainda não confirmado. Tente novamente em alguns instantes.')
        return
      }

      if (data.ok === false) {
        setPaymentMessage(data.message || 'Erro ao verificar pagamento.')
        return
      }

      setPaymentMessage(data.message || 'Status desconhecido.')
    } catch (err) {
      console.error('[Auth/CheckPayment] Error:', err)
      setPaymentMessage('Erro ao verificar. Tente novamente.')
    } finally {
      setCheckingPayment(false)
    }
  }

  // ── Show inactive/unlock screen ──────────────────────────────────────
  if (isInactive) {
    const hasPixData = paymentData?.pix?.qrcode

    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-y-auto bg-surface-950 px-4 py-8 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,88,249,0.26),transparent_45%),radial-gradient(circle_at_bottom,rgba(17,31,171,0.2),transparent_36%)]" />

        <div className="relative w-full max-w-md space-y-6 animate-auth-fade text-center">
          <BrandLogo
            size="lg"
            className="justify-center"
            textClassName="font-display text-3xl text-white"
            priority
          />
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {hasPixData ? 'Pagamento PIX' : 'Acesso Bloqueado'}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[1.03rem] leading-relaxed text-surface-200 sm:text-lg">
            {hasPixData
              ? 'Complete o pagamento via PIX para desbloquear seu acesso'
              : 'Sua conta está inativa. Você precisa de uma assinatura ativa para acessar o sistema.'}
          </p>

          <div className="card space-y-5 border-surface-700/70 bg-surface-900/85 px-5 py-6 shadow-elevated backdrop-blur sm:px-8 sm:py-8 mt-6">
            {error && (
              <p className="rounded-xl border border-red-900/40 bg-red-900/20 p-3 text-sm text-red-300 mb-4">{error}</p>
            )}

            {hasPixData ? (
              <div className="space-y-6">
                {/* Status message */}
                <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                  <p className="text-sm font-medium text-amber-100">Aguardando pagamento...</p>
                </div>

                {/* QR Code */}
                <div>
                  <p className="text-sm font-medium text-surface-200 mb-3">Escaneie o QR Code:</p>
                  <div className="flex justify-center">
                    {typeof paymentData.pix.qrcode === 'string' && paymentData.pix.qrcode.startsWith('data:image') ? (
                      <img src={paymentData.pix.qrcode} alt="PIX QR Code" className="w-56 h-56 rounded-xl border-2 border-surface-700" />
                    ) : (
                      <div className="w-56 h-56 rounded-xl border-2 border-surface-700 bg-surface-800 flex items-center justify-center text-surface-400 text-sm">
                        QR Code não disponível
                      </div>
                    )}
                  </div>
                </div>

                {/* Copy-paste code */}
                {paymentData.pix.copyPaste && (
                  <div>
                    <p className="text-xs font-medium text-surface-400 mb-2">Ou copie e cole o código PIX:</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.pix.copyPaste)
                        alert('Código copiado para a área de transferência!')
                      }}
                      className="w-full p-3 bg-surface-800 hover:bg-surface-700 text-surface-100 text-xs rounded-lg font-mono break-all transition-colors text-left"
                      title="Clique para copiar"
                    >
                      {paymentData.pix.copyPaste}
                    </button>
                  </div>
                )}

                {/* Expiration date */}
                {paymentData.pix.expirationDate && (
                  <div className="text-xs text-surface-400">
                    Válido até: <span className="font-medium text-surface-200">{paymentData.pix.expirationDate}</span>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-surface-800/50 rounded-lg p-4 text-left">
                  <p className="text-xs text-surface-300 leading-relaxed">
                    ✓ Abra seu aplicativo de banco<br />
                    ✓ Escolha a opção PIX Copia e Cola ou escaneie o QR Code<br />
                    ✓ Confirme a transação<br />
                    ✓ Seu acesso será liberado automaticamente após a confirmação
                  </p>
                </div>

                {/* Refresh button */}
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={checkingPayment}
                  className="btn-primary h-11 w-full text-sm font-semibold"
                >
                  {checkingPayment ? 'Verificando...' : 'Já realizei o pagamento'}
                </button>

                {/* Payment check message */}
                {paymentMessage && (
                  <p className={`text-xs text-center p-2 rounded-lg ${
                    paymentMessage.includes('✓') 
                      ? 'bg-emerald-500/10 text-emerald-300' 
                      : paymentMessage.includes('⏳')
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-red-500/10 text-red-300'
                  }`}>
                    {paymentMessage}
                  </p>
                )}
              </div>
            ) : (
              <button onClick={handleUnlockAccess} disabled={loading} className="btn-primary h-11 w-full text-sm font-semibold">
                {loading ? 'Gerando pagamento...' : 'Desbloquear acesso'}
              </button>
            )}

            <div className="pt-4 border-t border-surface-700/50">
              <button
                onClick={() => setIsInactive(false)}
                className="text-sm font-medium text-surface-400 hover:text-white transition-colors w-full text-center"
              >
                Fazer login com outra conta
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
            <>
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
              <div className="space-y-1.5">
                <label htmlFor="document" className="block text-sm font-medium text-surface-200">
                  CPF
                </label>
                <input
                  id="document"
                  type="text"
                  required
                  inputMode="numeric"
                  className="input-field"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={document}
                  onChange={(e) => {
                    // Auto-format: 000.000.000-00
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
                    const fmt = digits
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                    setDocument(fmt)
                  }}
                />
              </div>
            </>
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-surface-200">
                {t('common.password')}
              </label>
              {mode === 'login' && (
                <Link href="/esqueci-a-senha" className="text-sm font-medium text-brand-300 hover:text-brand-200 transition-colors">
                  Esqueceu a senha?
                </Link>
              )}
            </div>
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

        {/* Form bottom links */}
        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-[1.03rem] text-surface-400">
              Ainda não tem acesso?{' '}
              <Link href="/register" className="font-semibold text-brand-300 hover:text-brand-200 transition-colors">
                Criar conta
              </Link>
            </p>
          ) : (
            <p className="text-[1.03rem] text-surface-400">
              Já possui acesso?{' '}
              <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200 transition-colors">
                Entrar
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
