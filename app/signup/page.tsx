import { redirect } from 'next/navigation'

// Accounts are created automatically when you sign in with Salad's emailed code.
export default function SignupPage() {
  redirect('/login')
}
