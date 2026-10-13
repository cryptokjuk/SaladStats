export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

import { SALAD_API_BASE, buildSaladHeaders } from '@/lib/salad-server'

async function proxyToSalad(req: NextRequest, params: Promise<{ path: string[] }>) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { saladApiKey: true },
  })

  if (!user?.saladApiKey) {
    return NextResponse.json({ error: 'No Salad API key configured' }, { status: 400 })
  }

  const { path } = await params
  const saladPath = path?.join('/') ?? ''
  const url = `${SALAD_API_BASE}/${saladPath}`

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { ...buildSaladHeaders(user.saladApiKey), 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    } else {
      const text = await response.text()
      return new NextResponse(text, { status: response.status })
    }
  } catch (error: any) {
    console.error('Salad API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to reach Salad API', details: error?.message ?? 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyToSalad(req, ctx.params)
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxyToSalad(req, ctx.params)
}
