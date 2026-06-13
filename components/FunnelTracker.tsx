'use client';

import { useEffect, useRef } from 'react';
import { trackFunnelEvent } from '@/lib/funnel';

interface FunnelTrackerProps {
  eventName: string;
  metadata?: Record<string, any>;
  onceKey?: string; // If provided, ensures the event is only fired once per session based on localStorage
}

export default function FunnelTracker({ eventName, metadata, onceKey }: FunnelTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    
    if (onceKey) {
      const storageKey = `vynta_funnel_${onceKey}`;
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, 'true');
    }

    firedRef.current = true;
    trackFunnelEvent(eventName, metadata);
  }, [eventName, metadata, onceKey]);

  return null;
}
