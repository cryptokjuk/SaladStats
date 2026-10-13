export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { saladFetch, normalizeEarnings, computeRates } from '@/lib/salad-server'

const MINUTE = 60_000

/**
 * Counts machines online/earning, using the same endpoints as Salad's own web app:
 * v2/machines -> { items: [{ machine_id, update_time }], continuation_token }
 * v2/machines/{id}/earnings/5-minutes -> earnings in the last 5 minutes (x12 = hourly rate).
 */
async function getMachineStatus(stored: string) {
  try {
    const items: any[] = []
    let token: string | undefined
    for (let page = 0; page < 5; page++) {
      const res = await saladFetch(stored, `v2/machines${token ? `?continuation_token=${encodeURIComponent(token)}` : ''}`)
      if (!res.ok) {
        console.error('Salad machines fetch failed:', res.status)
        return null
      }
      const list = Array.isArray(res.data) ? res.data : res.data?.items ?? []
      items.push(...list)
      token = res.data?.continuation_token ?? undefined
      if (!token) break
    }

    const now = Date.now()
    const lastSeen = (m: any) => new Date(m?.update_time ?? m?.updateTime ?? 0).getTime() || 0
    // Salad's own app only lists machines active in the last 32 days.
    const known = items.filter((m) => (m?.machine_id ?? m?.machineId) && now - lastSeen(m) < 32 * 24 * 60 * MINUTE)
    const recent = known.filter((m) => now - lastSeen(m) < 24 * 60 * MINUTE)

    const rates = await Promise.all(
      recent.map(async (m) => {
        const id = String(m.machine_id ?? m.machineId)
        const r = await saladFetch(stored, `v2/machines/${encodeURIComponent(id)}/earnings/5-minutes`)
        const raw = typeof r.data === 'number' ? r.data : Number(r.data?.earnings ?? r.data?.value ?? r.data ?? 0)
        return { lastSeen: lastSeen(m), hourly: r.ok && Number.isFinite(raw) ? raw * 12 : 0 }
      })
    )

    const earning = rates.filter((r) => r.hourly > 0).length
    const online = rates.filter((r) => r.hourly > 0 || now - r.lastSeen < 15 * MINUTE).length
    return { total: known.length, online, earning }
  } catch (error) {
    console.error('Salad machine status error:', error)
    return null
  }
}
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { saladApiKey: true },
  })
  if (!user?.saladApiKey) {
    return NextResponse.json({ error: 'No Salad token configured' }, { status: 400 })
  }

  try {
    const [profile, balance, history, machines] = await Promise.all([
      saladFetch(user.saladApiKey, 'v1/profile'),
      saladFetch(user.saladApiKey, 'v1/profile/balance'),
      saladFetch(user.saladApiKey, 'v2/reports/30-day-earning-history'),
      getMachineStatus(user.saladApiKey),
    ])

    if (profile.status === 401 || balance.status === 401) {
      return NextResponse.json(
        { error: 'Your Salad token has expired or is invalid. Please sign in to Salad again in Settings.', expired: true },
        { status: 401 }
      )
    }

    const earnings = normalizeEarnings(history.data)
    const rates = computeRates(earnings)
    const errors: string[] = []
    if (!profile.ok) errors.push('Profile unavailable')
    if (!balance.ok) errors.push('Balance unavailable')
    if (!history.ok) errors.push('Earning history unavailable')

    return NextResponse.json({
      profile: profile.ok ? profile.data : null,
      balance: balance.ok ? balance.data : null,
      earnings,
      rates,
      machines,
      errors,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Salad stats error:', error)
    return NextResponse.json({ error: 'Failed to reach Salad', details: error?.message }, { status: 502 })
  }
}
