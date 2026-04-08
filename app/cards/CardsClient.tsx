'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import { useApp } from '@/lib/i18n'
import NotificationDropdown from '@/components/NotificationDropdown'

const PRESET_COLORS = [
  { id: 'blue', label: 'Azul', hex: '#3b82f6', gradient: 'from-blue-500 via-blue-600 to-blue-800' },
  { id: 'purple', label: 'Roxo', hex: '#a855f7', gradient: 'from-purple-500 via-purple-600 to-purple-800' },
  { id: 'pink', label: 'Rosa', hex: '#ec4899', gradient: 'from-pink-500 via-pink-600 to-pink-800' },
  { id: 'red', label: 'Vermelho', hex: '#ef4444', gradient: 'from-red-500 via-red-600 to-red-800' },
  { id: 'orange', label: 'Laranja', hex: '#f97316', gradient: 'from-orange-500 via-orange-600 to-orange-800' },
  { id: 'black', label: 'Preto', hex: '#171717', gradient: 'from-neutral-800 via-neutral-900 to-black ring-white/20' },
  { id: 'gray', label: 'Cinza', hex: '#6b7280', gradient: 'from-gray-500 via-gray-600 to-gray-800' },
]

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'


interface Card {
  id: string
  name: string
  lastFourDigits: string
  dueDay: number
  closingDay: number
  color: string
  limitAmount: string
}

interface Props {
  session: { userId: string; name: string }
  initialCards: Card[]
  transactions?: any[]
}

