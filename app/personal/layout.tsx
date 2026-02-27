import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Personal Work",
  description:
    "Photography as a tool for slow observation, exploring intimacy, femininity and affective relationships.",
  openGraph: {
    title: "Personal Work — Sara Lorusso",
    description:
      "Photography as a tool for slow observation, exploring intimacy, femininity and affective relationships.",
  },
  alternates: {
    canonical: "https://saralorusso.com/personal",
  },
}

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
