'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import MagneticButton from './MagneticButton'
import SmartConversionModal from './SmartConversionModal'

export default function SmartCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <MagneticButton 
          intensity={0.4}
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }} 
        >
          <div className="group w-full sm:w-auto inline-flex justify-between items-center rounded-full bg-white text-[#050505] px-6 sm:px-8 py-4 font-bold shadow-lg text-sm sm:text-base cursor-pointer">
            <span>Testar grátis</span>
            <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center ml-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
              <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
            </span>
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
