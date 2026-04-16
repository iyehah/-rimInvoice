import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Arabic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import '@/styles/globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'RimInvoice - Invoice Management for Mauritania',
  description: 'Create and manage professional invoices with support for local payment methods like Bankily, Seddad, Masrvi, and BimBank.',
  keywords: ['invoice', 'Mauritania', 'Bankily', 'Seddad', 'billing', 'فاتورة', 'موريتانيا'],
  authors: [{ name: 'Iyehah Hacen' }],
  icons: {
    icon: [
      {
        url: '/logo.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.svg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${notoArabic.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
