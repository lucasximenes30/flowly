import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/habits', '/reports', '/cards', '/workout']
const publicRoutes = ['/', '/login', '/register', '/sucesso', '/esqueci-a-senha']

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value
  const path = request.nextUrl.pathname

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login')
  const isForcePasswordRoute = path === '/force-password-change'

  if (isAdminRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const session = await verifyToken(sessionToken)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isProtectedRoute || isForcePasswordRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const session = await verifyToken(sessionToken)
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Handle force password change flow
    if (session.forcePasswordChange && !isForcePasswordRoute && !isAdminRoute) {
      return NextResponse.redirect(new URL('/force-password-change', request.url))
    }
    
    if (!session.forcePasswordChange && isForcePasswordRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isProtectedRoute) {
      const isPaidActive = session.subscriptionStatus === 'ACTIVE';
      const isPrivileged = session.role === 'COURTESY' || session.role === 'ADMIN';

      if (!isPaidActive && !isPrivileged) {
        return NextResponse.redirect(new URL('/login?error=inactive', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/habits/:path*', '/reports/:path*', '/cards/:path*', '/workout/:path*', '/admin/:path*', '/force-password-change'],
}
