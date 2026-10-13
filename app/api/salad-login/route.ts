export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SALAD_API_BASE, saladFetch, SALAD_BROWSER_HEADERS } from '@/lib/salad-server'

// Short-lived cookie (on our domain) holding Salad's pending sign-in session between the two steps.
const PENDING_COOKIE = 'salad_pending_session'
const COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: 'none' as const, path: '/api/salad-login' }

function cookiePairs(res: Response): string[] {
  const list = typeof (res.headers as any).getSetCookie === 'function' ? (res.headers as any).getSetCookie() : []
  return (list as string[]).map((c) => c.split(';')[0].trim()).filter((c) => c.includes('='))
}

function mergeCookies(...groups: string[][]): string {
  const map = new Map<string, string>()
  for (const g of groups) for (const pair of g) {
    const i = pair.indexOf('=')
    if (i > 0) map.set(pair.slice(0, i), pair.slice(i + 1))
  }
  return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
}

function saladError(data: any, fallback: string): string {
  const type = String(data?.type ?? '')
  if (type.startsWith('emailSend:rejected')) return 'Salad could not send a code to that email address. Check it is the email on your Salad account.'
  if (type === 'invalid_session') return 'Your sign-in session expired. Please request a new code.'
  if (/passcode|code/i.test(type) || /code/i.test(String(data?.title ?? ''))) return 'That code is incorrect or has expired. Try again or request a new code.'
  return data?.detail ?? data?.title ?? fallback
}

function readPending(req: NextRequest): { email: string; cookie: string } {
  try {
    const raw = req.cookies.get(PENDING_COOKIE)?.value
    const parsed = raw ? JSON.parse(raw) : null
    return { email: String(parsed?.email ?? ''), cookie: String(parsed?.cookie ?? '') }
  } catch {
    return { email: '', cookie: '' }
  }
}

/**
 * Two-step Salad sign-in (same as app.salad.io):
 *  step "start"  -> Salad emails a one-time code
 *  step "verify" -> code is exchanged for a Salad session.
 * If the visitor is already signed in to this app, the Salad session is attached to their account.
 * Otherwise an account is found/created for the Salad email and a one-time login ticket is returned.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const step = body?.step

  try {
    if (step === 'start') {
      const email = String(body?.email ?? '').trim().toLowerCase()
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
      }
      const res = await fetch(`${SALAD_API_BASE}/v2/authentication-sessions`, {
        method: 'POST',
        headers: { ...SALAD_BROWSER_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, termsAccepted: true }),
        cache: 'no-store',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        console.error('Salad start sign-in failed:', res.status, data)
        return NextResponse.json({ error: saladError(data, 'Salad could not start sign-in') }, { status: 400 })
      }
      const out = NextResponse.json({ success: true })
      out.cookies.set(PENDING_COOKIE, JSON.stringify({ email, cookie: mergeCookies(cookiePairs(res)) }), {
        ...COOKIE_OPTS, maxAge: 15 * 60,
      })
      return out
    }

    if (step === 'verify') {
      const code = String(body?.code ?? '').replace(/\s+/g, '')
      if (!code) return NextResponse.json({ error: 'Please enter the code from your email' }, { status: 400 })
      const pending = readPending(req)
      const res = await fetch(`${SALAD_API_BASE}/v2/authentication-sessions/verification`, {
        method: 'POST',
        headers: {
          ...SALAD_BROWSER_HEADERS,
          'Content-Type': 'application/json',
          ...(pending.cookie ? { Cookie: pending.cookie } : {}),
        },
        body: JSON.stringify({ passcode: code }),
        cache: 'no-store',
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        console.error('Salad verify failed:', res.status, data)
        return NextResponse.json({ error: saladError(data, 'Salad rejected the code') }, { status: 400 })
      }

      const verifyCookies = cookiePairs(res)
      console.log('Salad verify ok; cookies set:', verifyCookies.map((c) => c.split('=')[0]).join(', ') || '(none)',
        '| body keys:', data && typeof data === 'object' ? Object.keys(data).join(', ') : typeof data)
      // The sign-in init token is only for the two sign-in steps; keep the real session cookies.
      let stored = mergeCookies(verifyCookies.filter((c) => !c.startsWith('sInitToken=')))
      const bodyToken = data?.token ?? data?.accessToken ?? data?.access_token
      if (!stored && bodyToken) stored = String(bodyToken)
      if (!stored) stored = mergeCookies(pending.cookie ? pending.cookie.split(/;\s*/) : [], verifyCookies)
      if (!stored) {
        return NextResponse.json({ error: 'Signed in, but Salad did not return a session. Please try again.' }, { status: 502 })
      }

      const profile = await saladFetch(stored, 'v1/profile')
      if (!profile.ok) {
        console.error('Salad profile check after sign-in failed:', profile.status, profile.data?.type ?? '', profile.data?.title ?? '')
        return NextResponse.json({ error: 'Signed in, but Salad would not return your profile. Please try again.' }, { status: 502 })
      }
      const username: string | null = profile.data?.username ?? null

      const session = await auth()
      let ticket: string | null = null
      if (session?.user?.id) {
        await prisma.user.update({ where: { id: session.user.id }, data: { saladApiKey: stored } })
      } else {
        const email = String(profile.data?.email ?? pending.email ?? '').trim().toLowerCase()
        if (!email) {
          return NextResponse.json({ error: 'Your sign-in session expired. Please request a new code.' }, { status: 400 })
        }
        const user = await prisma.user.upsert({
          where: { email },
          update: { saladApiKey: stored, ...(username ? { name: username } : {}) },
          create: { email, name: username, saladApiKey: stored, emailVerified: new Date() },
        })
        ticket = randomBytes(32).toString('hex')
        await prisma.verificationToken.create({
          data: { identifier: `salad-login:${user.id}`, token: ticket, expires: new Date(Date.now() + 2 * 60 * 1000) },
        })
      }

      const out = NextResponse.json({ success: true, username, ticket })
      out.cookies.set(PENDING_COOKIE, '', { ...COOKIE_OPTS, maxAge: 0 })
      return out
    }

    return NextResponse.json({ error: 'Unknown step' }, { status: 400 })
  } catch (error: any) {
    console.error('Salad sign-in error:', error)
    return NextResponse.json({ error: 'Could not reach Salad. Please try again.' }, { status: 502 })
  }
}
