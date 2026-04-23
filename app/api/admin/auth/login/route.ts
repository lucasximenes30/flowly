import { NextResponse } from 'next/server'
import { setSession, JWTPayload } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (email === 'admin' && password === '9925518') {
      const payload: JWTPayload = {
        userId: 'admin-system',
        email: 'admin@vynta.com',
        name: 'Administrador',
        role: 'ADMIN',
        subscriptionStatus: 'ACTIVE',
      }

      const token = await setSession(payload)

      return NextResponse.json({
        user: { 
          id: payload.userId, 
          name: payload.name, 
          email: payload.email, 
          role: payload.role 
        }, 
        token 
      })
    }

    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
