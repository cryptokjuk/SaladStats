import { Work_Sans, Spline_Sans_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { Providers } from '@/components/providers'

export const dynamic = "force-dynamic";

// Optional: set NEXT_PUBLIC_GA_MEASUREMENT_ID to enable Google Analytics
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700', '800'] })
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '600', '700'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Salad Stats',
  description: 'Track your Salad.com earnings on the go',
  icons: {
    icon: '/salad-stats-logo-icon.svg',
    shortcut: '/salad-stats-logo-icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Salad Stats',
    description: 'Track your Salad.com earnings on the go',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Salad Stats',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf5' },
    { media: '(prefers-color-scheme: dark)', color: '#061624' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
              }}
            />
          </>
        )}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(e){console.error('SW registration failed:',e)})})}",
          }}
        />
      </head>
      <body className={`${workSans.variable} ${splineMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <ChunkLoadErrorHandler />
        </Providers>
      </body>
    </html>
  )
}
