import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider, ToastContainer } from '@/context/NotificationContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'OpenClaw - AI Gateway Control Surface',
  description: 'Self-hosted AI gateway with multi-provider routing, channel orchestration, and full operational control.',
  themeColor: '#060609',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
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
