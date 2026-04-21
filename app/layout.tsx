import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import ClientLayout from "@/components/client-layout"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const BASE_URL = "https://saralorusso.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sara Lorusso",
    template: "%s — Sara Lorusso",
  },
  description:
    "A visual practice exploring vulnerability through personal and collective experience.",
  openGraph: {
    title: "Sara Lorusso",
    description:
      "A visual practice exploring vulnerability through personal and collective experience.",
    url: BASE_URL,
    siteName: "Sara Lorusso",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Sara Lorusso",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sara Lorusso",
    description:
      "A visual practice exploring vulnerability through personal and collective experience.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "c0QiSPMViXRnGlVrSIwe9ulOrMJ5i9O04TGQgMExZzM",
  },
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sara Lorusso",
              url: BASE_URL,
            }),
          }}
        />
      </head>
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
