'use client'

import { useState } from 'react'
import * as Lucide from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateUserModal({
  onClose,
}: {
  onClose: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar usuário')
      }

      setTempPassword(data.tempPassword)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-800 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-surface-900 dark:text-white">Criar Usuário Manual</h3>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <Lucide.X className="w-5 h-5" />
          </button>
        </div>

        {tempPassword ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <Lucide.Check className="w-6 h-6" />
              </div>
              <h4 className="font-medium text-surface-900 dark:text-white text-lg">Usuário criado com sucesso!</h4>
              <p className="text-sm text-surface-500">
                Uma senha temporária foi gerada. O usuário deverá alterá-la no primeiro acesso.
              </p>
            </div>

            <div className="bg-surface-50 dark:bg-surface-950 p-4 rounded-xl border border-surface-200 dark:border-surface-800">
              <p className="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wider">Senha Temporária</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-2xl font-mono font-bold text-surface-900 dark:text-white tracking-widest text-center py-2 bg-white dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800">
                  {tempPassword}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(tempPassword)}
                  className="p-3 text-surface-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                  title="Copiar senha"
                >
                  <Lucide.Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-surface-800 dark:bg-surface-100 hover:bg-surface-900 dark:hover:bg-white text-white dark:text-surface-900 rounded-xl font-semibold transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                placeholder="Ex: João da Silva"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                placeholder="joao@exemplo.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Telefone (WhatsApp) <span className="text-surface-400 font-normal">(opcional)</span>
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                placeholder="+55 11 99999-9999"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Lucide.Loader2 className="w-4 h-4 animate-spin" />}
                Criar Usuário
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
