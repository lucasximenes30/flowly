'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'
import { QRCodeSVG } from 'qrcode.react'
import { trackFunnelEvent } from '@/lib/funnel'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [document, setDocument] = useState('')
  const planTier = searchParams.get('plan')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')
  
  const [copied, setCopied] = useState(false)

  // Track if user is currently on the inactive screen
  const [isInactive, setIsInactive] = useState(searchParams.get('error') === 'inactive')

  // Signup started tracking
  useEffect(() => {
    if (mode === 'register') {
      const storageKey = 'vynta_funnel_signup_started'
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'true')
        trackFunnelEvent('signup_started')
      }
    }
  }, [mode])

  // Redirect to plans if registering without a plan
  useEffect(() => {
    if (mode === 'register' && !planTier) {
      router.push('/#planos')
    }
  }, [mode, planTier, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password, document: document.replace(/\D/g, ''), planTier }

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

      if (mode === 'register') {
        trackFunnelEvent('signup_completed')
      }

      // ── Handle AbacatePay Redirect ──────────────────────────────────────
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
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
        paymentMethod: data.paymentMethod,
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

      // Check if we have Pix data defensively
      const isPix = data.paymentMethod === 'pix'
      const hasQrcode = !!data.pix?.qrcode
      const hasCopyPaste = !!data.pix?.copyPaste
      
      if (!isPix || !data.pix || (!hasQrcode && !hasCopyPaste)) {
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

      if (data.status === 'approved' || data.status === 'paid') {
        // Payment approved! User should now be ACTIVE
        setPaymentMessage('Pagamento confirmado! Liberando seu acesso...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
        return
      }

      if (data.status === 'pending') {
        setPaymentMessage('Pagamento ainda não confirmado. Aguarde alguns segundos e tente novamente.')
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

  const formatPixDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const d = new Date(dateString)
      // Check if valid date
      if (isNaN(d.getTime())) return dateString
      // Return dd/mm/yyyy
      return d.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const hasPixData = isInactive && paymentData?.paymentMethod === 'pix' && (paymentData?.pix?.qrcode || paymentData?.pix?.copyPaste)
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (hasPixData && !checkingPayment) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/subscription/status', { method: 'POST' })
          const data = await res.json()
          if (data.status === 'approved' || data.status === 'paid' || data.status === 'already_active') {
            setPaymentMessage('Pagamento confirmado! Liberando seu acesso...')
            clearInterval(intervalId)
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 2000)
          }
        } catch (err) {
          console.error('[Auth/AutoCheck] Error:', err)
        }
      }, 5000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [hasPixData, checkingPayment, router])

  // ── Under the hood check for inactive users ────────────────────────────
  useEffect(() => {
    // If user arrived at login with error=inactive, silently check if they paid
    if (searchParams.get('error') === 'inactive') {
      const checkUnderTheHood = async () => {
        try {
          const res = await fetch('/api/subscription/status', { method: 'POST' })
          const data = await res.json()
          // If the backend updated the session and returned already_active or approved
          if (data.status === 'approved' || data.status === 'already_active' || data.canAccess) {
             console.log('[Auth] User is actually active! Redirecting to dashboard...')
             router.push('/dashboard')
             router.refresh()
          }
        } catch (e) {
          console.error('[Auth] Under the hood check failed', e)
        }
      }
      checkUnderTheHood()
    }
  }, [searchParams, router])

  // ── Show inactive/unlock screen ──────────────────────────────────────
  if (isInactive) {

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
            {hasPixData ? 'Finalize seu acesso ao Vynta' : 'Acesso Bloqueado'}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[1.03rem] leading-relaxed text-surface-200 sm:text-lg">
            {hasPixData
              ? 'Após a confirmação do pagamento, seu acesso VIP será liberado automaticamente.'
              : 'Sua conta está inativa. Você precisa de uma assinatura ativa para acessar o sistema.'}
          </p>

          <div className="card space-y-5 border-surface-700/70 bg-surface-900/85 px-5 py-6 shadow-elevated backdrop-blur sm:px-8 sm:py-8 mt-6">
            {error && (
              <p className="rounded-xl border border-red-900/40 bg-red-900/20 p-3 text-sm text-red-300 mb-4">{error}</p>
            )}

            {hasPixData ? (
              <div className="space-y-6">
                {/* Status pill */}
                <div className="mx-auto w-fit px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-center flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                  <p className="text-xs font-medium text-primary-300">Aguardando pagamento</p>
                </div>

                {/* QR Code */}
                <div className="bg-surface-800/50 rounded-2xl p-6 border border-surface-700/50 flex flex-col items-center">
                  <p className="text-sm font-medium text-surface-200 mb-4 whitespace-nowrap overflow-hidden text-ellipsis w-full">Escaneie o QR Code ou copie o código Pix abaixo.</p>
                  <div className="flex justify-center p-3 bg-white rounded-xl shadow-sm">
                    {paymentData.pix.qrcode || paymentData.pix.copyPaste ? (
                      <QRCodeSVG 
                        value={paymentData.pix.qrcode || paymentData.pix.copyPaste} 
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        includeMargin={false}
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] rounded-xl bg-surface-100 flex items-center justify-center text-surface-500 text-sm">
                        QR Code não disponível
                      </div>
                    )}
                  </div>
                </div>

                {/* Copy-paste code */}
                {paymentData.pix.copyPaste && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-surface-400 text-left">PIX Copia e Cola:</p>
                    <div className="flex flex-col gap-2 relative">
                      <div className="w-full p-3 bg-surface-950/50 border border-surface-700 text-surface-300 text-xs rounded-lg font-mono break-all text-left">
                        {paymentData.pix.copyPaste}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.pix.copyPaste)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-surface-800 hover:bg-surface-700 text-white p-3 rounded-lg text-sm font-medium transition-colors border border-surface-600 shadow-sm"
                      >
                        {copied ? (
                          <>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copiar código PIX
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expiration date */}
                {paymentData.pix.expirationDate && (
                  <div className="text-xs text-surface-400">
                    Válido até: <span className="font-medium text-surface-200">{formatPixDate(paymentData.pix.expirationDate)}</span>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl p-4 text-left">
                  <ul className="text-xs text-surface-300 space-y-2">
                    <li className="flex gap-2"><span className="text-primary-400">1.</span> Abra seu aplicativo de banco</li>
                    <li className="flex gap-2"><span className="text-primary-400">2.</span> Escolha a opção PIX Copia e Cola ou escaneie o QR Code</li>
                    <li className="flex gap-2"><span className="text-primary-400">3.</span> Confirme a transação</li>
                  </ul>
                </div>

                {/* Refresh button */}
                <div className="pt-2">
                  <button
                    onClick={handleCheckPaymentStatus}
                    disabled={checkingPayment}
                    className="btn-primary h-12 w-full text-sm font-semibold shadow-lg shadow-primary-500/20 relative overflow-hidden"
                  >
                    {checkingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </span>
                    ) : (
                      'Já paguei, verificar acesso'
                    )}
                  </button>
                </div>

                {/* Payment check message */}
                {paymentMessage && (
                  <p className={`text-xs text-center p-3 rounded-lg font-medium border ${
                    paymentMessage.includes('✓') 
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                      : 'bg-primary-500/10 text-primary-300 border-primary-500/20'
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

            <div className="pt-4 border-t border-surface-700/50 mt-6">
              <button
                onClick={() => setIsInactive(false)}
                className="text-sm font-medium text-surface-400 hover:text-white transition-colors w-full text-center"
              >
                Entrar com outra conta
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
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="João Silva"
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
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-surface-200">
                Senha
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
              placeholder="••••••••"
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
                {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
              </span>
            ) : (
              mode === 'login' ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        {/* Form bottom links */}
        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-[1.03rem] text-surface-400">
              Ainda não tem acesso?{' '}
              <Link href="/#planos" className="font-semibold text-brand-300 hover:text-brand-200 transition-colors">
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
