import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { AppShellClient } from './_components/app-shell-client'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return (
    <AppShellClient userName={session.username ?? session.email ?? 'Chef'}>
      {children}
    </AppShellClient>
  )
}
