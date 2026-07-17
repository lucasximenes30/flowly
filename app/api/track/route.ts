import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';

async function getUserIdFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('vynta_token')?.value;
    
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jose.jwtVerify(token, secret);
    
    return payload.userId as string || payload.id as string || null;
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, eventName, metadata } = body;

    if (!sessionId || !eventName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to attach user ID if authenticated
    const userId = await getUserIdFromToken();

    await prisma.funnelEvent.create({
      data: {
        sessionId,
        eventName,
        userId,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Return 200 even on error so we don't break the client with fire-and-forget
    console.error('[Funnel Tracking Error]', error);
    return NextResponse.json({ success: false });
  }
}