export default function CardsClient({ session, initialCards, transactions = [] }: Props) {
  const router = useRouter()
  const { locale, t } = useApp()
  const isBRL = locale === 'pt-BR'
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [color, setColor] = useState('blue')

  // Update Document Title Dynamically
  useEffect(() => {
    document.title = `${t('cards.title')} | Flowly`
  }, [t])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          lastFourDigits,
          dueDay: parseInt(dueDay),
          closingDay: parseInt(closingDay),
          limitAmount: parseFloat(limitAmount),
          color,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Falha ao adicionar cartão')
        return
      }

      const { card } = await res.json()
      setCards([...cards, card])
      
      // Reset form
      setName('')
      setLastFourDigits('')
      setDueDay('')
      setClosingDay('')
      setLimitAmount('')
      setColor('blue')
      setShowForm(false)
      router.refresh()
    } catch {
      setError('Erro de conexão ao adicionar cartão')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este cartão? O histórico de transações será mantido.')) return

    try {
      const res = await fetch(`/api/cards/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover cartão')
      
      setCards(cards.filter(c => c.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Financial calculations
  const cardCalculations = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-11

    return cards.map(card => {
      const cardId = card.id
      const totalLimit = parseFloat(card.limitAmount)
      
      // Filter transactions for this card
      const cardTransactions = (transactions || []).filter(t => t.cardId === cardId && t.type === 'EXPENSE')

      // 1. Used Limit (Sum of all expenses/installments)
      const usedLimit = cardTransactions.reduce((acc, t) => acc + parseFloat(t.amount), 0)

      // 2. Current Invoice
      let closingDate = new Date(currentYear, currentMonth, card.closingDay)
      let prevClosingDate = new Date(currentYear, currentMonth - 1, card.closingDay)
      
      if (now.getDate() > card.closingDay) {
        prevClosingDate = new Date(currentYear, currentMonth, card.closingDay)
        closingDate = new Date(currentYear, currentMonth + 1, card.closingDay)
      }

      const currentInvoiceTransactions = cardTransactions.filter(t => {
        const d = new Date(t.date || t.purchaseDate)
        return d > prevClosingDate && d <= closingDate
      })

      const currentInvoiceAmount = currentInvoiceTransactions.reduce((acc, t) => {
        if (t.isInstallment && t.installmentAmount) {
          return acc + parseFloat(t.installmentAmount)
        }
        return acc + parseFloat(t.amount)
      }, 0)

      return {
        ...card,
        totalLimit,
        usedLimit,
        availableLimit: Math.max(totalLimit - usedLimit, 0),
        currentInvoiceAmount,
        usagePercent: totalLimit > 0 ? (usedLimit / totalLimit) * 100 : 0
      }
    })
  }, [cards, transactions])

  const chartData = cardCalculations.map(c => ({
    name: c.name,
    fatura: c.currentInvoiceAmount,
    color: PRESET_COLORS.find(p => p.id === c.color)?.hex || '#3b82f6'
  }))


  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col transition-colors duration-300 reports-page-enter">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors"
            >
              <Lucide.ArrowLeft className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">Flowly</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-500 dark:text-surface-400">
              {isBRL ? `Olá` : `Hi`}, {session.name}
            </span>

            {/* Notification bell */}
            <NotificationDropdown transactions={transactions} cards={cards} isBRL={isBRL} />

            <button onClick={handleLogout} className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 transition-colors">
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full flex-1 p-6 space-y-6">
        
        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 flex items-start gap-3">
            <Lucide.AlertCircle className="h-5 w-5 shrink-0" />
            <p className="mt-0.5">{error}</p>
          </div>
        )}

        {/* Add Card Form */}
        {showForm && (
          <div className="card space-y-6 animate-dashboard-fade">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Adicionar Cartão de Crédito</h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Preencha os dados básicos do seu cartão para vinculá-lo às suas despesas.</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Apelido do Cartão</label>
                  <input
                    type="text"
                    required
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank, Itaú Black..."
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Últimos 4 Dígitos</label>
                  <input
                    type="text"
                    required
                    pattern="\d{4}"
                    maxLength={4}
                    value={lastFourDigits}
                    onChange={(e) => setLastFourDigits(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 9421"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Dia de Fechamento</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    placeholder="Ex: 1"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Dia de Vencimento</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="Ex: 10"
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Limite do Cartão</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">{isBRL ? 'R$' : '$'}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={limitAmount}
                      onChange={(e) => setLimitAmount(e.target.value)}
                      placeholder="5000.00"
                      className="input-field pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Cor do Cartão</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setColor(preset.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color === preset.id ? 'ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-surface-900 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.label}
                    >
                      {color === preset.id && <Lucide.Check className="w-4 h-4 text-white drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name || lastFourDigits.length !== 4 || !dueDay || !closingDay || !limitAmount}
                  className="btn-primary"
                >
                  {submitting ? 'Salvando...' : 'Salvar Cartão'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analytics Section */}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-dashboard-fade">
            <div className="lg:col-span-2 card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{isBRL ? 'Fatura Atual por Cartão' : 'Current Invoice per Card'}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">{isBRL ? 'Visão geral do fechamento atual' : 'Overview of current billing cycle'}</p>
                </div>
                <Lucide.BarChart3 className="h-4 w-4 text-surface-400" />
              </div>
              <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#888888' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#888888' }}
                      tickFormatter={(val) => `${isBRL ? 'R$' : '$'}${val}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#88888810' }}
                      contentStyle={{ 
                        backgroundColor: '#171717', 
                        border: '1px solid #ffffff10', 
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fff' 
                      }}
                      formatter={(val: any) => [`${isBRL ? 'R$' : '$'}${parseFloat(val).toLocaleString(isBRL?'pt-BR':'en-US')}`, isBRL ? 'Fatura' : 'Invoice']}
                    />
                    <Bar dataKey="fatura" radius={[4, 4, 0, 0]} barSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card p-6 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Lucide.ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold">{isBRL ? 'Limite Total' : 'Total Limit'}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {isBRL ? 'R$' : '$'}{cardCalculations.reduce((acc, c) => acc + c.totalLimit, 0).toLocaleString(isBRL?'pt-BR':'en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-surface-500">{isBRL ? 'Somando todos os cartões' : 'Sum of all cards'}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800">
                 <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-surface-500">{isBRL ? 'Utilizado' : 'Used'}</span>
                    <span className="font-medium">
                      {isBRL ? 'R$' : '$'}{cardCalculations.reduce((acc, c) => acc + c.usedLimit, 0).toLocaleString(isBRL?'pt-BR':'en-US', { minimumFractionDigits: 2 })}
                    </span>
                 </div>
                 <div className="h-1.5 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 transition-all duration-500" 
                      style={{ width: `${Math.min((cardCalculations.reduce((acc, c) => acc + c.usedLimit, 0) / cardCalculations.reduce((acc, c) => acc + c.totalLimit, 0) || 1) * 100, 100)}%` }}
                    />
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards List */}
        {cards.length === 0 && !showForm ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-brand-50 p-4 dark:bg-brand-900/20">
              <Lucide.CreditCard className="h-8 w-8 text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Nenhum cartão adicionado</h3>
            <p className="mt-1 max-w-sm text-sm text-surface-500 dark:text-surface-400">
              Adicione seus cartões de crédito para registrar transações vinculadas e receber notificações de fatura.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 btn-primary"
            >
              Adicionar Primeiro Cartão
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">Seus Cartões Atuais</h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Novo Cartão
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardCalculations.map(card => {
                const preset = PRESET_COLORS.find(c => c.id === card.color) || PRESET_COLORS[0]
                return (
                  <div key={card.id} className="space-y-4 animate-dashboard-fade">
                    <div className={`relative rounded-2xl bg-gradient-to-br ${preset.gradient} p-6 text-white shadow-lg ring-1 ring-white/10 overflow-hidden group min-h-[180px]`}>
                      {/* Subtle premium glows */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
                      <div className={`absolute -top-10 -right-10 w-24 h-24 bg-white/[0.07] rounded-full blur-2xl pointer-events-none`} />
                      <div className={`absolute -bottom-8 -left-8 w-24 h-24 bg-black/[0.08] rounded-full blur-xl pointer-events-none`} />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-2">
                             <Lucide.CreditCard className="h-5 w-5 text-white/80" />
                             <span className="font-medium text-white/90">{card.name}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleDelete(card.id)}
                            className="text-white/40 hover:text-white/90 transition-colors bg-white/5 hover:bg-white/10 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                            title="Excluir cartão"
                          >
                            <Lucide.Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="mb-6 flex gap-3">
                          <span className="text-lg tracking-widest text-white/60">••••</span>
                          <span className="text-lg tracking-widest text-white/60">••••</span>
                          <span className="text-lg tracking-widest text-white/60">••••</span>
                          <span className="text-lg tracking-widest font-mono text-white/90">{card.lastFourDigits}</span>
                        </div>
                        
                        <div className="mt-auto flex justify-between text-[10px] font-medium text-white/70 pt-4 border-t border-white/10 italic">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white/50">{isBRL ? 'Fechamento' : 'Closing'}</span>
                            <span>{isBRL ? 'Dia' : 'Day'} {card.closingDay}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 text-right">
                            <span className="text-white/50">{isBRL ? 'Vencimento' : 'Due'}</span>
                            <span>{isBRL ? 'Dia' : 'Day'} {card.dueDay}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Stats Below */}
                    <div className="card p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-surface-500 dark:text-surface-400 font-medium uppercase tracking-wider">{isBRL ? 'Fatura Atual' : 'Current Invoice'}</span>
                        <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                          {isBRL ? 'R$' : '$'}{card.currentInvoiceAmount.toLocaleString(isBRL?'pt-BR':'en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-surface-500">{isBRL ? 'Limite Utilizado' : 'Used Limit'}</span>
                          <span className="font-semibold text-surface-700 dark:text-surface-300">
                            {isBRL ? 'R$' : '$'}{card.usedLimit.toLocaleString(isBRL?'pt-BR':'en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${card.usagePercent > 90 ? 'bg-red-500' : card.usagePercent > 70 ? 'bg-amber-500' : 'bg-brand-500'}`} 
                            style={{ width: `${Math.min(card.usagePercent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-surface-400">
                          <span>{isBRL ? 'Disponível' : 'Available'}: {isBRL ? 'R$' : '$'}{card.availableLimit.toLocaleString(isBRL?'pt-BR':'en-US', { minimumFractionDigits: 2 })}</span>
                          <span>{isBRL ? 'Total' : 'Total'}: {isBRL ? 'R$' : '$'}{card.totalLimit.toLocaleString(isBRL?'pt-BR':'en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
              )})}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
