'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

// Routes where the sidebar should NOT appear
const NO_SIDEBAR_ROUTES = ['/', '/login', '/register']

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )

  if (!showSidebar) return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Offset content so it doesn't hide behind the 64px sidebar */}
      <div className="flex-1 min-w-0 pl-16">
        {children}
      </div>
    </div>
  )
}
