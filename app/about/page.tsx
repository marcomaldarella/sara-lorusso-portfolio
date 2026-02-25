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
            style={{ paddingTop: '1.5rem', paddingBottom: '10px' }}
          >
            Sara Lorusso (b. 1995, Italy) is a photographer and visual artist living and working between Bologna and Milan.
            <br />
            Her photographic practice operates in a liminal space, where the image is never a mere document but a site of inquiry.
          </div>

          <div
            className="flex flex-col gap-8 md:grid md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] md:gap-16 md:px-10 w-full px-5 mx-auto md:mr-[40px] "
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </p>
              </div>

              <div className="editorial-pubs-block md:max-w-[320px] w-full">
                <h3>Selected publications:</h3>
                <p>ID Magazine, Vogue Italia, Dazed, Deir Grief, D la Repubblica, British Journal of Photography, Zeit Magazine</p>
              </div>

              <div className="editorial-selected-clients-block md:max-w-[320px] w-full" style={{ paddingBottom: '3em' }}>
                <h3>Selected clients:</h3>
                <p>Vans, Nike, Slam Jam, Carhartt Wip, Motorola, Puma, Levis<br />Full Commercial Portfolio on request.</p>
              </div>
            </div>

            {/* Colonna destra: biografia completa (continuazione) */}
            <div className="editorial-bio-block grid gap-0 w-full md:max-w-full md:col-start-2 md:order-none md:pr-[10rem] md:pl-[2rem] pr-0">
              <p className="m-0 p-0 text-[1.2em] md:text-[2em] md:mr-[1em]">
                Photography becomes a tool for slow observation, capable of holding what usually escapes, such as subtle gestures and marginal presences. Her research explores themes of intimacy, femininity, and affective relationships, developing a visual language that merges diaristic intimacy with documentary rigor.
              </p>
              <p className="m-0 p-0 text-[1.2em] md:text-[2em] md:mr-[1em]">
                Her work has been exhibited internationally in solo and group exhibitions, including the IKS Institute in Düsseldorf, Galleria San Soda in Milan and Melkweg Gallery in Amsterdam. Since 2019, she has been co-founder and Creative Director of Mulieris Magazine. In 2020, she appeared in ‘’Le Fotografe’’, a Sky Arte documentary series dedicated to Italian women photographers. In 2022, she published her first photobook, As a Flower, with Witty Books.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
