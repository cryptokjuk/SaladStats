import { NextResponse } from 'next/server'
import { getSession, setSessionCookie, isSameOrigin } from '@/lib/session'

export const dynamic = 'force-dynamic'

/** Turns the opt-in "Stay signed in for 48 hours" option on/off by re-sealing the current session. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const remember = body?.remember === true
  const out = NextResponse.json({ success: true, remember })
  setSessionCookie(out, { salad: session.salad, email: session.email, username: session.username }, remember)
  return out
}
