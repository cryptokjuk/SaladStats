export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'

export async function POST() {
  const res = NextResponse.json({ success: true })
  clearSessionCookie(res)
  return res
}
