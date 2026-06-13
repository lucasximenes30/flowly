const SESSION_COOKIE_NAME = 'vynta_session_id';

// Simple implementation to manipulate cookies client-side without extra dependencies
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

export function getOrCreateSessionId(): string {
  let sessionId = getCookie(SESSION_COOKIE_NAME);
  
  if (!sessionId) {
    // Generate UUID, using crypto.randomUUID which is standard in modern browsers
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    setCookie(SESSION_COOKIE_NAME, sessionId, 30); // Valid for 30 days
  }
  
  return sessionId;
}

export async function trackFunnelEvent(eventName: string, metadata?: Record<string, any>) {
  try {
    const sessionId = getOrCreateSessionId();
    
    // Fire and forget
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        eventName,
        metadata
      }),
      // Use keepalive to ensure the request is sent even if the user navigates away
      keepalive: true,
    }).catch(() => {
      // Ignore network errors silently for analytics
    });
  } catch (err) {
    // Failsafe so analytics never break the app
  }
}
