'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Immagini commissioned (26 foto)

// Calcola dinamicamente configurazione marquee basato su viewport
const calculateMarqueeConfig = () => {
  if (typeof window === 'undefined') return {
    viewportWidth: 1920,
    thumbWidth: 60,
    thumbsPerViewport: 32,
    iterations: 2,
    totalWidth: 7560,
    totalImages: 63
  }
  
  const viewportWidth = window.innerWidth
  const THUMB_WIDTH = 60 // width (50px) + gap (10px)
  const thumbsPerViewport = Math.ceil(viewportWidth / THUMB_WIDTH)
  const totalImages = 26
  
  // Serve 3x coverage per scorrimento continuo (3 span)
  const requiredCoverage = thumbsPerViewport * 3
  const iterations = Math.ceil(requiredCoverage / totalImages)
  const totalWidth = iterations * totalImages * THUMB_WIDTH
  
  return {
    viewportWidth,
    thumbWidth: THUMB_WIDTH,
    thumbsPerViewport,
    iterations,
    totalWidth,
    totalImages
  }
}

// Immagini commissioned (26 foto)
const images = Array.from({ length: 26 }, (_, i) => ({
  src: `/commissioned/${String(i + 1).padStart(2, '0')}.jpg`,
  span: 1,
  aspect: '3/4'
}))

const reelImages = [...images, ...images]

type ViewMode = 'grid' | 'stack' | 'reel'

const formatCounter = (value: number) => String(value).padStart(2, '0')

// Calcola quante ripetizioni servono per coprire il viewport
const getMarqueeIterations = () => {
  if (typeof window === 'undefined') return 4
  const viewportWidth = window.innerWidth
  const THUMB_WIDTH = 60
  const thumbsPerViewport = Math.ceil(viewportWidth / THUMB_WIDTH)
  const requiredCoverage = thumbsPerViewport * 3
  return Math.max(4, Math.ceil(requiredCoverage / images.length))
}

