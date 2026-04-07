'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { useApp } from '@/lib/i18n'
import SettingsSection from './SettingsSection'
import ManageCategoriesModal from './ManageCategoriesModal'

interface Session { userId: string; email: string; name: string }

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
  session: Session
}

export default function SettingsPanel({ open, onClose, session }: SettingsPanelProps) {
  const router = useRouter()
  const { t, locale } = useApp()
  const isBRL = locale === 'pt-BR'
  const [visible, setVisible] = useState(open)
  const [mounted, setMounted] = useState(false)

  /* ---------- mount / unmount with animation ---------- */
  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const timer = setTimeout(() => setMounted(false), 350)
      return () => clearTimeout(timer)
    }
  }, [open])

  /* ---------- name ---------- */
  const [newName, setNewName] = useState('')
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [nameMessage, setNameMessage] = useState('')
  const [showNameConfirm, setShowNameConfirm] = useState(false)
  const nameDisabled = !newName.trim() || newName.trim() === session.name

  /* ---------- password ---------- */
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  /* ---------- categories ---------- */
  const [showManageCategories, setShowManageCategories] = useState(false)

  const handleUpdateName = async () => {
    setShowNameConfirm(false)
    if (newName.trim() === session.name) {
      setNameMessage(t('settings.nameSame'))
      return
    }
    setIsUpdatingName(true)
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
      setNameMessage(t('settings.nameUpdated'))
      setNewName('')
      window.dispatchEvent(new CustomEvent('flowly:nameUpdated', { detail: newName.trim() }))
      router.refresh()
    } catch {
      setNameMessage('Erro de rede')
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage('')
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t('settings.passwordMismatch'))
      return
    }
    if (newPassword === currentPassword) {
      setPasswordMessage(t('settings.passwordSame'))
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
        setPasswordMessage(data.error ?? (isBRL ? 'Erro ao alterar senha' : 'Error changing password'))
        return
      }
      setPasswordMessage(t('settings.passwordUpdated'))
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch {
      setPasswordMessage(isBRL ? 'Erro de rede' : 'Network error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const isPanelOpen = visible && mounted

  if (!mounted) return null

  return (
    <>
      {/* ── overlay ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-350 ${
          isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* ── panel ── */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[95vw] sm:w-[460px] md:w-[420px] lg:w-[26vw] lg:min-w-[400px] xl:w-[24vw] bg-white dark:bg-surface-950 border-l border-surface-200/80 dark:border-surface-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-6 py-5 border-b border-surface-200/80 dark:border-surface-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-100">
              {t('settings.title')}
            </h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
              {isBRL ? 'Ol\xe1,' : 'Hi,'} <span className="font-semibold text-surface-700 dark:text-surface-200">{session.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-all duration-200 active:scale-95"
          >
            <Lucide.X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-10">

            {/* ════════ GERAL ════════ */}
            <SettingsSection
              icon={<Lucide.Settings2 className="h-5 w-5" />}
              title={t('settings.general')}
            >
              <div className="space-y-6">
                {/* Theme */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.theme')}</label>
                  <ThemeSelector />
                </div>

                {/* Language */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('settings.language')}</label>
                  <LanguageSelector isBRL={isBRL} />
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {isBRL ? 'Categorias' : 'Categories'}
                  </label>
                  <button
                    onClick={() => setShowManageCategories(true)}
                    className="group flex w-full items-center justify-between rounded-xl border border-surface-200 dark:border-surface-700/60 bg-surface-50 dark:bg-surface-900 px-4 py-3.5 text-sm text-surface-700 dark:text-surface-200 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200 active:scale-[0.99]"
                  >
                    <span className="font-medium">
                      {isBRL ? 'Gerenciar Categorias' : 'Manage Categories'}
                    </span>
                    <Lucide.ChevronRight className="h-4 w-4 text-surface-400 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </SettingsSection>

            {/* Divider */}
            <div className="h-px bg-surface-200 dark:bg-surface-800" />

            {/* ════════ PERFIL ════════ */}
            <SettingsSection
              icon={<Lucide.User className="h-5 w-5" />}
              title={t('settings.profile')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    {t('settings.profileName')}
                  </label>
                  <input
                    type="text"
                    className="input-field h-12 rounded-xl bg-white dark:bg-surface-900"
                    placeholder={t('settings.namePlaceholder')}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-surface-400 dark:text-surface-500">
                    {isBRL ? 'Atual:' : 'Current:'}{' '}
                    <span className="font-semibold text-surface-600 dark:text-surface-300">{session.name}</span>
                  </p>
                </div>

                {nameMessage && (
                  <MessageBanner message={nameMessage} />
                )}

                <button
                  onClick={() => setShowNameConfirm(true)}
                  disabled={nameDisabled}
                  className="btn-primary w-full h-12 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isBRL ? 'Atualizar Nome' : 'Update Name'}
                </button>
              </div>
            </SettingsSection>

            {/* Divider */}
            <div className="h-px bg-surface-200 dark:bg-surface-800" />

            {/* ════════ SEGURANÇA ════════ */}
            <SettingsSection
              icon={<Lucide.Shield className="h-5 w-5" />}
              title={t('settings.changePassword')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    {t('settings.currentPassword')}
                  </label>
                  <PasswordInput
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    {t('settings.newPassword')}
                  </label>
                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={isBRL ? 'Minimo 6 caracteres' : 'Minimum 6 characters'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    {t('settings.confirmPassword')}
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                  />
                </div>

                {passwordMessage && (
                  <MessageBanner message={passwordMessage} />
                )}

                <button
                  onClick={handleChangePassword}
                  disabled={
                    isChangingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  className="btn-primary w-full h-12 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isChangingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                      {t('settings.changingPassword')}
                    </span>
                  ) : (
                    t('settings.update')
                  )}
                </button>
              </div>
            </SettingsSection>

            {/* Divider */}
            <div className="h-px bg-surface-200 dark:bg-surface-800" />

            {/* ════════ DELETE ACCOUNT ════════ */}
            <DangerZoneCard isBRL={isBRL} t={t} />

          </div>
        </div>
      </div>

      {/* ── Name confirmation modal ── */}
      {showNameConfirm && (
        <ConfirmModal
          title={t('settings.confirmNameChange')}
          description={
            <span>
              <span className="font-medium text-surface-700 dark:text-surface-300">{session.name}</span>
              <span className="text-brand-600 dark:text-brand-400 mx-1">→</span>
              <span className="font-medium text-brand-600 dark:text-brand-400">{newName}</span>
            </span>
          }
          onCancel={() => setShowNameConfirm(false)}
          onConfirm={handleUpdateName}
          loading={isUpdatingName}
        />
      )}

      {/* ── Categories modal ── */}
      {showManageCategories && (
        <ManageCategoriesModal
          onClose={() => setShowManageCategories(false)}
          onRefresh={() => {}}
        />
      )}
    </>
  )
}

/* ───────────────────── Sub-components ───────────────────── */

function ThemeSelector() {
  const { theme, setTheme } = useApp()

  const options = [
    { value: 'light' as const, icon: '☀️', label: 'Claro' },
    { value: 'system' as const, icon: '💻', label: 'Auto' },
    { value: 'dark' as const, icon: '🌙', label: 'Escuro' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {options.map((opt) => {
        const active = theme === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
              active
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700/60 dark:bg-brand-950/40 dark:text-brand-400 shadow-sm'
                : 'border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-900 text-surface-500 dark:text-surface-400 hover:border-brand-200 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            <span className="text-lg leading-none">{opt.icon}</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function LanguageSelector({ isBRL }: { isBRL: boolean }) {
  const { locale, setLocale } = useApp()

  const options = [
    { value: 'pt-BR' as const, flag: '🇧🇷', label: 'PT-BR' },
    { value: 'en' as const, flag: '🇺🇸', label: 'EN' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => {
        const active = locale === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setLocale(opt.value)}
            className={`flex items-center justify-center gap-2.5 rounded-xl border py-3.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
              active
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700/60 dark:bg-brand-950/40 dark:text-brand-400 shadow-sm'
                : 'border-surface-200 dark:border-surface-700/60 bg-white dark:bg-surface-900 text-surface-500 dark:text-surface-400 hover:border-brand-200 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800'
            }`}
          >
            <span className="text-lg leading-none">{opt.flag}</span>
            <span className="text-xs uppercase tracking-wider font-semibold">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className="input-field h-12 pr-12 rounded-xl bg-white dark:bg-surface-900"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
      >
        {show ? (
          <Lucide.EyeOff className="h-4 w-4" />
        ) : (
          <Lucide.Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

function MessageBanner({ message }: { message: string }) {
  const success =
    message.includes('sucesso') ||
    message.includes('uccess') ||
    message.includes('atualizado') ||
    message.includes('updated') ||
    message.includes('diferente') ||
    message.includes('different') ||
    message.includes('coincidem') ||
    message.includes('o not match')
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
        success
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
          : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      }`}
    >
      {message}
    </div>
  )
}

function DangerZoneCard({
  isBRL,
  t,
}: {
  isBRL: boolean
  t: (key: string) => string
}) {
  // We keep delete account in the panel but without confirmation modals
  // for simplicity — the modals stay in DashboardClient if needed
  // For now, show as a card that opens nothing — just a visual section
  // (keeping consistent with the existing UX, the modals live in DashboardClient)

  return (
    <div className="rounded-2xl border border-red-200/80 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <Lucide.TriangleAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            {t('settings.dangerZone')}
          </p>
          <p className="text-xs text-red-500 dark:text-red-400/70 mt-0.5">
            {isBRL ? 'Ações irreversíveis na sua conta' : 'Irreversible account actions'}
          </p>
        </div>
      </div>
      <button
        className="w-full rounded-xl border border-red-300 dark:border-red-800/50 bg-red-100 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
        onClick={() => {
          // Trigger dashboard delete flow via a custom event
          window.dispatchEvent(new CustomEvent('flowly:deleteAccount'))
        }}
      >
        {t('settings.deleteAccount')}
      </button>
    </div>
  )
}

function ConfirmModal({
  title,
  description,
  onCancel,
  onConfirm,
  loading,
}: {
  title: string
  description: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  const { t, locale } = useApp()
  const isBRL = locale === 'pt-BR'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-sm scale-100 animate-[pageFadeIn_0.25s_ease-out] rounded-2xl bg-white p-6 shadow-elevated dark:bg-surface-900 dark:border dark:border-surface-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mx-auto mb-4">
          <Lucide.Pencil className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-center text-surface-900 dark:text-surface-100">{title}</h3>
        <p className="text-sm text-center text-surface-500 dark:text-surface-400 mt-2">{description}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary h-12 flex-1 disabled:opacity-40" disabled={loading}>
            {t('settings.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary h-12 flex-1 disabled:opacity-40 disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                {isBRL ? 'Atualizando...' : 'Updating...'}
              </span>
            ) : (
              t('settings.confirm')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
