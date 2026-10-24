import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  redirect((await getSession()) ? '/dashboard' : '/login')
}
