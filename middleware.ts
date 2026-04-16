import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/habits', '/reports', '/cards', '/workout']
const publicRoutes = ['/', '/login', '/register', '/sucesso', '/esqueci-a-senha']

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value
  const path = request.nextUrl.pathname

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  if (isProtectedRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verify token payload at Edge and check if subscription is ACTIVE or user has privilege
    const session = await verifyToken(sessionToken)
    
    if (!session) {
      // Invalid session
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const isPaidActive = session.subscriptionStatus === 'ACTIVE';
    const isLegacyOrCourtesy = session.role === 'LEGACY' || session.role === 'COURTESY' || session.role === 'ADMIN';

    if (!isPaidActive && !isLegacyOrCourtesy) {
      // Billing is not active and not an internal/legacy user
      return NextResponse.redirect(new URL('/login?error=inactive', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/habits/:path*', '/reports/:path*', '/cards/:path*', '/workout/:path*'],
}
