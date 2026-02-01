"use client"

import { useEffect, useRef } from 'react'

export default function AboutPage() {
  const containerRef = useRef<HTMLElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <main ref={containerRef} className="editorial-about">
        <section className="container relative z-10">
          <div
            ref={heroRef}
            className="editorial-hero"
            style={{ paddingTop: '1.5rem' }}
          >
            (b. 1995, Italy) is an Italian photographer and visual artist living and working between Bologna and Milan. Her practice investigates themes of intimacy, femininity, and affective relationships, developing a visual language that blends diaristic intimacy with documentary rigor.
          </div>

          <div
            className="flex flex-col gap-8 md:grid md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] md:gap-16 md:px-10 w-full px-5 mx-auto md:mr-[40px]"
            style={{ marginRight: "0", marginLeft: "0", maxWidth: "none" }}
          >
            {/* Colonna sinistra: contatti + pubblicazioni + clienti */}
            <div className="editorial-left-stack grid gap-6 md:w-[320px] w-full md:col-start-1 md:order-none">
              <div className="editorial-contact editorial-contact-block md:max-w-[320px] w-full">
                <h3>Contact:</h3>
                <p className="editorial-contact-lines">
                  <a href="https://www.instagram.com/loruponyo/">@loruponyo</a>
                  <a href="mailto:lorussosara1995@gmail.com">lorussosara1995@gmail.com</a>
                  <a href="/cv%202025.pdf" download className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity whitespace-nowrap">
                    Download CV
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                </p>
              </div>

              <div className="editorial-pubs-block md:max-w-[320px] w-full">
                <h3>Selected publications:</h3>
                <p>ID Magazine, Vogue Italia, Dazed, Artribune, D – La Repubblica, Deir Grief, interview.de, L'Espresso, Causette Fr, Ze.tt, British Journal of Photography, Rolling Stone, Marie Claire IT, Cosmopolitan, Vice UK, Glamour, Elle, Nomas magazine and others.</p>
              </div>

              <div className="editorial-selected-clients-block md:max-w-[320px] w-full">
                <h3>Selected clients:</h3>
                <p>Vans, Nike woman, Slam Jam, Puma, Levis', MI AMI, Carhartt Wip, Motorola, Momonì, Karhu, Simona Vanth, Caudalie, AtticandBarn, Marco Rambaldi...<br />Full Commercial Portfolio on request.</p>
              </div>
            </div>

            {/* Colonna destra: biografia completa (continuazione) */}
            <div className="editorial-bio-block grid gap-0 w-full md:max-w-full md:col-start-2 md:order-none md:pr-10">
              <p className="m-0 p-0 text-[1.2em] leading-[1.4em] md:text-[2em] md:leading-[1.28em]">
                Lorusso’s work has been shown in solo and group exhibitions internationally, including the IKS Institute, Düsseldorf; The Bridge and Tunnel Gallery, New York; and Melkweg Gallery, Amsterdam. Since 2019, she has co-founded and served as Creative Director of Mulieris Magazine. In 2020, she appeared in Le Fotografe, a Sky Arte docuseries profiling Italian women photographers. In 2022, she published her first photobook “As a Flower” edited by Witty Books.<br /><br />Her photographic work is included in both private and public collections and continues to explore the intersections of personal narrative, affective connection, and visual storytelling.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
