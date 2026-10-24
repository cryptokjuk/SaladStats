import { getSession } from '@/lib/session'
import { SettingsClient } from './_components/settings-client'

export default async function SettingsPage() {
  const session = await getSession()
  return <SettingsClient userName={session?.username ?? ''} userEmail={session?.email ?? ''} />
}
