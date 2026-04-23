'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar, { NAV_ITEMS } from './Sidebar'
import BrandLogo from './BrandLogo'
import * as Lucide from 'lucide-react'

// Routes where the sidebar should NOT appear
const NO_SIDEBAR_ROUTES = ['/', '/login', '/register', '/admin']

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const showSidebar = !NO_SIDEBAR_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )

  // Close drawer when route changes
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  if (!showSidebar) return <>{children}</>

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile Navbar - only visible on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-surface-200/80 bg-white px-4 transition-colors dark:border-surface-800 dark:bg-surface-900">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Open menu"
        >
          <Lucide.Menu className="h-6 w-6" />
        </button>
        <span className="ml-2 font-display text-base font-semibold tracking-tight text-surface-900 dark:text-surface-100">
          Vynta
        </span>
      </div>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Side Panel */}
      <aside 
        className={`md:hidden fixed left-0 top-0 h-full w-[84%] max-w-xs bg-white dark:bg-surface-900 z-[70] transition-transform duration-300 ease-out shadow-2xl border-r border-surface-200/80 dark:border-surface-800 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-6 pb-8 px-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <BrandLogo size="lg" textClassName="font-display" priority />
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Lucide.X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ Icon, label, href, match }) => {
              const isActive = match(pathname)
              return (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto px-2">
             <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-700/40">
                <p className="text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">Versão Premium</p>
                <div className="flex items-center gap-2 text-surface-700 dark:text-surface-200">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-sm font-semibold tracking-tight">Vynta Pro</span>
                </div>
             </div>
          </div>
        </div>
      </aside>

      <Sidebar />
      {/* Offset content on desktop (pl-16), and add top padding on mobile (pt-16) for the fixed navbar */}
      <div className="flex-1 min-w-0 md:pl-16 pt-16 md:pt-0">
        {children}
      </div>
    </div>
  )
}
