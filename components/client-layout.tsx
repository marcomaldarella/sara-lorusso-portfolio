"use client"

import { usePathname } from "next/navigation"
import Navigation from "./navigation"
import dynamic from "next/dynamic"
import { Analytics } from "@vercel/analytics/next"

const CookieBanner = dynamic(() => import("./cookie-banner"), { ssr: false })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith("/studio")
  const showNavigation = !isStudio && pathname !== "/landing"
  const hideNavName = pathname === "/" || pathname === "/about"

  return (
    <body className={`font-sans antialiased${isStudio ? " studio" : ""}`}>
      {showNavigation && <Navigation hideName={hideNavName} />}
      {children}
      {!isStudio && <CookieBanner />}
      {!isStudio && <Analytics />}
    </body>
  )
}
