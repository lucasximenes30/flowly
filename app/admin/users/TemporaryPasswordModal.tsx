'use client'

import { useEffect, useState } from 'react'
import * as Lucide from 'lucide-react'
import { generateTemporaryPassword } from './actions'

export default function TemporaryPasswordModal({
  userId,
  userName,
  onClose,
}: {
  userId: string | null
  userName: string | null
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (userId) {
      requestAnimationFrame(() => setVisible(true))
      setPassword(null)
      setCopied(false)
    } else {
      setVisible(false)
    }
  }, [userId])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleGenerate = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const tempPass = await generateTemporaryPassword(userId)
      setPassword(tempPass)
    } catch (error) {
      console.error('Failed to generate password', error)
      alert('Erro ao gerar senha temporária. Verifique se você tem permissão.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!userId) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-surface-900 border border-surface-200 dark:border-surface-700/60 overflow-hidden transition-all duration-200 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/30">
          <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <Lucide.Key className="w-5 h-5 text-amber-500" />
            Redefinir Acesso
          </h2>
          <button onClick={handleClose} className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-colors">
            <Lucide.X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!password ? (
            <div className="space-y-6">
              <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed">
                Você está prestes a gerar uma senha temporária para <strong>{userName}</strong>.
                A senha atual do usuário será sobrescrita e ele não poderá mais acessá-la.
              </p>

              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex gap-3">
                <Lucide.AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                  Esta ação é irreversível. Copie a senha gerada na próxima tela e envie ao usuário.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-200 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium shadow-lg shadow-amber-600/20 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Lucide.Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Gerar Senha'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                <Lucide.Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <h3 className="text-xl font-bold text-surface-900 dark:text-white">Senha Gerada!</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                A nova senha de {userName} foi gerada com sucesso.
              </p>

              <div className="p-6 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-2xl relative group">
                <div className="font-mono text-2xl font-bold tracking-wider text-surface-900 dark:text-white mb-2">
                  {password}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 mx-auto mt-4 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Lucide.Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Lucide.Copy className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Copiar senha</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-surface-900 hover:bg-surface-800 dark:bg-white dark:hover:bg-surface-100 text-white dark:text-surface-900 rounded-xl font-medium transition-colors"
              >
                Concluir
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
