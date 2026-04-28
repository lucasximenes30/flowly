'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'

export default function PaymentReturnPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'active' | 'pending' | 'error'>('loading')
  const [message, setMessage] = useState('Verificando status do pagamento...')

  useEffect(() => {
    let mounted = true
    let retries = 0
    const maxRetries = 5

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/subscription/status', { method: 'POST' })
        const data = await res.json()

        if (!mounted) return

        if (data.status === 'approved' || data.status === 'already_active' || data.canAccess) {
          setStatus('active')
          setMessage('Pagamento confirmado! Redirecionando para o painel...')
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 2000)
          return
        }

        if (data.status === 'pending') {
          if (retries < maxRetries) {
            retries++
            setTimeout(checkStatus, 3000)
            return
          }
          setStatus('pending')
          setMessage('Pagamento ainda em processamento. Voc\u00ea pode aguardar ou voltar mais tarde.')
          return
        }

        setStatus('error')
        setMessage('N\u00e3o foi poss\u00edvel confirmar o pagamento. Tente novamente ou acesse a tela inicial.')
      } catch (err) {
        if (!mounted) return
        setStatus('error')
        setMessage('Erro ao verificar pagamento.')
      }
    }

    checkStatus()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-surface-950 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,88,249,0.26),transparent_45%),radial-gradient(circle_at_bottom,rgba(17,31,171,0.2),transparent_36%)]" />

      <div className="relative w-full max-w-md space-y-6 text-center">
        <BrandLogo size="lg" className="justify-center" textClassName="text-3xl text-white" />
        
        <div className="card space-y-5 border-surface-700/70 bg-surface-900/85 px-5 py-8 mt-6">
          <h1 className="text-2xl font-semibold text-white">Status do Pagamento</h1>
          
          <div className={`p-4 rounded-xl border ${
            status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
            status === 'pending' || status === 'loading' ? 'bg-primary-500/10 border-primary-500/30 text-primary-300' :
            'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>

          {status === 'loading' || (status === 'pending' && <p className="text-xs text-surface-400 animate-pulse">Atualizando...</p>)}

          {status !== 'active' && status !== 'loading' && (
             <button
               onClick={() => router.push('/')}
               className="btn-secondary w-full mt-4"
             >
               Voltar ao in\u00edcio
             </button>
          )}
        </div>
      </div>
    </div>
  )
}
