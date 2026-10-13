import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { EarningsClient } from './_components/earnings-client'

export default async function EarningsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id ?? '' },
    select: { saladApiKey: true },
  })
  if (!user?.saladApiKey) {
    redirect('/dashboard')
  }
  return <EarningsClient />
}
