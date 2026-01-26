"use client"

import { useEffect, useRef } from 'react'

export default function AboutPage() {
  const containerRef = useRef<HTMLElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!containerRef.current) return

    let ro: ResizeObserver | null = null
    let retryTimer: number | null = null
    let attempts = 0
    let fitRaf = 0

    const setVar = (w: number) => {
      if (containerRef.current) containerRef.current.style.setProperty('--nav-name-width', `${Math.round(w)}px`)
    }

    const update = () => {
      const navName = document.querySelector('.nav-name') as HTMLElement | null
      if (navName) {
        const rect = navName.getBoundingClientRect()
        setVar(rect.width)
      }
    }

    const trySetup = () => {
      const navName = document.querySelector('.nav-name') as HTMLElement | null
      if (navName) {
        update()
        ro = new ResizeObserver(() => update())
        ro.observe(navName)
      } else if (attempts < 10) {
        attempts += 1
        retryTimer = window.setTimeout(trySetup, 100)
      }
    }

    const fitHero = () => {
      if (!containerRef.current || !heroRef.current) return

      const viewportHeight = window.innerHeight
      const minSize = 20
      const maxSize = 76

      let lo = minSize
      let hi = maxSize

      for (let i = 0; i < 10; i += 1) {
        const mid = (lo + hi) / 2
        heroRef.current.style.fontSize = `${mid}px`
        const contentHeight = containerRef.current.scrollHeight
        if (contentHeight <= viewportHeight) {
          lo = mid
        } else {
          hi = mid
        }
      }

      heroRef.current.style.fontSize = `${Math.floor(lo)}px`
    }

    const requestFit = () => {
      if (fitRaf) cancelAnimationFrame(fitRaf)
      fitRaf = requestAnimationFrame(() => fitHero())
    }

    trySetup()
    requestFit()

    // Recalculate after fonts have loaded to avoid layout shift
    if (document.fonts && (document.fonts as any).ready && typeof (document.fonts as any).ready.then === 'function') {
      ;(document.fonts as any).ready.then(() => {
        update()
        requestFit()
      }).catch(() => {})
    }

    window.addEventListener('resize', update)
    window.addEventListener('resize', requestFit)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('resize', requestFit)
      if (ro) {
        try {
          ro.disconnect()
        } catch (e) {}
        ro = null
      }
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
      if (fitRaf) {
        cancelAnimationFrame(fitRaf)
      }
    }
  }, [])

  useEffect(() => {
    const normalizeText = (rawText: string) => {
      const placeholder = "\uFFFF"
      let text = rawText.replace(/\u00a0/g, placeholder)
      text = text.replace(/\s+/g, " ").replace(/^ +| +$/g, "")
      text = text.replace(new RegExp(placeholder, "g"), "\u00a0")
      return text
    }

    const heroEl = document.querySelector<HTMLElement>(".editorial-hero.about-letter-reveal")
    let heroDelayMs = 0

    if (heroEl) {
      const heroText = normalizeText(heroEl.textContent ?? "")
      const heroStagger = Number(heroEl.dataset.letterStagger || 4)
      const heroDuration = Number(heroEl.dataset.letterDuration || 260)
      const heroBase = Number(heroEl.dataset.delayStart || 0)
      const heroChars = Math.max(0, Array.from(heroText).length - 1)
      heroDelayMs = heroBase + heroChars * heroStagger + heroDuration + 120
    }

    const splitLines = (el: HTMLElement) => {
      if (el.dataset.lettersReady === "true") return
      const rawText = el.textContent ?? ""
      const text = normalizeText(rawText)
      if (!text.replace(/\u00a0/g, "").trim()) return
      const isHero = el === heroEl || el.classList.contains("editorial-hero")
      const baseDelay = Number(el.dataset.delayStart || 0) + (isHero ? 0 : heroDelayMs)
      const isSmall = el.classList.contains("text-xs") || el.closest(".text-xs") !== null
      const staggerMs = Number(el.dataset.letterStagger || (isHero ? 4 : isSmall ? 2 : 3))
      const durationMs = Number(el.dataset.letterDuration || (isHero ? 260 : isSmall ? 180 : 200))
      el.dataset.lettersReady = "true"
      el.innerHTML = ""

      const sentences = text.split(/([.!?]+)/).filter(s => s.trim())
      let lineIndex = 0
      sentences.forEach((sentence) => {
        if (!sentence.trim()) return
        const line = document.createElement("span")
        line.className = "line"
        line.setAttribute("aria-hidden", "true")
        line.style.setProperty("animation-delay", `${baseDelay + lineIndex * 200}ms`, "important")
        line.style.setProperty("animation-duration", `${durationMs}ms`, "important")
        line.textContent = sentence
        el.appendChild(line)
        lineIndex += 1
      })

      el.setAttribute("aria-label", text)
      el.classList.add("lines-ready")
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".about-letter-reveal"))
    requestAnimationFrame(() => {
      elements.forEach(splitLines)
    })
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
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
            {"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}(b. 1995, Italy) is an Italian photographer and visual artist living and working between Bologna and Milan. Her practice investigates themes of intimacy, femininity, and affective relationships, developing a visual language that blends diaristic intimacy with documentary rigor.
          </div>

          <div className="editorial-columns">
            <div className="editorial-services-block editorial-helvetica">
              <h3 className="text-xs mb-4 about-letter-reveal" data-delay-start="520">Services:</h3>
              <div className="text-xs leading-tight">
                <div className="about-letter-reveal" data-delay-start="560">Art Buying</div>
                <div className="about-letter-reveal" data-delay-start="590">Art Direction</div>
                <div className="about-letter-reveal" data-delay-start="620">Campaign Production</div>
                <div className="about-letter-reveal" data-delay-start="650">Content Development</div>
                <div className="about-letter-reveal" data-delay-start="680">Creative Consultancy</div>
                <div className="about-letter-reveal" data-delay-start="710">Visual Strategy</div>
              </div>
            </div>

            <div className="editorial-bio-block">
              <div className="text-xs leading-relaxed about-bio">
                {/* lead paragraph moved to top hero area for editorial layout */}

                <p className="editorial-bio-paragraph about-letter-reveal" data-delay-start="240">
                  {"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}Lorusso’s work has been shown in solo and group exhibitions internationally, including the IKS
                  Institute, Düsseldorf; The Bridge and Tunnel Gallery, New York; and Melkweg Gallery, Amsterdam.
                  Since 2019, she has co-founded and served as Creative Director of Mulieris Magazine. In 2020, she
                  appeared in Le Fotografe, a Sky Arte docuseries profiling Italian women photographers. In 2022,
                  she published her first photobook ‘‘As a Flower’’ edited by Witty Books.
                </p>

                <p className="editorial-bio-paragraph editorial-bio-second about-letter-reveal" data-delay-start="320">
                  Her photographic work is included in both private and public collections and continues to explore
                  the intersections of personal narrative, affective connection, and visual storytelling.
                </p>
              </div>
            </div>

            <div className="editorial-clients-block editorial-helvetica">
              <h3 className="text-xs mb-2 about-letter-reveal" data-delay-start="700">Clients</h3>
              <p className="about-letter-reveal" data-delay-start="760">{"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}About You, Adidas, Burberry, British Airways, Cos, Demellier London, Facebook, Florentine Vintage, Gq, Harper’s Bazaar, Harvey Nichols, Htsi, Love Want, Marie Claire, Métier, Monocle, Net-A-Porter, One&Only, Polaroid, Selfridges & Co, Soho House, Studio Nicholson, Thom Browne New York, Vogue, Venroy, Wallpaper*, Zara, Zeus+Dione</p>

              <div className="editorial-contact editorial-helvetica">
                <h3 className="text-xs mt-6 mb-2 about-letter-reveal" data-delay-start="860">Contact</h3>
                <p><a className="about-letter-reveal" data-delay-start="920" href="https://www.instagram.com/loruponyo/">@loruponyo</a></p>
                <p><a className="about-letter-reveal" data-delay-start="980" href="mailto:lorussosara1995@gmail.com">lorussosara1995@gmail.com</a></p>
              </div>
            </div>

            <div className="editorial-pubs-block editorial-helvetica">
              <div className="editorial-pubs-grid">
                <div>
                  <h3 className="text-xs mb-2 about-letter-reveal" data-delay-start="700">Selected publications</h3>
                  <div className="text-xs space-y-1">
                    <p className="about-letter-reveal" data-delay-start="760">{"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}ID Magazine, Vogue Italia, Dazed, Artribune, D – La Repubblica, Deir Grief, interview.de,</p>
                    <p className="about-letter-reveal" data-delay-start="820">L’Espresso, Causette Fr, Ze.tt, British Journal of Photography, Rolling Stone, Marie Claire IT,</p>
                    <p className="about-letter-reveal" data-delay-start="880">Cosmopolitan, Vice UK, Glamour, Elle, Nomas magazine and others.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs mb-2 about-letter-reveal" data-delay-start="700">Selected clients</h3>
                  <div className="text-xs space-y-1">
                    <p className="about-letter-reveal" data-delay-start="760">{"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"}Vans, Nike woman, Slam Jam, Puma, Levis’, MI AMI, Carhartt Wip, Motorola, Momonì, Karhu,</p>
                    <p className="about-letter-reveal" data-delay-start="820">Simona Vanth, Caudalie, AtticandBarn, Marco Rambaldi... Full Commercial Portfolio on request.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* Global styles moved to app/globals.css */}
    </>
  )
}
