import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { LoginForm } from './_components/login-form'

export default async function LoginPage() {
  if (await getSession()) {
    redirect('/dashboard')
  }
  return <LoginForm />
}
