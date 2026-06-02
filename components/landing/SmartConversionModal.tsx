'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, X } from 'lucide-react'

interface SmartConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartConversionModal({ isOpen, onClose }: SmartConversionModalProps) {
  const router = useRouter()

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-auth-fade">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-surface-950 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="p-6 md:p-8 flex items-start justify-between border-b border-white/5">
          <div>
            <h2 className="text-3xl font-display font-semibold text-white tracking-tight">Tem certeza?</h2>
            <p className="mt-2 text-surface-400 max-w-xl">
              Você pode testar grátis por 3 dias, mas o plano <span className="text-brand-400 font-semibold">VIP</span> já libera todos os recursos essenciais para organizar sua vida sem interrupções.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-surface-500 hover:text-white transition-colors bg-surface-800/50 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Free Trial */}
          <div className="rounded-2xl border border-surface-800 bg-surface-900/50 p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Free Trial</h3>
              <p className="text-sm text-surface-400">Para dar uma olhada rápida.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-2 text-surface-300 text-sm">
                <span className="text-yellow-500 mt-0.5">⚠️</span> Apenas 3 dias
              </li>
              <li className="flex items-start gap-2 text-surface-300 text-sm">
                <span className="text-yellow-500 mt-0.5">⚠️</span> Recursos limitados
              </li>
              <li className="flex items-start gap-2 text-surface-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Finanças, Hábitos, Treinos
              </li>
              <li className="flex items-start gap-2 text-surface-600 text-sm">
                <X className="w-4 h-4 shrink-0 mt-0.5" /> Sem Metas, Agenda, Notas
              </li>
            </ul>
            <button 
              onClick={() => router.push('/register?plan=trial')} 
              className="w-full py-3 text-sm font-semibold text-surface-300 border border-surface-700 rounded-full hover:bg-surface-800 transition-colors"
            >
              Continuar teste grátis
            </button>
          </div>

          {/* VIP */}
          <div className="rounded-2xl border border-brand-500/30 bg-brand-900/10 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-[50px]" />
            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">VIP</h3>
                <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">R$ 19,90</span>
              </div>
              <p className="text-sm text-surface-400">O essencial garantido para sempre.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1 relative z-10">
              {['Finanças inteligentes', 'Gestão de Hábitos', 'Módulo de Treinos', 'Sem limite de tempo'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-surface-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => router.push('/register?plan=vip')} 
              className="relative z-10 w-full py-3 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors"
            >
              Assinar VIP
            </button>
          </div>

          {/* PRO */}
          <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-900/20 to-transparent p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 blur-[60px]" />
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[0.65rem] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
              Recomendado
            </div>
            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-white">PRO</h3>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">R$ 29,90</span>
              </div>
              <p className="text-sm text-surface-300">O sistema completo de vida.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1 relative z-10">
              <li className="flex items-start gap-2 text-white text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Tudo incluso +
              </li>
              {['Sistema de Metas', 'Agenda Completa', 'Segundo Cérebro (Notas)'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-surface-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => router.push('/register?plan=pro')} 
              className="relative z-10 w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-black bg-white hover:bg-surface-200 rounded-full transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
              Assinar PRO <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
