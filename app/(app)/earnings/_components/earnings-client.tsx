'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'

const EarningsChart = dynamic(() => import('./earnings-chart'), { ssr: false, loading: () => <div className="h-48 bg-card rounded-xl animate-pulse" /> })

export function EarningsClient() {
  const [earnings, setEarnings] = useState<any[]>([])
  const [balance, setBalance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/salad/stats', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (res.ok) {
          const all: any[] = Array.isArray(json?.earnings) ? json.earnings : []
          const cutoff = Date.now() - 12 * 60 * 60 * 1000
          setEarnings(all.filter((e: any) => new Date(e?.timestamp ?? 0).getTime() >= cutoff))
          setBalance(json?.balance ?? null)
        } else {
          setError(json?.error ?? 'Could not load Salad data')
        }
      } catch (err: any) {
        console.error('Earnings fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i: number) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
            <div className="h-4 bg-secondary rounded w-24 mb-3" />
            <div className="h-8 bg-secondary rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  const totalEarned = (earnings ?? []).reduce((s: number, e: any) => s + (Number(e?.earned) || 0), 0)
  const currentBalance = balance?.currentBalance ?? 0
  const lifetimeBalance = balance?.lifetimeBalance ?? 0

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">Earnings</h1>
      <p className="text-xs text-muted-foreground mb-4">
        Past 12 hours · <span className="font-mono text-primary">${totalEarned.toFixed(4)}</span> earned
      </p>
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-accent/60 glow-green-box min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Balance</span>
          </div>
          <p className="text-[clamp(1rem,5vw,1.25rem)] font-bold font-mono text-primary glow-green break-all">
            ${currentBalance?.toFixed?.(4) ?? '0.0000'}
          </p>
        </div>
        <div className="bg-card rounded-xl p-3 sm:p-4 border border-border min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Lifetime</span>
          </div>
          <p className="text-[clamp(1rem,5vw,1.25rem)] font-bold font-mono text-foreground break-all">
            ${lifetimeBalance?.toFixed?.(2) ?? '0.00'}
          </p>
        </div>
      </div>

      {/* Chart */}
      {(earnings?.length ?? 0) > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last 12 Hours</h2>
          <div className="bg-card rounded-xl p-2 sm:p-4 border border-border min-w-0 overflow-hidden" style={{ height: 240 }}>
            <EarningsChart data={earnings} />
          </div>
        </div>
      )}

      {/* History List */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">History</h2>
        {(earnings?.length ?? 0) === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No earnings in the past 12 hours</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...(earnings ?? [])].reverse().slice(0, 100).map((e: any, i: number) => (
              <div key={i} className="bg-card rounded-xl p-3 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {e?.timestamp ? new Date(e.timestamp).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : `Entry ${i + 1}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-mono text-primary font-semibold">
                  +${Number(e?.earned ?? 0)?.toFixed?.(4) ?? '0.0000'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
