import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SettingsClient } from './_components/settings-client'

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id ?? '' },
    select: { saladApiKey: true, name: true, email: true },
  })

  return (
    <SettingsClient
      hasKey={!!user?.saladApiKey}
      userName={user?.name ?? ''}
      userEmail={user?.email ?? ''}
    />
  )
}
