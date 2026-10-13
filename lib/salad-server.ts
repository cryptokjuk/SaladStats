// Server-only helpers for talking to Salad's Chef API (the API behind app.salad.io).
export const SALAD_API_BASE = 'https://app-api.salad.com/api'

// Mirror the headers the official web app (app.salad.io) sends.
export const SALAD_BROWSER_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  Origin: 'https://app.salad.io',
  Referer: 'https://app.salad.io/',
  // Salad's API rejects cookie-authenticated requests (403) unless this anti-forgery header is present.
  'X-XSRF-TOKEN': '1',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
}

/** Accepts a raw token, "Bearer <token>", or a full cookie string copied from the browser. */
export function buildSaladHeaders(stored: string): Record<string, string> {
  let value = stored.trim()
  if (/^cookie:/i.test(value)) value = value.replace(/^cookie:\s*/i, '')
  if (/^authorization:/i.test(value)) value = value.replace(/^authorization:\s*/i, '')
  value = value.replace(/^bearer\s+/i, '')

  const headers: Record<string, string> = { ...SALAD_BROWSER_HEADERS }
  if (value.includes('=')) {
    // Full cookie string, e.g. "auth=...; other=..." — sent as-is, exactly like the browser does.
    headers.Cookie = value
  } else {
    headers.Authorization = `Bearer ${value}`
    headers.Cookie = `auth=${value}; sAccessToken=${value}`
  }
  return headers
}

export async function saladFetch(stored: string, path: string) {
  const res = await fetch(`${SALAD_API_BASE}/${path.replace(/^\//, '')}`, {
    headers: buildSaladHeaders(stored),
    cache: 'no-store',
  })
  let data: any = null
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('json')) data = await res.json().catch(() => null)
  else await res.text().catch(() => '')
  return { ok: res.ok, status: res.status, data }
}

export interface EarningPoint {
  timestamp: string
  earned: number
}

/** Normalizes the various shapes of Salad's earning history into a sorted array. */
export function normalizeEarnings(raw: any): EarningPoint[] {
  if (!raw) return []
  let list: any[] = []
  if (Array.isArray(raw)) list = raw
  else if (Array.isArray(raw?.items)) list = raw.items
  else if (Array.isArray(raw?.data)) list = raw.data
  else if (Array.isArray(raw?.earnings)) list = raw.earnings
  else if (typeof raw === 'object') {
    list = Object.entries(raw).map(([k, v]) => ({ timestamp: k, earnings: v }))
  }
  return list
    .map((e: any) => {
      const ts = e?.timestamp ?? e?.date ?? e?.time ?? e?.createdAt
      const val = e?.earnings ?? e?.earned ?? e?.amount ?? e?.value ?? 0
      const d = new Date(ts)
      if (!ts || isNaN(d.getTime())) return null
      return { timestamp: d.toISOString(), earned: Number(val) || 0 }
    })
    .filter((x: EarningPoint | null): x is EarningPoint => x !== null)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

/** Hourly rate from the most recent hour of data, plus a 24h average. */
export function computeRates(points: EarningPoint[]) {
  if (points.length === 0) return { currentHourly: 0, avgHourly24h: 0, last24h: 0, last7d: 0, last30d: 0 }
  const times = points.map((p) => new Date(p.timestamp).getTime())
  const latest = times[times.length - 1]
  const HOUR = 3600_000

  const diffs: number[] = []
  for (let i = 1; i < times.length; i++) diffs.push(times[i] - times[i - 1])
  diffs.sort((a, b) => a - b)
  const interval = diffs.length ? diffs[Math.floor(diffs.length / 2)] : HOUR

  const sumSince = (ms: number) =>
    points.reduce((s, p, i) => (times[i] > latest - ms ? s + p.earned : s), 0)

  const currentHourly =
    interval >= HOUR ? points[points.length - 1].earned / (interval / HOUR) : sumSince(HOUR)
  const last24h = sumSince(24 * HOUR)
  return {
    currentHourly,
    avgHourly24h: last24h / 24,
    last24h,
    last7d: sumSince(7 * 24 * HOUR),
    last30d: sumSince(30 * 24 * HOUR),
  }
}
