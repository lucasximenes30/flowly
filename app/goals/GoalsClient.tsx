'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import GoalModal from './GoalModal'
import TransactionModal from './TransactionModal'

export default function GoalsClient() {
  const router = useRouter()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isGoalModalOpen, setGoalModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null)
  
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transactionGoal, setTransactionGoal] = useState<any | null>(null)

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleEdit = (goal: any) => {
    setSelectedGoal(goal)
    setGoalModalOpen(true)
  }

  const handleAddMoney = (goal: any) => {
    setTransactionGoal(goal)
    setTransactionModalOpen(true)
  }

  return (
    <div className="min-h-full bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 animate-dashboard-fade">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
              title="Voltar ao Dashboard"
            >
              <Lucide.ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-base font-semibold tracking-tight">Metas Financeiras</h1>
          </div>
          <button
            onClick={() => {
              setSelectedGoal(null)
              setGoalModalOpen(true)
            }}
            className="btn-primary h-9 px-4 text-xs font-semibold shadow-lg shadow-brand-500/20"
          >
            <Lucide.Plus className="w-4 h-4 mr-1" />
            Nova Meta
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seus Objetivos</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              Guarde dinheiro com propósito e acompanhe seu progresso.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="card text-center py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <Lucide.Target className="w-8 h-8 text-surface-400 dark:text-surface-500" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Nenhuma meta ainda</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
              Comece a guardar dinheiro para viagens, compras ou sua reserva de emergência.
            </p>
            <button
              onClick={() => {
                setSelectedGoal(null)
                setGoalModalOpen(true)
              }}
              className="btn-primary"
            >
              Criar Primeira Meta
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => {
              const current = parseFloat(g.currentAmount)
              const target = parseFloat(g.targetAmount)
              let progress = target > 0 ? (current / target) * 100 : 0
              if (progress > 100) progress = 100

              const formatValue = (val: number) => 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)

              return (
                <div key={g.id} className="card relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 flex flex-col">
                  {/* Progress Glow Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-100/50 to-transparent dark:from-surface-800/50 pointer-events-none" />
                  
                  <div className="relative flex-1 flex flex-col space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${g.color || 'bg-brand-500'} shadow-brand-500/20`}>
                          <Lucide.Target className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
                            {g.category || 'Geral'}
                          </span>
                          <h3 className="font-display text-base font-semibold leading-tight text-surface-900 dark:text-surface-100 group-hover:text-brand-500 transition-colors">
                            {g.title}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Action Menu (Edit) */}
                      <button 
                        onClick={() => handleEdit(g)}
                        className="p-1.5 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
                      >
                        <Lucide.MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs text-surface-500 dark:text-surface-400 font-medium mb-0.5">Acumulado</span>
                          <span className="text-lg font-bold tracking-tight">{formatValue(current)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-surface-500 dark:text-surface-400 font-medium mb-0.5">Meta</span>
                          <span className="text-sm font-semibold">{formatValue(target)}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div />
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-brand-600 dark:text-brand-400">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-surface-100 dark:bg-surface-800 ring-1 ring-inset ring-surface-200/50 dark:ring-surface-700/50">
                          <div
                            style={{ width: `${progress}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${g.color || 'bg-brand-500'} transition-all duration-1000 ease-out relative`}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add Money Button */}
                    <button
                      onClick={() => handleAddMoney(g)}
                      className="w-full mt-2 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors flex items-center justify-center gap-2 group-hover:border-brand-200 dark:group-hover:border-brand-500/30"
                    >
                      <Lucide.ArrowUpCircle className="w-4 h-4 text-brand-500" />
                      Guardar Dinheiro
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        goal={selectedGoal}
        onSuccess={() => {
          setGoalModalOpen(false)
          fetchGoals()
        }}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        goal={transactionGoal}
        onSuccess={() => {
          setTransactionModalOpen(false)
          fetchGoals()
        }}
      />
    </div>
  )
}
