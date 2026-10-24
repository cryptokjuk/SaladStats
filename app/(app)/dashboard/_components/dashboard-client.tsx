'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DollarSign, Zap, Clock, RefreshCw, TrendingUp, AlertCircle, Monitor } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import type { DashboardData } from '@/lib/salad-types'

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  highlight,
}: {
  icon: any
  label: string
  value: string
  subValue?: string
  highlight?: boolean
}) {
  return (
    <div className={`bg-card rounded-xl p-3 sm:p-4 border min-w-0 overflow-hidden transition-all hover:border-primary/30 ${
      highlight ? 'glow-green-box border-accent/60' : 'card-soft border-border'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
          highlight ? 'salad-gradient' : 'bg-secondary'
        }`}>
          <Icon className={`w-4 h-4 ${highlight ? 'text-accent-foreground' : 'text-primary'}`} />
        </div>
        <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className={`text-[clamp(1rem,5vw,1.5rem)] leading-tight font-bold font-mono tracking-tight break-all ${
        highlight ? 'text-primary glow-green' : 'text-foreground'
      }`}>
        {value}
      </p>
      {subValue && (
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">{subValue}</p>
      )}
    </div>
  )
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/salad/stats', { cache: 'no-store' })
      if (res.status === 401) return void window.location.replace('/login')
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setData({
          profile: null, balance: null, earnings: [],
          lastUpdated: new Date().toISOString(),
          errors: [json?.error ?? 'Could not load Salad data'],
          expired: !!json?.expired,
        })
      } else {
        setData({
          profile: json?.profile ?? null,
          balance: json?.balance ?? null,
          earnings: Array.isArray(json?.earnings) ? [...json.earnings].reverse() : [],
          rates: json?.rates,
          machines: json?.machines ?? null,
          lastUpdated: json?.lastUpdated ?? new Date().toISOString(),
          errors: json?.errors ?? [],
        })
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
      setData({
        profile: null, balance: null, earnings: [],
        lastUpdated: new Date().toISOString(), errors: ['Network error'],
      })
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Pull to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches?.[0]?.clientY ?? 0)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = (e.touches?.[0]?.clientY ?? 0) - touchStart
    if (diff > 0 && typeof window !== 'undefined' && window.scrollY === 0) {
      setPullDistance(Math.min(diff, 100))
    }
  }
  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      fetchData(true)
    }
    setPullDistance(0)
  }

  const currentBalance = data?.balance?.currentBalance ?? 0
  const lifetimeBalance = data?.balance?.lifetimeBalance ?? 0
  const earningRate = data?.rates?.currentHourly ?? 0
  const avgHourly = data?.rates?.avgHourly24h ?? 0
  const last24h = data?.rates?.last24h ?? 0
  const last7d = data?.rates?.last7d ?? 0
  const username = data?.profile?.username ?? data?.profile?.email ?? ''
  const machines = data?.machines ?? null
  const machinesOnline = machines?.online ?? 0

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i: number) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
            <div className="h-4 bg-secondary rounded w-24 mb-3" />
            <div className="h-8 bg-secondary rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div className="flex justify-center py-2">
          <RefreshCw className={`w-5 h-5 text-primary transition-transform ${pullDistance > 60 ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3.6}deg)` }}
          />
        </div>
      )}

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          {username ? `Hey, ${username}` : 'Dashboard'}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <ClientOnly fallback={<span className="text-xs text-muted-foreground">Loading...</span>}>
            <LastUpdated dateStr={data?.lastUpdated ?? ''} />
          </ClientOnly>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="text-primary hover:text-primary/80 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Errors */}
      {(data?.errors?.length ?? 0) > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {data?.errors?.join(' · ')}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={DollarSign}
          label="Balance"
          value={`$${currentBalance?.toFixed?.(4) ?? '0.0000'}`}
          subValue="Available"
          highlight
        />
        <StatCard
          icon={TrendingUp}
          label="Lifetime"
          value={`$${lifetimeBalance?.toFixed?.(2) ?? '0.00'}`}
          subValue="Total earned"
        />
        <StatCard
          icon={Zap}
          label="Hourly"
          value={`$${earningRate.toFixed(4)}/hr`}
          subValue={`24h avg $${avgHourly.toFixed(4)}/hr`}
          highlight={earningRate > 0}
        />
        <StatCard
          icon={Clock}
          label="Last 24h"
          value={`$${last24h.toFixed(4)}`}
          subValue={`7d $${last7d.toFixed(2)}`}
        />
      </div>

      {/* Machines Currently Online */}
      <div className="bg-card rounded-xl p-4 border border-border card-soft mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${machinesOnline > 0 ? 'salad-gradient glow-green-box' : 'bg-secondary'}`}>
            <Monitor className={`w-5 h-5 ${machinesOnline > 0 ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Machines Currently Online</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {machines
                ? `${machines.earning} earning · ${machines.total} machine${machines.total === 1 ? '' : 's'} total`
                : 'Machine status unavailable'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {machinesOnline > 0 && <span className="w-2 h-2 rounded-full bg-[#53a626] animate-pulse" />}
          <span className={`text-3xl font-bold font-mono ${machinesOnline > 0 ? 'text-primary glow-green' : 'text-foreground'}`}>
            {machines ? machinesOnline : '–'}
          </span>
        </div>
      </div>
      {/* Recent Earnings Preview */}
      {(data?.earnings?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Earnings</h2>
          <div className="space-y-2">
            {(data?.earnings ?? []).slice(0, 5).map((e: any, i: number) => (
              <div key={i} className="bg-card rounded-xl p-3 border border-border card-soft flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {e?.timestamp ? new Date(e.timestamp).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : `Entry ${i + 1}`}
                </span>
                <span className="text-sm font-mono text-primary font-semibold">
                  +${Number(e?.earned ?? 0)?.toFixed?.(4) ?? '0.0000'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LastUpdated({ dateStr }: { dateStr: string }) {
  if (!dateStr) return <span className="text-xs text-muted-foreground">--</span>
  const d = new Date(dateStr)
  return (
    <span className="text-xs text-muted-foreground">
      Updated {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}
