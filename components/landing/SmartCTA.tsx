'use client'

import { ArrowRight } from 'lucide-react'
import MagneticButton from './MagneticButton'
import { trackFunnelEvent } from '@/lib/funnel'

export default function SmartCTA() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-6">
      <MagneticButton 
        intensity={0.4}
        href="/register?plan=trial"
        onClick={() => trackFunnelEvent('cta_click', { component: 'SmartCTA' })}
      >
        <div className="group w-full sm:w-auto inline-flex justify-between items-center rounded-full bg-white text-[#050505] px-6 sm:px-8 py-4 font-bold shadow-lg text-sm sm:text-base cursor-pointer">
          <span>Testar grátis</span>
          <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center ml-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
            <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
          </span>
        </div>
      </MagneticButton>
    </div>
  )
}
