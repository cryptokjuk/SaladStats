import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { DashboardClient } from './_components/dashboard-client'
import { SetupKeyPrompt } from './_components/setup-key-prompt'

export default async function DashboardPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id ?? '' },
    select: { saladApiKey: true },
  })
  const hasKey = !!user?.saladApiKey

  if (!hasKey) {
    return <SetupKeyPrompt />
  }

  return <DashboardClient />
}
