'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'

interface WorkoutPlanDTO {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Props {
  session: { userId: string; name: string }
  initialPlan: WorkoutPlanDTO | null
}

export default function WorkoutClient({ session, initialPlan }: Props) {
  const router = useRouter()

  const [plan, setPlan] = useState<WorkoutPlanDTO | null>(initialPlan)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [planName, setPlanName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Treino | Flowly'
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const openCreateModal = () => {
    setError('')
    setPlanName('')
    setShowCreateModal(true)
    requestAnimationFrame(() => setModalVisible(true))
  }

  const closeCreateModal = () => {
    setModalVisible(false)
    window.setTimeout(() => setShowCreateModal(false), 200)
  }

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (submitting) return

    const trimmedName = planName.trim()
    if (!trimmedName) {
      setError('Informe o nome do plano')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/workout/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error ?? 'Não foi possível criar o plano')
        return
      }

      setPlan(payload.plan)
      closeCreateModal()
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 reports-page-enter">
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="text-base font-bold tracking-tight text-surface-900 dark:text-surface-100">Treino</h1>
            <p className="hidden text-xs text-surface-500 dark:text-surface-400 sm:block">
              Organize seus treinos e acompanhe sua evolução
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-surface-500 dark:text-surface-400 sm:inline">Olá, {session.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-surface-500 transition-colors hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {!plan ? (
          <section className="card animate-dashboard-fade relative flex min-h-[65vh] flex-col items-center justify-center overflow-hidden px-6 py-14 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-500/10 to-transparent" />

            <div className="relative mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-400/30 bg-brand-500/15 text-brand-500 shadow-lg shadow-brand-900/10">
              <Lucide.Dumbbell className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-100 sm:text-3xl">Treino</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-surface-500 dark:text-surface-400 sm:text-base">
              Organize seus treinos e acompanhe sua evolução
            </p>

            <button onClick={openCreateModal} className="btn-primary mt-8 w-full sm:w-auto">
              <Lucide.Plus className="mr-1.5 h-4 w-4" />
              Criar plano de treino
            </button>
          </section>
        ) : (
          <>
            <section className="card animate-dashboard-fade space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-surface-500 dark:text-surface-400">
                    Seu plano atual
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-surface-900 dark:text-surface-100">
                    {plan.name}
                  </h2>
                </div>

                <button
                  type="button"
                  disabled
                  className="btn-secondary w-full opacity-60 disabled:cursor-not-allowed sm:w-auto"
                >
                  <Lucide.Pencil className="mr-1.5 h-4 w-4" />
                  Editar plano
                </button>
              </div>
            </section>

            <section className="card animate-dashboard-fade">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Seus treinos</h3>
                <span className="rounded-full border border-surface-200 bg-surface-100 px-3 py-1 text-xs font-medium text-surface-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400">
                  Em breve
                </span>
              </div>

              <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
                Você ainda não adicionou treinos ao seu plano
              </p>
            </section>
          </>
        )}
      </main>

      {showCreateModal && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 transition-opacity duration-200 sm:items-center sm:p-4 ${
            modalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.target === e.currentTarget && !submitting && closeCreateModal()}
        >
          <div
            className={`w-full rounded-t-3xl border border-surface-200/80 bg-white shadow-xl transition-all duration-200 dark:border-surface-700/60 dark:bg-surface-900 sm:max-w-lg sm:rounded-2xl ${
              modalVisible ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-200/80 p-5 dark:border-surface-800">
              <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Criar plano de treino</h3>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Defina um nome para o seu plano atual.</p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={submitting}
                className="rounded-full p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-800 dark:hover:text-surface-300"
              >
                <Lucide.X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-5 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-surface-600 dark:text-surface-300">Nome do plano</label>
                <input
                  type="text"
                  maxLength={80}
                  className="input-field"
                  placeholder="Ex: Hipertrofia - Abril"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  autoFocus
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                  {submitting ? 'Criando...' : 'Criar plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
