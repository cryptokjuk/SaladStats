import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AppShellClient } from './_components/app-shell-client'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return (
    <>
      <AppShellClient userName={session.user.name ?? session.user.email ?? 'User'}>
        {children}
      </AppShellClient>
    </>
  )
}
