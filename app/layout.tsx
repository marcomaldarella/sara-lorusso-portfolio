"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { usePathname } from "next/navigation"
import Navigation from "@/components/navigation"
import "./globals.css"
import dynamic from 'next/dynamic'

const CookieBanner = dynamic(() => import('@/components/cookie-banner'), { ssr: false })

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const showNavigation = pathname !== "/landing" && pathname !== "/"

  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦪</text></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sara Lorusso - Portfolio Fotografico" />
        <title>Sara Lorusso - Portfolio</title>
      </head>
      <body className={`font-sans antialiased`}>
        {showNavigation && <Navigation />}
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
