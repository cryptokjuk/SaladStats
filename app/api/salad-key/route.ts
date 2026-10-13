export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { saladFetch } from '@/lib/salad-server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { saladApiKey: true },
  })
  return NextResponse.json({ hasKey: !!user?.saladApiKey })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { apiKey } = await req.json()
  if (!apiKey || typeof apiKey !== 'string') {
    return NextResponse.json({ error: 'Salad token is required' }, { status: 400 })
  }
  const token = apiKey.trim()

  // Validate the token against Salad's Chef API
  try {
    const res = await saladFetch(token, 'v1/profile')
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Salad rejected this token. Make sure you are logged in at app.salad.io and copied the full value.' },
        { status: 400 }
      )
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not reach Salad to validate the token' }, { status: 502 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { saladApiKey: token },
  })
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { saladApiKey: null },
  })
  return NextResponse.json({ success: true })
}
