'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Usamos o scroll absoluto da janela já que o Hero fica no topo
  const { scrollY } = useScroll()

  // Crossfade mais espaçado e controlado baseado em pixels de scroll
  const dashboardOpacity = useTransform(scrollY, [50, 250], [1, 0])
  const financeOpacity = useTransform(scrollY, [150, 350], [0, 1])
  
  // Efeito Parallax sutil
  const yDashboard = useTransform(scrollY, [0, 400], [0, -40])
  const yFinance = useTransform(scrollY, [0, 400], [40, 0])
  
  return (
    <div ref={containerRef} className="relative w-full grid perspective-[1000px]">
      
      {/* Dashboard (First Image) */}
      <motion.div 
        style={{ opacity: dashboardOpacity, y: yDashboard }}
        className="col-start-1 row-start-1 p-1.5 md:p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 ring-1 ring-black/10 shadow-2xl origin-bottom z-10"
      >
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/5 flex items-center justify-center">
          <Image src="/images/painel V2.png" alt="Vynta Dashboard" width={1200} height={800} className="hidden md:block w-full h-auto object-cover pointer-events-none" priority />
          <Image src="/images/Painel Mobile V2.jpeg" alt="Vynta Dashboard Mobile" width={800} height={1200} className="block md:hidden w-full h-auto object-cover pointer-events-none" priority />
        </div>
      </motion.div>

      {/* Finance (Second Image) */}
      <motion.div 
        style={{ opacity: financeOpacity, y: yFinance }}
        className="col-start-1 row-start-1 p-1.5 md:p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 ring-1 ring-black/10 shadow-2xl origin-bottom z-20"
      >
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/5 flex items-center justify-center">
          <Image src="/images/Finanças V2.png" alt="Vynta Finance" width={1200} height={800} className="hidden md:block w-full h-auto object-cover pointer-events-none" priority />
          <Image src="/images/Finanças Mobile V2.jpeg" alt="Vynta Finance Mobile" width={800} height={1200} className="block md:hidden w-full h-auto object-cover pointer-events-none" priority />
        </div>
      </motion.div>

    </div>
  )
}
