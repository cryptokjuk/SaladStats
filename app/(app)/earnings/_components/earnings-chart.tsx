'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { useTheme } from 'next-themes'

export default function EarningsChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  const tickColor = dark ? '#9fb0bb' : '#61727f'
  const chartData = (data ?? []).map((e: any) => ({
    date: e?.timestamp ? new Date(e.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
    earned: Number(e?.earned ?? 0),
  }))

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b2d530" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#b2d530" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: tickColor }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: tickColor }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v?.toFixed?.(2) ?? '0'}`}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: 11,
            color: 'hsl(var(--foreground))',
            boxShadow: '0 4px 12px -2px rgb(10 33 51 / 0.12)',
          }}
          formatter={(v: any) => [`$${Number(v)?.toFixed?.(4) ?? '0'}`, 'Earned']}
        />
        <Area
          type="monotone"
          dataKey="earned"
          stroke={dark ? '#b2d530' : '#53a626'}
          strokeWidth={2}
          fill="url(#greenGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
