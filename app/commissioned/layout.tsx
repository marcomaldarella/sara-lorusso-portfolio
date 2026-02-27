import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Commissioned",
  description:
    "Commercial photography for Vans, Nike, Slam Jam, Carhartt WIP, Motorola, Puma and Levi's.",
  openGraph: {
    title: "Commissioned — Sara Lorusso",
    description:
      "Commercial photography for Vans, Nike, Slam Jam, Carhartt WIP, Motorola, Puma and Levi's.",
  },
  alternates: {
    canonical: "https://saralorusso.com/commissioned",
  },
}

export default function CommissionedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
