import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: "Available for commissions and editorial work. Based in Bologna, Italy.",
  openGraph: {
    title: "Contact — Sara Lorusso",
    description: "Available for commissions and editorial work. Based in Bologna, Italy.",
  },
  alternates: {
    canonical: "https://saralorusso.com/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
