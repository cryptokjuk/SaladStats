export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { SALAD_API_BASE, SALAD_BROWSER_HEADERS } from '@/lib/salad-server'

export type GpuDemand = {
  name: string
  displayName: string
  tier: string
  tierName: string
  avgRate: number | null
  top25Rate: number | null
  minRate: number | null
  maxRate: number | null
  utilizationPct: number | null
  ramGb: number | null
  variants: string[]
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

// Salad uses 'high' | 'mid' | 'low' for demandTier; map to our filter keys.
function normalizeTier(tier: unknown, name: unknown): string {
  const t = String(tier ?? '').toLowerCase()
  const n = String(name ?? '').toLowerCase()
  if (t === 'high' || n === 'high') return 'high'
  if (['mid', 'medium', 'moderate'].includes(t) || n === 'moderate') return 'moderate'
  if (t === 'low' || n === 'low') return 'low'
  return t || 'unknown'
}

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch(`${SALAD_API_BASE}/v2/demand-monitor/gpu`, {
      headers: { Accept: 'application/json', 'User-Agent': SALAD_BROWSER_HEADERS['User-Agent'] },
      next: { revalidate: 300 },
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !Array.isArray(data)) {
      console.error('Salad demand fetch failed:', res.status)
      return NextResponse.json({ error: 'Could not load GPU demand from Salad' }, { status: 502 })
    }
    const gpus: GpuDemand[] = data.map((g: any) => ({
      name: String(g?.name ?? ''),
      displayName: String(g?.displayName ?? g?.name ?? 'Unknown GPU'),
      tier: normalizeTier(g?.demandTier, g?.demandTierName),
      tierName: String(g?.demandTierName ?? g?.demandTier ?? 'Unknown'),
      avgRate: num(g?.earningRates?.avgEarningRate),
      top25Rate: num(g?.earningRates?.top25PctEarningRate),
      minRate: num(g?.earningRates?.minEarningRate),
      maxRate: num(g?.earningRates?.maxEarningRate),
      utilizationPct: num(g?.utilizationPct),
      ramGb: num(g?.recommendedSpecs?.ramGb),
      variants: Array.isArray(g?.variantNames) ? g.variantNames.map(String) : [],
    }))
    return NextResponse.json({ gpus, fetchedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Salad demand error:', error)
    return NextResponse.json({ error: 'Could not reach Salad' }, { status: 502 })
  }
}
