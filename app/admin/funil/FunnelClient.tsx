'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import * as Lucide from 'lucide-react'

interface FunnelStep {
  name: string
  value: number
}

interface FunnelClientProps {
  data: FunnelStep[]
}

export default function FunnelClient({ data }: FunnelClientProps) {
  // Calcular conversões
  const totalIn = data[0]?.value || 1 // evitar div por 0
  const totalOut = data[data.length - 1]?.value || 0
  const overallConversion = ((totalOut / totalIn) * 100).toFixed(1)

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Funil de Conversão</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Acompanhamento etapa por etapa da jornada do usuário
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-4 sm:p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-xl flex items-center justify-center">
                <Lucide.Users className="w-5 h-5" />
             </div>
             <div>
                <p className="text-sm text-surface-500">Visitantes Únicos</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{data[0]?.value || 0}</p>
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
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{totalOut}</p>
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
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{overallConversion}%</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Jornada do Funil</h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={150} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              />
              <Bar dataKey="value" name="Sessões Únicas" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
