'use client'

import { useState } from 'react'
import { LogOut, User, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AppearancePicker } from '@/components/appearance-picker'

export function SettingsClient({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    // Clear service worker caches
    if (typeof navigator !== 'undefined' && navigator?.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHES')
    }
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (err) {
      console.error('Sign out error:', err)
      toast.error('Could not sign out. Please try again.')
      setSigningOut(false)
      return
    }
    window.location.replace('/login')
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight mb-6">Settings</h1>

      {/* Account Info */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{userName || 'No name set'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm" suppressHydrationWarning>{userEmail}</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Appearance</h2>
        <AppearancePicker />
      </div>

      {/* API Key */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Salad Account</h2>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Connected for this session</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Nothing is saved on our server. Your sign-in is kept only on this device and ends when you close the app,
          sign out, or after 10 minutes, whichever comes first.
        </p>
      </div>

      {/* About */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h2>
        <p className="text-sm text-muted-foreground">
          Salad Stats is a progressive web app for tracking your Salad.com earnings. Install it on your phone&apos;s home screen for quick access.
        </p>
        <p className="text-xs text-muted-foreground mt-2">By using this app you agree to Salad&apos;s terms of service.</p>
      </div>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {signingOut ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  )
}
