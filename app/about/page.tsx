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
            className="editorial-hero"
          >
            (b. 1995, Italy) is an Italian photographer and visual artist living and working between Bologna and Milan. Her practice investigates themes of intimacy, femininity, and affective relationships, developing a visual language that blends diaristic intimacy with documentary rigor.
          </div>

          <div className="editorial-columns">
            <div className="editorial-services-block">
              <h3>Services:</h3>
              <ul>
                <li>Art Buying</li>
                <li>Art Direction</li>
                <li>Campaign Production</li>
                <li>Content Development</li>
                <li>Creative Consultancy</li>
                <li>Visual Strategy</li>
              </ul>
            </div>

            <div className="editorial-contact editorial-contact-block editorial-contact-mobile">
              <h3>Contact:</h3>
              <p className="editorial-contact-lines">
                <a href="https://www.instagram.com/loruponyo/">@loruponyo</a>
                <a href="mailto:lorussosara1995@gmail.com">lorussosara1995@gmail.com</a>
              </p>
            </div>

            <div className="editorial-bio-block">
              <p>Lorusso’s work has been shown in solo and group exhibitions internationally, including the IKS Institute, Düsseldorf; The Bridge and Tunnel Gallery, New York; and Melkweg Gallery, Amsterdam. Since 2019, she has co-founded and served as Creative Director of Mulieris Magazine. In 2020, she appeared in Le Fotografe, a Sky Arte docuseries profiling Italian women photographers. In 2022, she published her first photobook "As a Flower" edited by Witty Books.</p>
              <p>Her photographic work is included in both private and public collections and continues to explore the intersections of personal narrative, affective connection, and visual storytelling.</p>
            </div>
          </div>

          <div className="editorial-columns-secondary">
            <div className="editorial-clients-block">
              <h3>Clients:</h3>
              <p>About You, Adidas, Burberry, British Airways, Cos, Demellier London, Facebook, Florentine Vintage, Gq, Harper’s Bazaar, Harvey Nichols, Htsi, Love Want, Marie Claire, Métier, Monocle, Net-A-Porter, One&Only, Polaroid, Selfridges & Co, Soho House, Studio Nicholson, Thom Browne New York, Vogue, Venroy, Wallpaper*, Zara, Zeus+Dione</p>
            </div>

            <div className="editorial-pubs-block">
              <h3>Selected publications:</h3>
              <p>ID Magazine, Vogue Italia, Dazed, Artribune, D – La Repubblica, Deir Grief, interview.de, L’Espresso, Causette Fr, Ze.tt, British Journal of Photography, Rolling Stone, Marie Claire IT, Cosmopolitan, Vice UK, Glamour, Elle, Nomas magazine and others.</p>
            </div>

            <div className="editorial-selected-clients-block">
              <h3>Selected clients:</h3>
              <p>Vans, Nike woman, Slam Jam, Puma, Levis’, MI AMI, Carhartt Wip, Motorola, Momonì, Karhu, Simona Vanth, Caudalie, AtticandBarn, Marco Rambaldi.<br />Full commercial portfolio on request.</p>
            </div>
          </div>

          <div className="editorial-contact editorial-contact-block editorial-contact-desktop">
            <h3>Contact:</h3>
            <p className="editorial-contact-lines">
              <a href="https://www.instagram.com/loruponyo/">@loruponyo</a>
              <a href="mailto:lorussosara1995@gmail.com">lorussosara1995@gmail.com</a>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
