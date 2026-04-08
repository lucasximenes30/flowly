import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/habits', '/reports', '/cards']
const publicRoutes = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const path = request.nextUrl.pathname

  if (protectedRoutes.some((route) => path.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/habits/:path*', '/reports/:path*', '/cards/:path*'],
}
