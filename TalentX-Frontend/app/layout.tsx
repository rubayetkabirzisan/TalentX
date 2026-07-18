import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Toaster } from "@/components/ui/toaster"
import { RealtimeProvider } from "@/components/realtime-provider"
import { MessagingWidget } from "@/components/messaging-widget"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'TalentX — AI Job Marketplace',
  description: 'AI-powered job matching platform connecting top tech talent with the best opportunities.',
  keywords: ['jobs', 'tech jobs', 'AI matching', 'talent marketplace', 'hire developers'],
  openGraph: {
    title: 'TalentX — AI Job Marketplace',
    description: 'Find your perfect tech job match with AI-powered recommendations.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RealtimeProvider>
            <Navbar />
            {children}
            <Toaster />
            <MessagingWidget />
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}