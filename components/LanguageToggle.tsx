'use client'

import { useApp } from '@/lib/i18n'

const languages = [
  { value: 'pt-BR' as const, label: 'PT-BR', flag: '🇧🇷' },
  { value: 'en' as const, label: 'EN', flag: '🇺🇸' },
]

export default function LanguageToggle() {
  const { locale, setLocale } = useApp()

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={() => setLocale(lang.value)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
            locale === lang.value
              ? 'bg-brand-600 text-white shadow-md dark:bg-brand-500 dark:shadow-brand-500/20'
              : 'bg-white text-surface-600 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
          }`}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}
