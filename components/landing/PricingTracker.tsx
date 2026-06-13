'use client'

import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { trackFunnelEvent } from '@/lib/funnel'

export default function PricingTracker() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  useEffect(() => {
    if (isInView) {
      trackFunnelEvent('plan_viewed', { source: 'landing_page' })
    }
  }, [isInView])

  return <div ref={ref} className="h-1 w-full pointer-events-none" />
}
