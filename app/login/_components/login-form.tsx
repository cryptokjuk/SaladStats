'use client'

import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { SaladConnectForm } from '@/components/salad-connect-form'
import { BuyMeCoffee } from '@/components/buy-me-coffee'

export function LoginForm() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="fixed z-50 top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))]">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mb-5">
            <BrandLogo size="lg" />
          </div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-2">Chef earnings tracker</p>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Chef</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in with your Salad account</p>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border card-soft">
          <SaladConnectForm />
        </div>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed mt-4">
          This app is not associated with Salad.com, this is purely a &quot;fan&quot; built app.
        </p>
        <BuyMeCoffee className="mt-4" />
        <p className="text-[11px] text-muted-foreground text-center mt-3 pb-[env(safe-area-inset-bottom)]">
          Built By{' '}
          <a
            href="https://x.com/CryptoKj_UK"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            CryptoKJ
          </a>{' '}
          &amp; AI
        </p>
      </div>
    </div>
  )
}
