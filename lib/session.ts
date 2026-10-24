import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { deflateRawSync, inflateRawSync } from 'zlib'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

/**
 * Database-free sign-in session.
 * After Salad verifies the emailed code, Salad's own session cookies are compressed and encrypted
 * (AES-256-GCM) into httpOnly cookie(s) on the visitor's device. Nothing is stored on the server.
 * The cookie has no Max-Age, so the browser drops it when the app/browser is closed,
 * and it carries a hard expiry so it can never live longer than SESSION_MAX_AGE_MS.
 */
export const SESSION_COOKIE = 'ss_session'
export const SESSION_MAX_AGE_MS = 60 * 60 * 1000 // 1 hour, then sign in again

export type AppSession = { salad: string; email: string; username: string | null; exp: number }

function key(): Buffer {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET must be set to a random value of at least 32 characters')
  return createHash('sha256').update(secret).digest()
}

function seal(data: AppSession): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(deflateRawSync(JSON.stringify(data))), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64url')
}

function unseal(value: string): AppSession | null {
  try {
    const buf = Buffer.from(value, 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12))
    decipher.setAuthTag(buf.subarray(12, 28))
    const json = inflateRawSync(Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()])).toString('utf8')
    const data = JSON.parse(json) as AppSession
    if (!data?.salad || typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' }
// Browsers cap a cookie at ~4KB, so a large sealed value is split across ss_session.0, .1, ...
const CHUNK = 3800
const MAX_CHUNKS = 6

/** Reads and verifies the current session (server components and route handlers). */
export async function getSession(): Promise<AppSession | null> {
  const jar = await cookies()
  let raw = ''
  for (let i = 0; i < MAX_CHUNKS; i++) {
    const part = jar.get(`${SESSION_COOKIE}.${i}`)?.value
    if (!part) break
    raw += part
  }
  return raw ? unseal(raw) : null
}

export function setSessionCookie(res: NextResponse, data: Omit<AppSession, 'exp'>) {
  const sealed = seal({ ...data, exp: Date.now() + SESSION_MAX_AGE_MS })
  const parts = sealed.match(new RegExp(`.{1,${CHUNK}}`, 'g')) ?? []
  if (parts.length > MAX_CHUNKS) throw new Error('Session too large')
  // No maxAge/expires => browser-session cookie (gone when the app is closed).
  for (let i = 0; i < MAX_CHUNKS; i++) {
    if (i < parts.length) res.cookies.set(`${SESSION_COOKIE}.${i}`, parts[i], cookieOptions)
    else res.cookies.set(`${SESSION_COOKIE}.${i}`, '', { ...cookieOptions, maxAge: 0 })
  }
}

export function clearSessionCookie(res: NextResponse) {
  for (let i = 0; i < MAX_CHUNKS; i++) res.cookies.set(`${SESSION_COOKIE}.${i}`, '', { ...cookieOptions, maxAge: 0 })
}

/** Rejects cross-site POSTs (basic CSRF protection). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
