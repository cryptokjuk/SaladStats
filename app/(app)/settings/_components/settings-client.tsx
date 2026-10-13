'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, Trash2, User, Mail, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SaladConnectForm } from '@/components/salad-connect-form'
import { AppearancePicker } from '@/components/appearance-picker'

export function SettingsClient({
  hasKey,
  userName,
  userEmail,
}: {
  hasKey: boolean
  userName: string
  userEmail: string
}) {
  const router = useRouter()
  const [removingKey, setRemovingKey] = useState(false)
  const handleRemoveKey = async () => {
    setRemovingKey(true)
    try {
      const res = await fetch('/api/salad-key', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Salad token removed')
        router.refresh()
      } else {
        toast.error('Failed to remove key')
      }
    } catch (err: any) {
      toast.error('Failed to remove key')
    } finally {
      setRemovingKey(false)
    }
  }

  const handleSignOut = async () => {
    // Clear service worker caches
    if (typeof navigator !== 'undefined' && navigator?.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHES')
    }
    await signOut({ redirectTo: '/login' })
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
        <div className="flex items-center gap-2 mb-4">
          {hasKey ? (
            <>
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">Not connected</span>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {hasKey ? 'Sign in again with your Salad email code if your stats stop loading.' : 'Sign in with your Salad email to connect.'}
        </p>
        <SaladConnectForm />

        {hasKey && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="mt-4"
            onClick={handleRemoveKey}
            disabled={removingKey}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {removingKey ? 'Disconnecting...' : 'Disconnect Salad'}
          </Button>
        )}
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
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
