import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description:
    "Sara Lorusso (b. 1995, Italy) is a photographer and visual artist living and working between Bologna and Milan. Published in Vogue Italia, Dazed, ID Magazine, British Journal of Photography.",
  openGraph: {
    title: "About — Sara Lorusso",
    description:
      "Sara Lorusso (b. 1995, Italy) is a photographer and visual artist living and working between Bologna and Milan. Published in Vogue Italia, Dazed, ID Magazine, British Journal of Photography.",
  },
  alternates: {
    canonical: "https://saralorusso.com/about",
  },
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sara Lorusso",
  jobTitle: "Photographer and Visual Artist",
  url: "https://saralorusso.com",
  sameAs: ["https://www.instagram.com/loruponyo/"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bologna",
    addressCountry: "IT",
  },
  worksFor: {
    "@type": "Organization",
    name: "Mulieris Magazine",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {children}
    </>
  )
}
