'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { useTheme } from '@/lib/theme'

interface Session { userId: string; email: string; name: string }

interface SettingsClientProps {
  session: Session
}

export default function SettingsClient({ session }: SettingsClientProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isBRL = true

  // Profile data state
  const [newName, setNewName] = useState('')
  const [profileName, setProfileName] = useState(session.name)
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [nameMessage, setNameMessage] = useState('')

  const [userSex, setUserSex] = useState<string | null>(null)
  const [isUpdatingSex, setIsUpdatingSex] = useState(false)
  const [sexMessage, setSexMessage] = useState('')

  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  // Account deletion
  const [showDeleteConfirm1, setShowDeleteConfirm1] = useState(false)
  const [showDeleteConfirm2, setShowDeleteConfirm2] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setUserSex(data.user?.sex || null)
          setUserPlan(data.user?.plan || null)
          setUserRole(data.user?.role || null)
          setSubscriptionEndDate(data.user?.subscriptionEndDate || null)
        }
      } catch { /* ignore */ }
    }
    loadUserData()
  }, [])

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim() === profileName) return
    setIsUpdatingName(true)
    setNameMessage('')
    try {
      const res = await fetch('/api/auth/update-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNameMessage(data.error ?? 'Erro ao atualizar nome')
        return
      }
      setNameMessage("Nome atualizado com sucesso!")
      setProfileName(newName.trim())
      setNewName('')
      window.dispatchEvent(new CustomEvent('vynta:nameUpdated', { detail: newName.trim() }))
      router.refresh()
    } catch {
      setNameMessage('Erro de rede')
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleUpdateSex = async (sex: string | null) => {
    setIsUpdatingSex(true)
    setSexMessage('')
    try {
      const res = await fetch('/api/auth/update-sex', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sex }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSexMessage(data.error ?? 'Erro ao atualizar')
        return
      }
      setUserSex(sex)
      setSexMessage('Atualizado com sucesso!')
      setTimeout(() => setSexMessage(''), 3000)
    } catch {
      setSexMessage('Erro de rede')
    } finally {
      setIsUpdatingSex(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage('')
    if (newPassword !== confirmPassword) {
      setPasswordMessage("As senhas não coincidem.")
      return
    }
    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordMessage(data.error ?? 'Erro ao alterar senha')
        return
      }
      setPasswordMessage("Senha atualizada com sucesso!")
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      setPasswordMessage('Erro de rede')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'EXCLUIR') {
      setDeleteMessage('Digite EXCLUIR para confirmar')
      return
    }
    setIsDeletingAccount(true)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setDeleteMessage(data.error ?? 'Erro ao excluir conta')
        return
      }
      setDeleteMessage("Conta excluída com sucesso.")
      setTimeout(() => router.push('/login'), 1000)
    } catch {
      setDeleteMessage('Erro de rede')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 animate-dashboard-fade">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
              title="Voltar ao Dashboard"
            >
              <Lucide.ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-base font-semibold tracking-tight">Configurações</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Gerencie seu perfil, preferências e segurança da conta.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Theme & Language Card */}
          <div className="card space-y-6">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Lucide.Settings2 className="w-4 h-4 text-brand-500" />
              <span>Geral & Preferências</span>
            </h3>

            {/* Theme selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Tema do Sistema</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light' as const, icon: '☀️', label: 'Claro' },
                  { value: 'system' as const, icon: '💻', label: 'Auto' },
                  { value: 'dark' as const, icon: '🌙', label: 'Escuro' },
                ].map((opt) => {
                  const active = theme === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        active
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                          : 'border-surface-150 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800'
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Idioma</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs">
                  <span>🇧🇷</span>
                  <span>Português</span>
                </div>
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-150 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-400 text-xs opacity-50 cursor-not-allowed">
                  <span>🇺🇸</span>
                  <span>English</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card space-y-6">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Lucide.User className="w-4 h-4 text-brand-500" />
              <span>Dados do Perfil</span>
            </h3>

            {/* Subscription status */}
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-150 dark:border-surface-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wider font-semibold">Plano Atual</p>
                <h4 className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">
                  {userRole === 'ADMIN' ? 'Administrador' : userRole === 'COURTESY' ? 'Cortesia VIP' : userPlan === 'PRO' ? 'VIP' : 'Gratuito'}
                </h4>
                {subscriptionEndDate && (
                  <p className="text-[10px] text-surface-400 mt-0.5">
                    Vence em: {new Date(subscriptionEndDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Ativo
              </span>
            </div>

            {/* Change Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Nome de Exibição</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={profileName}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field h-10 flex-1"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={isUpdatingName || !newName.trim() || newName.trim() === profileName}
                  className="btn-primary h-10 px-4 text-xs font-bold shrink-0 disabled:opacity-40"
                >
                  Salvar
                </button>
              </div>
              {nameMessage && <p className="text-xs text-brand-600 dark:text-brand-400">{nameMessage}</p>}
            </div>

            {/* Change Sex */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Sexo (Contexto para Treinos)</label>
              <select
                value={userSex || ''}
                onChange={(e) => handleUpdateSex(e.target.value || null)}
                disabled={isUpdatingSex}
                className="input-field h-10"
              >
                <option value="">Não informado</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Feminino</option>
                <option value="PREFER_NOT_SAY">Prefiro não informar</option>
              </select>
              {sexMessage && <p className="text-xs text-emerald-600 dark:text-emerald-400">{sexMessage}</p>}
            </div>
          </div>

          {/* Password Card */}
          <div className="card space-y-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Lucide.Shield className="w-4 h-4 text-brand-500" />
              <span>Segurança da Conta</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Senha Atual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field h-10"
                />
              </div>

              {passwordMessage && <p className="text-xs text-rose-500 font-semibold">{passwordMessage}</p>}

              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="btn-primary w-full h-10 text-xs font-bold disabled:opacity-40 shadow-md shadow-brand-500/10"
              >
                {isChangingPassword ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="card border-rose-300 dark:border-rose-900/40 bg-rose-500/5 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
                <Lucide.AlertTriangle className="w-5 h-5" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Zona de Perigo</h3>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                A exclusão da conta é um processo final e irreversível. Todos os seus dados de finanças, hábitos e treinos serão apagados para sempre.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm1(true)}
              className="w-full mt-6 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 py-2.5 text-xs font-bold transition-all active:scale-[0.98]"
            >
              Excluir Minha Conta
            </button>
          </div>
        </div>
      </main>

      {/* Delete modals */}
      {showDeleteConfirm1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm1(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-900 p-6 border border-surface-200 dark:border-surface-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">Excluir conta definitivamente?</h3>
            <p className="text-sm text-center text-surface-500 dark:text-surface-400 mt-2">Você perderá o acesso instantaneamente e seus dados não poderão ser restaurados.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm1(false)} className="btn-secondary flex-1 text-xs">Cancelar</button>
              <button onClick={() => { setShowDeleteConfirm1(false); setShowDeleteConfirm2(true) }} className="btn-primary bg-rose-600 hover:bg-rose-700 flex-1 text-xs text-white">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm2(false); setDeleteConfirmText('') }}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-900 p-6 border border-surface-200 dark:border-surface-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">Digite EXCLUIR para confirmar</h3>
            <input
              type="text"
              placeholder="EXCLUIR"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input-field text-center font-mono mt-4 uppercase h-10"
            />
            {deleteMessage && <p className="text-xs text-rose-500 font-semibold text-center mt-2">{deleteMessage}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setShowDeleteConfirm2(false); setDeleteConfirmText('') }} className="btn-secondary flex-1 text-xs">Cancelar</button>
              <button onClick={handleDeleteAccount} disabled={isDeletingAccount || deleteConfirmText !== 'EXCLUIR'} className="btn-primary bg-rose-600 hover:bg-rose-700 flex-1 text-xs text-white disabled:opacity-40">
                {isDeletingAccount ? 'Excluindo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