export default function CommissionedPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [transitionPhase, setTransitionPhase] = useState<'out' | 'in' | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [marqueeIterations, setMarqueeIterations] = useState(4)
  const reelRef = useRef<HTMLDivElement>(null)
  const stackScrollRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const totalPhotos = images.length
  const photoCounter = `${formatCounter(heroIndex + 1)}/${formatCounter(totalPhotos)}`
  
  // Array ripetuto per marquee - garantisce copertura completa viewport
  const marqueeImages = useMemo(() => {
    const result = []
    for (let i = 0; i < marqueeIterations; i++) {
      result.push(...images)
    }
    return result
  }, [marqueeIterations])
  
  // Stato per marquee con inerzia
  const sliderState = useRef({
    position: 0,
    velocity: 0,
  })

  // Aggiorna iterazioni su resize/load
  useEffect(() => {
    const updateIterations = () => {
      setMarqueeIterations(getMarqueeIterations())
    }
    updateIterations()
    window.addEventListener('resize', updateIterations)
    window.addEventListener('orientationchange', updateIterations)
    return () => {
      window.removeEventListener('resize', updateIterations)
      window.removeEventListener('orientationchange', updateIterations)
    }
  }, [])

  // Preload immagini + animazione iniziale
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = images.slice(0, 10).map((img) => {
        return new Promise((resolve) => {
          const image = new Image()
          image.onload = resolve
          image.onerror = resolve
          image.src = img.src
        })
      })
      
      await Promise.all(imagePromises)
      setTimeout(() => setIsLoaded(true), 100)
    }
    
    preloadImages()
  }, [])

  const stackGroups = useMemo(() => {
    const groups: { pair: typeof images; single?: typeof images[0] }[] = []
    for (let i = 0; i < images.length; i += 3) {
      const pair = [images[i], images[i + 1]].filter(Boolean)
      const single = images[i + 2]
      if (pair.length) {
        groups.push({ pair, single })
      } else if (single) {
        groups.push({ pair: [], single })
      }
    }
    return groups
  }, [])

  useEffect(() => {
    // Grain animation con canvas - grain più piccolo
    const canvas = document.getElementById('grainCanvas') as HTMLCanvasElement
    let handleResize: (() => void) | null = null
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const scale = 2 // Scala per grain più piccolo
      canvas.width = window.innerWidth / scale
      canvas.height = window.innerHeight / scale
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.imageRendering = 'pixelated'

      const grain = () => {
        const imageData = ctx!.createImageData(canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const color = Math.random() * 255
          data[i] = color
          data[i + 1] = color
          data[i + 2] = color
          data[i + 3] = 255
        }

        ctx!.putImageData(imageData, 0, 0)
        requestAnimationFrame(grain)
      }

      grain()

      handleResize = () => {
        canvas.width = window.innerWidth / scale
        canvas.height = window.innerHeight / scale
      }
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useEffect(() => {
    if (viewMode === 'reel' && reelRef.current) {
      const reel = reelRef.current
      let autoRaf = 0

      // Wheel: traduce scroll verticale in orizzontale
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        // Usa deltaY per scroll orizzontale (scroll su/giù = scroll dx/sx)
        reel.scrollLeft += e.deltaY + e.deltaX
      }

      const onScroll = () => {
        const half = reel.scrollWidth / 2
        if (reel.scrollLeft >= half) {
          reel.scrollLeft -= half
        } else if (reel.scrollLeft <= 0) {
          reel.scrollLeft += half
        }
      }
      
      // Touch: swipe verticale = scroll orizzontale
      let touchStartY = 0
      let touchStartX = 0
      
      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY
        touchStartX = e.touches[0].clientX
      }
      
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const deltaY = touchStartY - e.touches[0].clientY
        const deltaX = touchStartX - e.touches[0].clientX
        reel.scrollLeft += deltaY + deltaX
        touchStartY = e.touches[0].clientY
        touchStartX = e.touches[0].clientX
      }

      reel.addEventListener('wheel', onWheel, { passive: false })
      reel.addEventListener('scroll', onScroll)
      reel.addEventListener('touchstart', onTouchStart, { passive: true })
      reel.addEventListener('touchmove', onTouchMove, { passive: false })
      
      requestAnimationFrame(() => {
        reel.scrollLeft = reel.scrollWidth / 4
      })
      const tick = () => {
        reel.scrollLeft += 0.35
        autoRaf = requestAnimationFrame(tick)
      }
      autoRaf = requestAnimationFrame(tick)

      return () => {
        reel.removeEventListener('wheel', onWheel)
        reel.removeEventListener('scroll', onScroll)
        reel.removeEventListener('touchstart', onTouchStart)
        reel.removeEventListener('touchmove', onTouchMove)
        if (autoRaf) cancelAnimationFrame(autoRaf)
      }
    }

    if (viewMode === 'stack' && stackScrollRef.current) {
      const scroller = stackScrollRef.current
      let autoRaf = 0
      
      const onScroll = () => {
        const half = scroller.scrollHeight / 2
        if (scroller.scrollTop >= half) {
          scroller.scrollTop -= half
        } else if (scroller.scrollTop <= 1) {
          scroller.scrollTop += half
        }
      }

      scroller.addEventListener('scroll', onScroll)
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight / 4
      })
      
      // Auto-scroll fluido (funziona anche su mobile)
      const tick = () => {
        scroller.scrollTop += 0.35
        autoRaf = requestAnimationFrame(tick)
      }
      autoRaf = requestAnimationFrame(tick)

      return () => {
        scroller.removeEventListener('scroll', onScroll)
        if (autoRaf) cancelAnimationFrame(autoRaf)
      }
    }
    return undefined
  }, [viewMode])

  // Smooth scroll + marquee: LOOP e TRANSLATE insieme con inerzia
  useEffect(() => {
    if (viewMode !== 'grid') return
    
    const slider = sliderRef.current
    if (!slider) return
    
    const trackA = slider.querySelector('.works-marquee-span-a') as HTMLElement
    const trackB = slider.querySelector('.works-marquee-span-b') as HTMLElement
    const trackC = slider.querySelector('.works-marquee-span-c') as HTMLElement
    if (!trackA || !trackB || !trackC) return
    
    let rafId = 0
    let initTimeout: NodeJS.Timeout
    
    // Misura la larghezza reale di uno span dal DOM
    const measureSpanWidth = () => {
      return trackA.scrollWidth || trackA.offsetWidth || marqueeImages.length * 60
    }
    
    // Delay iniziale per permettere al DOM di essere pronto dopo navigazione
    initTimeout = setTimeout(() => {
      const SPAN_WIDTH = measureSpanWidth()
      const viewportWidth = window.innerWidth
      
      // Calcola THUMB_WIDTH reale dalla misurazione
      const THUMB_WIDTH = SPAN_WIDTH / marqueeImages.length
      
      const SCROLL_MULTIPLIER = 0.5
      const MIN_VELOCITY = 0.1
      
      // Calcola offset iniziale per centrare la PRIMA immagine
      // La prima immagine deve essere al centro del viewport
      const initialOffset = viewportWidth / 2 - THUMB_WIDTH / 2
      
      // Stato scroll con inerzia - partendo da offset per centrare img 1
      let targetScroll = -initialOffset / SCROLL_MULTIPLIER
      let currentScroll = targetScroll
      let velocity = 0
      
      // Calcola quale immagine è al CENTRO del viewport
      const getCenterImageIndex = (loopedPosition: number) => {
        const viewportCenter = viewportWidth / 2
        const centerOffset = viewportCenter - loopedPosition
        const thumbIndex = Math.floor(centerOffset / THUMB_WIDTH)
        return ((thumbIndex % images.length) + images.length) % images.length
      }
      
      // CORE: Aggiorna posizione marquee con LOOP + TRANSLATE insieme
      const updateMarqueePosition = () => {
        const diff = targetScroll - currentScroll
        velocity = diff * 0.1
        
        if (Math.abs(velocity) > MIN_VELOCITY) {
          currentScroll += velocity
        } else {
          currentScroll = targetScroll
        }
        
        const rawPosition = -currentScroll * SCROLL_MULTIPLIER
        let loopedPosition = rawPosition % SPAN_WIDTH
        if (loopedPosition > 0) loopedPosition -= SPAN_WIDTH
        
        trackA.style.transform = `translateX(${loopedPosition}px)`
        trackB.style.transform = `translateX(${loopedPosition - SPAN_WIDTH}px)`
        trackC.style.transform = `translateX(${loopedPosition + SPAN_WIDTH}px)`
        
        const centerIndex = getCenterImageIndex(loopedPosition)
        if (centerIndex !== heroIndex) {
          setHeroIndex(centerIndex)
        }
      }
      
      const tick = () => {
        updateMarqueePosition()
        rafId = requestAnimationFrame(tick)
      }
      
      // Rendi subito visibili tutte le thumbnail
      const allThumbs = slider.querySelectorAll('.works-marquee-thumb')
      allThumbs.forEach((thumb) => {
        thumb.classList.add('is-visible')
      })
      
      // Wheel handler
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY || e.deltaX
        targetScroll += delta * 0.5
      }
      
      // Click globale
      const onClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('.work-view-toggle') || target.closest('.nav-menu')) {
          return
        }
        targetScroll += THUMB_WIDTH / SCROLL_MULTIPLIER
      }
      
      // Touch handlers
      let touchStartY = 0
      
      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY
      }
      
      const onTouchMove = (e: TouchEvent) => {
        const deltaY = touchStartY - e.touches[0].clientY
        touchStartY = e.touches[0].clientY
        targetScroll += deltaY * 0.5
      }
      
      const onTouchEnd = () => {}
      
      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('click', onClick)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      
      rafId = requestAnimationFrame(tick)
      
      // Store cleanup functions
      ;(slider as any)._cleanupMarquee = () => {
        allThumbs.forEach((thumb) => {
          thumb.classList.remove('is-visible')
        })
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('click', onClick)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
        cancelAnimationFrame(rafId)
      }
    }, 50) // 50ms delay per permettere al DOM di stabilizzarsi
    
    // Blocca scroll verticale nativo
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault()
    }
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.addEventListener('touchmove', preventScroll, { passive: false })
    
    return () => {
      clearTimeout(initTimeout)
      if ((slider as any)._cleanupMarquee) {
        (slider as any)._cleanupMarquee()
      }
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [viewMode, marqueeImages.length])

  const handleHeroNext = () => {
    setHeroIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <>
      <main className="w-full h-screen bg-white text-[#111]">
        {/* Grain texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.04] mix-blend-overlay">
          <canvas id="grainCanvas" className="w-full h-full"></canvas>
        </div>

        {/* View Switcher - Top Right */}
        <div className="fixed bottom-[1em] right-[1em] z-[100] flex items-center gap-4 text-xs nav-menu work-view-toggle">
          <span className="pointer-events-none work-photo-counter">{photoCounter}</span>
          <button
            type="button"
            onClick={() => {
              const nextMode: ViewMode =
                viewMode === 'grid' ? 'stack' : viewMode === 'stack' ? 'reel' : 'grid'
              setTransitionPhase('out')
              window.setTimeout(() => {
                setViewMode(nextMode)
                // Reset heroIndex quando si torna alla grid view
                if (nextMode === 'grid') {
                  setHeroIndex(0)
                }
                setTransitionPhase('in')
                window.setTimeout(() => setTransitionPhase(null), 260)
              }, 220)
            }}
            className="p-2 bg-transparent border-0 hover:opacity-70 transition pointer-events-auto work-view-toggle-button"
          >
            {viewMode === 'grid' ? (
              <svg className="work-view-toggle-icon" width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" stroke="#111" fill="none" strokeWidth="1" />
                <rect x="9" y="1" width="6" height="6" stroke="#111" fill="none" strokeWidth="1" />
                <rect x="1" y="9" width="6" height="6" stroke="#111" fill="none" strokeWidth="1" />
                <rect x="9" y="9" width="6" height="6" stroke="#111" fill="none" strokeWidth="1" />
              </svg>
            ) : viewMode === 'stack' ? (
              <svg className="work-view-toggle-icon" width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" stroke="#111" fill="none" strokeWidth="1" />
                <rect x="9" y="1" width="6" height="6" stroke="#111" fill="none" strokeWidth="1" />
                <rect x="1" y="9" width="14" height="6" stroke="#111" fill="none" strokeWidth="1" />
              </svg>
            ) : (
              <svg className="work-view-toggle-icon" width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="3" width="14" height="4" stroke="#111" fill="none" strokeWidth="1" />
                <rect x="1" y="9" width="14" height="4" stroke="#111" fill="none" strokeWidth="1" />
              </svg>
            )}
          </button>
        </div>

        {/* Main Content Container */}
        <div className="w-full h-full">
          {viewMode === 'grid' ? (
            /* GRID VIEW - Photo + Marquee */
            <div className={`works-grid-view ${isLoaded ? 'is-loaded' : ''} ${transitionPhase === 'out' ? 'view-fade-out' : ''} ${transitionPhase === 'in' ? 'view-fade-in' : ''}`}>
              {/* Overlay superiore - sfumatura sotto nav */}
              <div className="works-top-overlay" />
              
              {/* Central Photo - semplice crossfade */}
              <div className="works-grid-photo">
                <img
                  src={images[heroIndex].src}
                  alt={`Photo ${heroIndex + 1}`}
                  className="works-photo-img"
                />
              </div>

              {/* Bottom Marquee - tre span per loop infinito */}
              <div ref={sliderRef} className="works-grid-marquee">
                {/* Overlay gradiente bianco */}
                <div className="works-marquee-overlay" />
                
                {/* Span A - contiene N ripetizioni di tutte le immagini */}
                <div className="works-marquee-span works-marquee-span-a">
                  {marqueeImages.map((img, idx) => (
                    <div
                      key={`a-${idx}`}
                      className="works-marquee-thumb"
                    >
                      <img src={img.src} alt="" />
                    </div>
                  ))}
                </div>
                
                {/* Span B (duplicato per loop infinito) */}
                <div className="works-marquee-span works-marquee-span-b">
                  {marqueeImages.map((img, idx) => (
                    <div
                      key={`b-${idx}`}
                      className="works-marquee-thumb"
                    >
                      <img src={img.src} alt="" />
                    </div>
                  ))}
                </div>
                
                {/* Span C (terzo duplicato per continuità totale) */}
                <div className="works-marquee-span works-marquee-span-c">
                  {marqueeImages.map((img, idx) => (
                    <div
                      key={`c-${idx}`}
                      className="works-marquee-thumb"
                    >
                      <img src={img.src} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'stack' ? (
          <div ref={stackScrollRef} className={`work-stack-scroll ${transitionPhase === 'out' ? 'view-fade-out' : ''} ${transitionPhase === 'in' ? 'view-fade-in' : ''}`}>
            <div className="work-stack">
              {stackGroups.map((group, groupIndex) => (
                <section key={groupIndex} className="work-stack-section">
                  {group.pair.length > 0 && (
                    <div className="work-stack-pair">
                      {group.pair.map((img, imgIndex) => (
                        <div
                          key={`${groupIndex}-${imgIndex}`}
                          className="work-stack-item"
                          style={{
                            backgroundImage: `url(${img.src})`,
                            animationDelay: `${(groupIndex * 3 + imgIndex) * 40}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {group.single && (
                    <div
                      className={groupIndex % 2 === 0 ? "work-stack-full work-stack-full--bleed" : "work-stack-full work-stack-full--centered"}
                      style={{
                        animationDelay: `${(groupIndex * 3 + 2) * 40}ms`,
                      }}
                    >
                      <img src={group.single.src} alt="" className="work-stack-full-img" />
                    </div>
                  )}
                </section>
              ))}
            </div>
            <div className="work-stack work-stack--clone" aria-hidden="true">
              {stackGroups.map((group, groupIndex) => (
                <section key={`clone-${groupIndex}`} className="work-stack-section">
                  {group.pair.length > 0 && (
                    <div className="work-stack-pair">
                      {group.pair.map((img, imgIndex) => (
                        <div
                          key={`clone-${groupIndex}-${imgIndex}`}
                          className="work-stack-item"
                          style={{
                            backgroundImage: `url(${img.src})`,
                            animationDelay: `${(groupIndex * 3 + imgIndex) * 40}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {group.single && (
                    <div
                      className={groupIndex % 2 === 0 ? "work-stack-full work-stack-full--bleed" : "work-stack-full work-stack-full--centered"}
                      style={{
                        animationDelay: `${(groupIndex * 3 + 2) * 40}ms`,
                      }}
                    >
                      <img src={group.single.src} alt="" className="work-stack-full-img" />
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div ref={reelRef} className={`work-reel ${transitionPhase === 'out' ? 'view-fade-out' : ''} ${transitionPhase === 'in' ? 'view-fade-in' : ''}`}>
            <div className="work-reel-track">
              {reelImages.map((img, idx) => (
                <div key={idx} className="work-reel-item">
                  <div
                    className="work-reel-img"
                    style={{ backgroundImage: `url(${img.src})` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Global styles moved to app/globals.css */}
    </>
  )
}
