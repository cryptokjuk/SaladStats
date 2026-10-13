import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

// Optional: creates a local email/password test account.
// Set SEED_TEST_EMAIL and SEED_TEST_PASSWORD in your .env, then run `yarn prisma db seed`.
async function main() {
  const email = process.env.SEED_TEST_EMAIL
  const password = process.env.SEED_TEST_PASSWORD
  if (!email || !password) {
    console.log('SEED_TEST_EMAIL / SEED_TEST_PASSWORD not set - nothing to seed')
    return
  }
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Test User', password: await bcrypt.hash(password, 12) },
  })
  console.log('Seed completed')
}

main()
  .catch((e: any) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
