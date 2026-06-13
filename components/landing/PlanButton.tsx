'use client'

import MagneticButton from './MagneticButton'
import { trackFunnelEvent } from '@/lib/funnel'

export default function PlanButton({ 
  href, 
  tier, 
  intensity = 0.2, 
  children,
  className
}: { 
  href: string
  tier: 'vip' | 'pro' | 'pro_yearly'
  intensity?: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <MagneticButton 
      href={href} 
      intensity={intensity}
      className={className}
      onClick={() => trackFunnelEvent('checkout_started', { planTier: tier, source: 'landing_page' })}
    >
      {children}
    </MagneticButton>
  )
}
