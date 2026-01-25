"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { usePathname } from "next/navigation"
import Navigation from "@/components/navigation"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const showNavigation = pathname !== "/landing"

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {showNavigation && <Navigation />}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
