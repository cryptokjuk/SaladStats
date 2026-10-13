export interface SaladProfile {
  id?: string
  username?: string
  email?: string
  extensions?: Record<string, any>
  [key: string]: any
}

export interface SaladBalance {
  currentBalance?: number
  lifetimeBalance?: number
  [key: string]: any
}

export interface SaladEarning {
  timestamp?: string
  earned?: number
  [key: string]: any
}

export interface SaladRates {
  currentHourly: number
  avgHourly24h: number
  last24h: number
  last7d: number
  last30d: number
}

export interface SaladMachineStatus {
  total: number
  online: number
  earning: number
}
export interface DashboardData {
  profile: SaladProfile | null
  balance: SaladBalance | null
  earnings: SaladEarning[]
  rates?: SaladRates
  machines?: SaladMachineStatus | null
  lastUpdated: string
  errors: string[]
  expired?: boolean
}
