import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? process.env.SITE_URL ?? 'http://localhost:3000'
  const siteUrl = host.startsWith('http') ? host : `https://${host}`
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/login'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
