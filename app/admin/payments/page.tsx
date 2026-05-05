'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Lucide from 'lucide-react'

type PaymentTransaction = {
  id: string
  provider: string
  providerTransactionId: string | null
  amount: number | null
  paymentMethod: string | null
  status: 'PENDING' | 'ACTIVE' | 'FAILED' | 'EXPIRED' | 'CANCELED'
  rawStatus: string | null
  paidAt: string | null
  expiresAt: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
}

type PageData = {
  transactions: PaymentTransaction[]
  total: number
  page: number
  totalPages: number
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' },
  PENDING: { label: 'Pendente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400' },
  FAILED: { label: 'Falhou', className: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400' },
  EXPIRED: { label: 'Expirado', className: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400' },
  CANCELED: { label: 'Cancelado', className: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400' },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

function formatCurrency(amount: number | null) {
  if (amount == null) return '—'
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/payments?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar pagamentos')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-surface-900 dark:text-white">
            Pagamentos
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Histórico de transações registradas via webhook.
          </p>
        </div>
        {data && (
          <div className="px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-300">
            Total: {data.total}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface-900 p-4 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-surface-900 dark:text-white"
          >
            <option value="all">Status: Todos</option>
            <option value="ACTIVE">Aprovado</option>
            <option value="PENDING">Pendente</option>
            <option value="FAILED">Falhou</option>
            <option value="EXPIRED">Expirado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="sm:ml-auto px-4 py-2.5 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Lucide.RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-surface-400">
            <Lucide.Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm">Carregando pagamentos...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Desktop Table */}
      {!loading && !error && data && (
        <>
          {data.transactions.length === 0 ? (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-16 text-center">
              <div className="w-14 h-14 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lucide.CreditCard className="w-7 h-7 text-surface-400" />
              </div>
              <p className="font-semibold text-surface-700 dark:text-surface-300">Nenhum pagamento encontrado.</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Os pagamentos aparecerão aqui conforme os webhooks forem recebidos.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface-50 dark:bg-surface-950/50 border-b border-surface-200 dark:border-surface-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Usuário</th>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Status</th>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Valor</th>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Método</th>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Transaction ID</th>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Pago em</th>
                        <th className="px-6 py-4 font-semibold text-surface-600 dark:text-surface-300">Criado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                      {data.transactions.map((tx) => {
                        const statusCfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.CANCELED
                        return (
                          <tr key={tx.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-surface-900 dark:text-surface-100">{tx.user.name}</div>
                              <div className="text-xs text-surface-500">{tx.user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusCfg.className}`}>
                                {statusCfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono font-semibold text-surface-900 dark:text-surface-100">
                              {formatCurrency(tx.amount)}
                            </td>
                            <td className="px-6 py-4 text-surface-600 dark:text-surface-400 capitalize">
                              {tx.paymentMethod || '—'}
                            </td>
                            <td className="px-6 py-4">
                              {tx.providerTransactionId ? (
                                <span className="font-mono text-xs text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                                  {tx.providerTransactionId.substring(0, 20)}…
                                </span>
                              ) : (
                                <span className="text-surface-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-surface-600 dark:text-surface-400 text-sm">
                              {formatDate(tx.paidAt)}
                            </td>
                            <td className="px-6 py-4 text-surface-600 dark:text-surface-400 text-sm">
                              {formatDate(tx.createdAt)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden space-y-4">
                {data.transactions.map((tx) => {
                  const statusCfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.CANCELED
                  return (
                    <div key={tx.id} className="bg-white dark:bg-surface-900 rounded-2xl p-5 border border-surface-200 dark:border-surface-800 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-surface-900 dark:text-surface-100">{tx.user.name}</div>
                          <div className="text-xs text-surface-500 mt-0.5">{tx.user.email}</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Valor</p>
                          <p className="font-mono font-semibold text-surface-900 dark:text-surface-100 mt-0.5">{formatCurrency(tx.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Método</p>
                          <p className="text-surface-700 dark:text-surface-300 mt-0.5 capitalize">{tx.paymentMethod || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Pago em</p>
                          <p className="text-surface-700 dark:text-surface-300 mt-0.5 text-xs">{formatDate(tx.paidAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Criado em</p>
                          <p className="text-surface-700 dark:text-surface-300 mt-0.5 text-xs">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      {tx.providerTransactionId && (
                        <div className="pt-2 border-t border-surface-100 dark:border-surface-800">
                          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Transaction ID</p>
                          <p className="font-mono text-xs text-surface-500 mt-0.5 break-all">{tx.providerTransactionId}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-surface-500">
                    Página {data.page} de {data.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-50 transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page >= data.totalPages}
                      className="px-4 py-2 text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-50 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
