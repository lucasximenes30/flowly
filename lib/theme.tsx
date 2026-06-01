'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const THEME_STORAGE_KEY = 'vynta_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (saved && ['light', 'dark', 'system'].includes(saved)) setTheme(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const resolvedTheme = (() => {
    if (theme === 'light') return 'light' as const
    if (theme === 'dark') return 'dark' as const
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      return 'dark' as const
    return 'light' as const
  })()

  // Sync dark class on html element
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [resolvedTheme])

  // Listen for system theme changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        setTheme((prev) => prev) // force re-render
      }
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
