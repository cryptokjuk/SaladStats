import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    // Main sign-in: one-time ticket issued by /api/salad-login after Salad's emailed code is verified.
    CredentialsProvider({
      id: 'salad',
      name: 'salad',
      credentials: { ticket: { label: 'Ticket', type: 'text' } },
      async authorize(credentials: any) {
        const ticket = typeof credentials?.ticket === 'string' ? credentials.ticket : ''
        if (!ticket) return null
        const record = await prisma.verificationToken.findUnique({ where: { token: ticket } })
        if (!record || !record.identifier.startsWith('salad-login:')) return null
        await prisma.verificationToken.delete({ where: { token: ticket } }).catch(() => null)
        if (record.expires.getTime() < Date.now()) return null
        const user = await prisma.user.findUnique({ where: { id: record.identifier.slice('salad-login:'.length) } })
        if (!user) return null
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user?.password) return null
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session?.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
