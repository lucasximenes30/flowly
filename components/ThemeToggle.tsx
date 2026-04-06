'use client'

import { useApp } from '@/lib/i18n'

const themes = [
  { value: 'light' as const, icon: '🌤️', label: 'Claro' },
  { value: 'system' as const, icon: '💻', label: 'Automático' },
  { value: 'dark' as const, icon: '🌙', label: 'Escuro' },
]

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, t } = useApp()

  return (
    <div className="flex gap-2">
      {themes.map((option) => {
        const isActive = theme === option.value
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            title={option.label}
            className={`flex h-11 w-11 items-center justify-center rounded-xl text-base transition-all duration-200 ${
              isActive
                ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500 dark:shadow-brand-500/20'
                : 'bg-white text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200'
            }`}
          >
            {option.icon}
          </button>
        )
      })}
    </div>
  )
}
