'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

async function post(body: Record<string, string>) {
  const res = await fetch('/api/salad-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

/** Signs in to Salad with the same email + emailed-code flow as app.salad.io. */
export function SaladConnectForm({ onConnected }: { onConnected?: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const { ok, data } = await post({ step: 'start', email: email.trim() })
      if (!ok) return void toast.error(data?.error ?? 'Could not send code')
      toast.success('Code sent! Check your email.')
      setStep('code')
    } catch (err) {
      console.error(err)
      toast.error('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      const { ok, data } = await post({ step: 'verify', code: code.trim() })
      if (!ok) return void toast.error(data?.error ?? 'Could not verify code')
      if (data?.ticket) {
        // Not signed in yet: exchange the one-time ticket for an app session
        const result = await signIn('salad', { ticket: data.ticket, redirect: false })
        if (result?.error) return void toast.error('Could not complete sign-in. Please request a new code.')
        toast.success(data?.username ? `Welcome, ${data.username}!` : 'Signed in!')
        router.replace('/dashboard')
        return
      }
      toast.success(data?.username ? `Connected as ${data.username}!` : 'Salad account connected!')
      setCode('')
      setStep('email')
      onConnected?.()
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <form onSubmit={verify} className="space-y-4 text-left">
        <p className="text-sm text-muted-foreground">
          We asked Salad to email a sign-in code to <span className="text-foreground font-medium" suppressHydrationWarning>{email}</span>.
          Enter it below.
        </p>
        <div className="space-y-2">
          <Label htmlFor="saladCode" className="text-sm">Code from email</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="saladCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter code"
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              className="pl-10 bg-secondary border-border font-mono tracking-widest"
              autoFocus
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full salad-gradient text-accent-foreground font-semibold hover:brightness-105" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Connect'}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={() => setStep('email')} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Change email
          </button>
          <button type="button" onClick={() => sendCode()} disabled={loading} className="text-primary hover:underline">
            Resend code
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={sendCode} className="space-y-4 text-left">
      <div className="space-y-2">
        <Label htmlFor="saladEmail" className="text-sm">Salad account email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="saladEmail"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="pl-10 bg-secondary border-border"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full salad-gradient text-accent-foreground font-semibold hover:brightness-105" disabled={loading}>
        {loading ? 'Sending code...' : 'Send me a code'}
        {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Salad will email you a one-time code, just like when signing in to your Salad.com summary page.
        <br />
        All data is stored locally on the user&apos;s own device.
        <br />
        By continuing you agree to Salad&apos;s terms of service.
        <br />
        No data is collected/stored or sold to third parties when using this app.
      </p>
    </form>
  )
}
