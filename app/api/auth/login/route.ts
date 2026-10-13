export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
