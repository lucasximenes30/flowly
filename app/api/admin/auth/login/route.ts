import { NextResponse } from 'next/server'
import { setSession, JWTPayload } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Erro de configuração do servidor.' },
        { status: 500 }
      );
    }

    if (email === 'admin' && password === adminPassword) {
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
