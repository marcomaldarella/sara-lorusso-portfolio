"use client"

import { useEffect, useRef } from 'react'

export default function AboutPage() {
  const containerRef = useRef<HTMLElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const normalizeText = (rawText: string) => {
      const placeholder = "\uFFFF"
      let text = rawText.replace(/\u00a0/g, placeholder)
      text = text.replace(/\s+/g, " ").replace(/^ +| +$/g, "")
      text = text.replace(new RegExp(placeholder, "g"), "\u00a0")
      return text
    }

    const splitLetters = (el: HTMLElement) => {
      if (el.dataset.lettersReady === "true") return
      const rawText = el.textContent ?? ""
      const text = normalizeText(rawText)
      if (!text.replace(/\u00a0/g, "").trim()) return
      el.dataset.lettersReady = "true"
      el.innerHTML = ""

      const tokens = text.match(/[^\s\u00a0]+|[\s\u00a0]+/g) || []
      tokens.forEach((token) => {
        if (/^[\s\u00a0]+$/.test(token)) {
          el.appendChild(document.createTextNode(token))
          return
        }
        const word = document.createElement("span")
        word.className = "word"
        Array.from(token).forEach((char) => {
          const span = document.createElement("span")
          span.className = "char"
          span.setAttribute("aria-hidden", "true")
          span.innerHTML = char === " " ? "&nbsp;" : char
          word.appendChild(span)
        })
        el.appendChild(word)
      })

      el.setAttribute("aria-label", text)
      el.classList.add("letters-ready")
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".about-letter-reveal"))
    requestAnimationFrame(() => {
      elements.forEach(splitLetters)
    })
  }, [])

  return (
    <>
      <main ref={containerRef} className="editorial-about">
        {/* Grain texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-[5] opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            mixBlendMode: 'multiply'
          }}
        />

        <section className="container relative z-10">
          <div
            ref={heroRef}
            className="editorial-hero about-letter-reveal"
            data-delay-start="0"
          >
            (b. 1995, Italy) is an Italian photographer and visual artist living and working between Bologna and Milan. Her practice investigates themes of intimacy, femininity, and affective relationships, developing a visual language that blends diaristic intimacy with documentary rigor.
          </div>

          <div className="editorial-columns">
            <div className="editorial-services-block">
              <h3 className="about-letter-reveal" data-delay-start="520">Services:</h3>
              <ul>
                <li className="about-letter-reveal" data-delay-start="560">Art Buying</li>
                <li className="about-letter-reveal" data-delay-start="590">Art Direction</li>
                <li className="about-letter-reveal" data-delay-start="620">Campaign Production</li>
                <li className="about-letter-reveal" data-delay-start="650">Content Development</li>
                <li className="about-letter-reveal" data-delay-start="680">Creative Consultancy</li>
                <li className="about-letter-reveal" data-delay-start="710">Visual Strategy</li>
              </ul>
            </div>

            <div className="editorial-bio-block">
              <p className="about-letter-reveal" data-delay-start="240">Lorusso’s work has been shown in solo and group exhibitions internationally, including the IKS Institute, Düsseldorf; The Bridge and Tunnel Gallery, New York; and Melkweg Gallery, Amsterdam. Since 2019, she has co-founded and served as Creative Director of Mulieris Magazine. In 2020, she appeared in Le Fotografe, a Sky Arte docuseries profiling Italian women photographers. In 2022, she published her first photobook "As a Flower" edited by Witty Books.</p>
              <p className="about-letter-reveal" data-delay-start="320">Her photographic work is included in both private and public collections and continues to explore the intersections of personal narrative, affective connection, and visual storytelling.</p>
            </div>

            <div className="editorial-clients-block">
              <h3 className="about-letter-reveal" data-delay-start="700">Clients:</h3>
              <p className="about-letter-reveal" data-delay-start="760">About You, Adidas, Burberry, British Airways, Cos, Demellier London, Facebook, Florentine Vintage, Gq, Harper’s Bazaar, Harvey Nichols, Htsi, Love Want, Marie Claire, Métier, Monocle, Net-A-Porter, One&Only, Polaroid, Selfridges & Co, Soho House, Studio Nicholson, Thom Browne New York, Vogue, Venroy, Wallpaper*, Zara, Zeus+Dione</p>

              <h3 className="about-letter-reveal" data-delay-start="860">Contact:</h3>
              <p><a className="about-letter-reveal" data-delay-start="920" href="https://www.instagram.com/loruponyo/">@loruponyo</a></p>
              <p><a className="about-letter-reveal" data-delay-start="980" href="mailto:lorussosara1995@gmail.com">lorussosara1995@gmail.com</a></p>
            </div>

            <div className="editorial-pubs-block">
              <h3 className="about-letter-reveal" data-delay-start="700">Selected publications:</h3>
              <p className="about-letter-reveal" data-delay-start="760">ID Magazine, Vogue Italia, Dazed, Artribune, D – La Repubblica, Deir Grief, interview.de, L’Espresso, Causette Fr, Ze.tt, British Journal of Photography, Rolling Stone, Marie Claire IT, Cosmopolitan, Vice UK, Glamour, Elle, Nomas magazine and others.</p>

              <h3 className="about-letter-reveal" data-delay-start="700">Selected clients:</h3>
              <p className="about-letter-reveal" data-delay-start="760">Vans, Nike woman, Slam Jam, Puma, Levis’, MI AMI, Carhartt Wip, Motorola, Momonì, Karhu, Simona Vanth, Caudalie, AtticandBarn, Marco Rambaldi... Full Commercial Portfolio on request.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
