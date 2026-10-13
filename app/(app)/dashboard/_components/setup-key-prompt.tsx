'use client'

import { BrandMark } from '@/components/brand-logo'
import { SaladConnectForm } from '@/components/salad-connect-form'

export function SetupKeyPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-card border border-border card-soft flex items-center justify-center mb-6">
        <BrandMark className="w-11 h-11" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Connect Your Salad Account</h1>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">
        Sign in with your Salad email. We&apos;ll send you a code, just like on salad.com.
      </p>

      <div className="w-full max-w-sm bg-card rounded-xl p-6 border border-border card-soft">
        <SaladConnectForm />
      </div>
    </div>
  )
}
