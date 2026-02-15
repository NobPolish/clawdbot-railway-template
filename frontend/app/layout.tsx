import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider, ToastContainer } from '@/context/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clawdbot - AI Authorization Platform',
  description: 'Secure, intelligent authorization and seamless onboarding with AI-powered features',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
