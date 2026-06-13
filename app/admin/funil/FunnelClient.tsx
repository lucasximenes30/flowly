'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import * as Lucide from 'lucide-react'

interface FunnelStep {
  name: string
  value: number
}

interface FunnelClientProps {
  funnel1Data: FunnelStep[]
  funnel2Data: FunnelStep[]
}

export default function FunnelClient({ funnel1Data, funnel2Data }: FunnelClientProps) {
  // Funil 1 (Aquisição)
  const totalIn1 = funnel1Data[0]?.value || 1
  const totalOut1 = funnel1Data[funnel1Data.length - 1]?.value || 0
  const overallConversion1 = ((totalOut1 / totalIn1) * 100).toFixed(1)

  // Funil 2 (Ativação)
  const totalIn2 = funnel2Data[0]?.value || 1 // purchase
  const totalOut2 = funnel2Data[1]?.value || 0 // dashboard_first_view
  const activationConversion = ((totalOut2 / totalIn2) * 100).toFixed(1)

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Funis de Conversão</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Acompanhamento da jornada do usuário em duas fases: Aquisição e Ativação.
        </p>
      </div>

      {/* --- FUNIL 1: AQUISIÇÃO --- */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white">Fase 1: Aquisição (Novos Usuários)</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-xl flex items-center justify-center">
                  <Lucide.Users className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-surface-500">Visitantes Únicos</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{funnel1Data[0]?.value || 0}</p>
               </div>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Lucide.ShoppingCart className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-surface-500">Vendas Concluídas</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{totalOut1}</p>
               </div>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center">
                  <Lucide.TrendingUp className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-surface-500">Conversão Global</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{overallConversion1}%</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel1Data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={150} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                />
                <Bar dataKey="value" name="Sessões Únicas" fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- FUNIL 2: ATIVAÇÃO --- */}
      <div className="space-y-6 pt-6 border-t border-surface-200 dark:border-surface-800">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white">Fase 2: Ativação (Compraram e Acessaram)</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                  <Lucide.LayoutDashboard className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-surface-500">Compraram & Ativaram</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{totalOut2} <span className="text-sm font-normal text-surface-400">de {funnel2Data[0]?.value || 0}</span></p>
               </div>
            </div>
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center">
                  <Lucide.Activity className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm text-surface-500">Taxa de Ativação</p>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{activationConversion}%</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm p-6">
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel2Data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={180} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                />
                <Bar dataKey="value" name="Sessões Únicas" fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
