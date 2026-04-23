'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Do not show the admin sidebar on the login page
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">{children}</div>
  }

  const handleLogout = async () => {
    // We can use the existing /api/auth/logout route or similar.
    // Or just clear the cookie manually, but Next.js Server Actions or route handler is better.
    // Vynta should have a signout method. Let's redirect to /login which will usually clear or we can just fetch.
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Admin Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface-900 text-surface-200 flex flex-col border-r border-surface-800 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-surface-800">
          <span className="font-display font-bold text-xl tracking-tight text-white">Vynta Ops</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          <Link 
            href="/admin/users" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname.startsWith('/admin/users') 
                ? 'bg-brand-600 text-white font-medium' 
                : 'hover:bg-surface-800 hover:text-white'
            }`}
          >
            <Lucide.Users className="h-5 w-5" />
            <span>Usuários</span>
          </Link>

          {/* Add more admin links here in the future */}
        </nav>

        <div className="p-4 border-t border-surface-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors text-red-400 hover:bg-surface-800 hover:text-red-300"
          >
            <Lucide.LogOut className="h-5 w-5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center px-6 md:hidden">
          <span className="font-display font-bold tracking-tight">Vynta Ops</span>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
