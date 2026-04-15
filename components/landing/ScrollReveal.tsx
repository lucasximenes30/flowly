'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from './MagneticButton' // reuse class merger

export default function ScrollReveal({
  children,
  delay = 0,
  className,
  once = true,
  yOffset = 64
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  once?: boolean
  yOffset?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-15%' })

  return (
    <motion.div
      ref={ref}
      initial={{ y: yOffset, filter: 'blur(12px)', opacity: 0 }}
      animate={isInView ? { y: 0, filter: 'blur(0px)', opacity: 1 } : { y: yOffset, filter: 'blur(12px)', opacity: 0 }}
      transition={{
        duration: 0.9,
        ease: [0.32, 0.72, 0, 1], // Custom agency-tier cubic bezier
        delay: delay,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
