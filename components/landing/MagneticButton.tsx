'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function MagneticButton({ 
  children, 
  href,
  className,
  intensity = 0.5
}: { 
  children: React.ReactNode
  href?: string
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Motion values to avoid React re-renders during high-freq mouse events
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for natural, heavy movement
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const hitX = e.clientX - rect.left
    const hitY = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    x.set((hitX - centerX) * intensity)
    y.set((hitY - centerY) * intensity)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.98 }}
      className={cn("relative group block w-fit shrink-0", className)}
    >
      {href ? (
        <Link href={href} className="block w-full h-full cursor-pointer outline-none">
          {children}
        </Link>
      ) : (
        <button className="block w-full h-full cursor-pointer outline-none">
          {children}
        </button>
      )}
    </motion.div>
  )
}
