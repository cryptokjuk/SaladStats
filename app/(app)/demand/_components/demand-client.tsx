'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, Cpu, Flame } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { GpuDemand } from '@/app/api/salad/demand/route'

type Tier = 'all' | 'high' | 'moderate' | 'low'
type Sort = 'rate' | 'busy' | 'name'

const tierStyles: Record<string, string> = {
  high: 'bg-accent text-accent-foreground',
  moderate: 'bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200',
  low: 'bg-secondary text-muted-foreground',
}

const money = (v: number | null, d = 3) => (v == null ? '—' : `$${v.toFixed(d)}`)

export function DemandClient() {
  const [gpus, setGpus] = useState<GpuDemand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<Tier>('all')
  const [sort, setSort] = useState<Sort>('rate')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/salad/demand', { cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(json?.gpus)) setGpus(json.gpus)
      else setError(json?.error ?? 'Could not load GPU demand')
    } catch (err) {
      console.error('Demand fetch error:', err)
      setError('Could not load GPU demand')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: gpus.length, high: 0, moderate: 0, low: 0 }
    gpus.forEach((g) => { if (g.tier in c) c[g.tier]++ })
    return c
  }, [gpus])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = gpus.filter(
      (g) =>
        (tier === 'all' || g.tier === tier) &&
        (!q || g.displayName.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)),
    )
    return list.sort((a, b) => {
      if (sort === 'name') return a.displayName.localeCompare(b.displayName)
      if (sort === 'busy') return (b.utilizationPct ?? -1) - (a.utilizationPct ?? -1)
      return (b.avgRate ?? -1) - (a.avgRate ?? -1)
    })
  }, [gpus, query, tier, sort])

  const tiers: { key: Tier; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High' },
    { key: 'moderate', label: 'Moderate' },
    { key: 'low', label: 'Low' },
  ]
  const sorts: { key: Sort; label: string }[] = [
    { key: 'rate', label: 'Avg rate' },
    { key: 'busy', label: 'Busiest' },
    { key: 'name', label: 'Name' },
  ]

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-xl font-bold tracking-tight">GPU Demand</h1>
        <button
          onClick={load}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Refresh GPU demand"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Live demand and earning rates for every GPU on Salad&apos;s network ({counts.all} GPUs). Rates are per hour.
      </p>

      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GPUs, e.g. 4090"
          className="pl-9"
          aria-label="Search GPUs"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-2 -mx-1 px-1">
        {tiers.map((t) => (
          <button
            key={t.key}
            onClick={() => setTier(t.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tier === t.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label} <span className="font-mono opacity-80">{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="font-mono uppercase tracking-wider text-muted-foreground text-[10px]">Sort</span>
        {sorts.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`rounded-md px-2 py-1 transition-colors ${sort === s.key ? 'text-primary font-semibold bg-accent/30' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4 text-destructive text-sm">{error}</div>
      )}

      {loading && gpus.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse h-28" />
          ))}
        </div>
      ) : shown.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground text-center py-10">No GPUs match your search.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((g) => {
            const util = g.utilizationPct
            return (
              <li key={g.name || g.displayName} className="bg-card rounded-xl p-3 sm:p-4 border border-border card-soft min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Cpu className="w-4 h-4 text-primary shrink-0" />
                    <h2 className="font-semibold text-sm truncate">{g.displayName}</h2>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tierStyles[g.tier] ?? tierStyles.low}`}>
                    {g.tier === 'high' && <Flame className="w-3 h-3" />}
                    {g.tierName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Avg/hr</p>
                    <p className="font-mono font-bold text-primary text-[clamp(0.9rem,4vw,1.05rem)]">{money(g.avgRate)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Top 25%</p>
                    <p className="font-mono font-semibold text-[clamp(0.9rem,4vw,1.05rem)]">{money(g.top25Rate)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Range</p>
                    <p className="font-mono text-xs leading-6 truncate">
                      {money(g.minRate, 2)}–{money(g.maxRate, 2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">Busy</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-[#53a626]" style={{ width: `${Math.min(100, Math.max(0, util ?? 0))}%` }} />
                  </div>
                  <span className="font-mono text-xs shrink-0 w-10 text-right">{util == null ? '—' : `${util}%`}</span>
                </div>

                {(g.ramGb != null || g.variants.length > 0) && (
                  <p className="text-[11px] text-muted-foreground mt-2 truncate">
                    {g.ramGb != null && <>Recommended RAM: {g.ramGb} GB</>}
                    {g.ramGb != null && g.variants.length > 0 && ' · '}
                    {g.variants.length > 0 && <>Also: {g.variants.join(', ')}</>}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <p className="text-[11px] text-muted-foreground mt-4 text-center">Source: Salad&apos;s public demand monitor.</p>
    </div>
  )
}
