'use client'

import { useRouter, usePathname } from 'next/navigation'
import * as Lucide from 'lucide-react'

const NAV_ITEMS = [
  {
    Icon: Lucide.LayoutDashboard,
    label: 'Financeiro',
    href: '/dashboard',
    match: (p: string) =>
      p.startsWith('/dashboard') || p.startsWith('/reports') || p.startsWith('/cards'),
  },
  {
    Icon: Lucide.CheckSquare,
    label: 'Hábitos',
    href: '/habits',
    match: (p: string) => p.startsWith('/habits'),
  },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 z-40 flex flex-col items-center pt-3 pb-4 gap-1 bg-white dark:bg-surface-900 border-r border-surface-200/80 dark:border-surface-800 transition-colors duration-300">
      {/* Brand mark */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white text-sm font-bold shadow-sm select-none">
        F
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 w-full px-2">
        {NAV_ITEMS.map(({ Icon, label, href, match }) => {
          const isActive = match(pathname)
          return (
            <div key={href} className="relative group">
              <button
                onClick={() => router.push(href)}
                className={`w-full flex items-center justify-center h-11 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-200'
                }`}
                title={label}
              >
                <Icon className="h-5 w-5" />
              </button>
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-surface-900 dark:bg-surface-700 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-900 dark:border-r-surface-700" />
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
