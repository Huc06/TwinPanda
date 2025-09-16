import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/components/auth/auth-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'AR NFT RWA - Pawn Shop Platform',
  description: 'Decentralized pawn shop platform with AR asset scanning and NFT collateralization',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <Providers>
          <AuthProvider>
            {children}
            <Toaster />
            <Analytics />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
