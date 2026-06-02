'use client'

import { useState } from 'react'
import Link from 'next/link'
import MagneticButton from './MagneticButton'
import SmartConversionModal from './SmartConversionModal'

export default function HeaderActions() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex justify-end gap-1.5 sm:gap-4 items-center">
        <Link href="/login" className="text-[11px] sm:text-sm font-semibold text-surface-400 hover:text-white transition-colors duration-300 px-1 sm:px-0">
          Entrar
        </Link>
        
        <MagneticButton 
          intensity={0.2}
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
        >
           <div className="rounded-full bg-white text-[#050505] px-3 py-1.5 sm:px-6 sm:py-2.5 text-[11px] sm:text-sm font-bold flex items-center justify-center transition-colors duration-300 cursor-pointer shadow-lg whitespace-nowrap">
             Testar grátis
           </div>
        </MagneticButton>

        <MagneticButton href="#planos" intensity={0.2}>
           <div className="rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 sm:px-6 sm:py-2.5 text-[11px] sm:text-sm font-semibold flex items-center justify-center text-white transition-colors duration-300 whitespace-nowrap">
             Desbloquear<span className="hidden sm:inline">&nbsp;acesso</span>
           </div>
        </MagneticButton>
      </div>
      
      <SmartConversionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
