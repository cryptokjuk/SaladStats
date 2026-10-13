'use client'

import { Sun, Moon, Smartphone } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMounted } from '@/components/client-only'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Device', icon: Smartphone },
]

export function AppearancePicker() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const current = mounted ? theme ?? 'dark' : ''

  return (
    <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-secondary">
      {options.map((o) => {
        const Icon = o.icon
        const active = current === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={active}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              active ? 'bg-card text-foreground card-soft' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
