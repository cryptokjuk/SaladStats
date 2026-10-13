'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, TrendingUp, Gauge, Settings } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { BuyMeCoffee } from '@/components/buy-me-coffee'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/earnings', label: 'Earnings', icon: TrendingUp },
  { href: '/demand', label: 'Demand', icon: Gauge },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppShellClient({
  children,
  userName,
}: {
  children: React.ReactNode
  userName: string
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col w-full overflow-x-hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between gap-3 px-4 h-16 max-w-lg mx-auto pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0" aria-label="Salad Stats home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs text-muted-foreground truncate max-w-[110px] min-w-0">{userName}</span>
            <ThemeToggle className="shrink-0" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full min-w-0 px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        {children}
        <BuyMeCoffee className="mt-8" />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_16px_-8px_rgb(10_33_51/0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item: typeof navItems[number]) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-1 sm:px-3 py-1.5 min-w-0 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`flex items-center justify-center w-10 sm:w-12 h-7 rounded-full transition-colors ${isActive ? 'bg-accent/40' : ''}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
