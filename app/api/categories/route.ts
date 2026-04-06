import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserCategories, createCategory, seedDefaultCategories } from '@/services/category.service'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await seedDefaultCategories()

  const { defaults, custom } = await getUserCategories(session.userId)

  return NextResponse.json({ categories: [...defaults, ...custom] })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, icon, color } = body

  if (!name || !icon || !color) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const category = await createCategory({
      name,
      icon,
      color,
      userId: session.userId,
    })

    return NextResponse.json({ success: true, category })
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
