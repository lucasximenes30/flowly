'use client'

import Link from 'next/link'
import MagneticButton from './MagneticButton'

export default function HeaderActions() {
  return (
    <div className="flex justify-end gap-1.5 sm:gap-4 items-center">
      <Link href="/login" className="text-[11px] sm:text-sm font-semibold text-surface-400 hover:text-white transition-colors duration-300 px-1 sm:px-0">
        Entrar
      </Link>
      
      <MagneticButton 
        intensity={0.2}
        href="/register?mode=trial"
      >
         <div className="rounded-full bg-transparent hover:bg-white/5 border border-white/20 px-3 py-1.5 sm:px-6 sm:py-2.5 text-[11px] sm:text-sm font-semibold flex items-center justify-center text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">
           Testar grátis
         </div>
      </MagneticButton>

      <MagneticButton href="#planos" intensity={0.2}>
         <div className="rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] px-3 py-1.5 sm:px-6 sm:py-2.5 text-[11px] sm:text-sm font-bold flex items-center justify-center text-white transition-colors duration-300 whitespace-nowrap shadow-[0_4px_15px_rgba(124,58,237,0.4)]">
           Desbloquear<span className="hidden sm:inline">&nbsp;acesso</span>
         </div>
      </MagneticButton>
    </div>
  )
}
