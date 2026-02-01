'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Immagini works (63 foto)

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
  const totalImages = 63
  
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

// Immagini works (63 foto)
const images = Array.from({ length: 63 }, (_, i) => ({
  src: `/works/${String(i + 1).padStart(2, '0')}.jpg`,
  span: 1,
  aspect: '3/4'
}))

const reelImages = [...images, ...images]

type ViewMode = 'grid' | 'stack' | 'reel'

const formatCounter = (value: number) => String(value).padStart(2, '0')

// Calcola quante ripetizioni servono per coprire il viewport
const getMarqueeIterations = () => {
  if (typeof window === 'undefined') return 3
  const viewportWidth = window.innerWidth
  const THUMB_WIDTH = 60
  const thumbsPerViewport = Math.ceil(viewportWidth / THUMB_WIDTH)
  const requiredCoverage = thumbsPerViewport * 3
  return Math.max(3, Math.ceil(requiredCoverage / images.length))
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [transitionPhase, setTransitionPhase] = useState<'out' | 'in' | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [marqueeIterations, setMarqueeIterations] = useState(3)
  const [wideMap, setWideMap] = useState<Record<string, boolean>>({})
  const [stackShuffleKey, setStackShuffleKey] = useState<number>(0)
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
  // Aggiorna chiave di shuffle quando si entra nella view stack
  useEffect(() => {
    if (viewMode === 'stack') {
      setStackShuffleKey(Date.now())
    }
  }, [viewMode])

  // Preload TUTTE le immagini all'avvio per evitare problemi su Safari
  useEffect(() => {
    const preloadImages = async () => {
      // Precarica tutte le immagini in parallelo per evitare loading durante cambio view
      const imagePromises = images.map((img) => {
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

  // Precompute aspect ratio for all images before building stack groups
  useEffect(() => {
    if (viewMode !== 'stack') return
    const toCheck = images.filter((img) => wideMap[img.src] === undefined)
    if (toCheck.length === 0) return

    const tasks = toCheck.map((img) =>
      new Promise<void>((resolve) => {
        const im = new Image()
        im.onload = () => {
          const isWide = im.naturalWidth > im.naturalHeight
          setWideMap((prev) => ({ ...prev, [img.src]: isWide }))
          resolve()
        }
        im.onerror = () => resolve()
        im.src = img.src
      })
    )
    Promise.all(tasks).catch(() => {})
  }, [viewMode])

  const stackGroups = useMemo(() => {
    const wideImages: typeof images = []
    const verticalImages: typeof images = []

    images.forEach((img) => {
      if (wideMap[img.src]) wideImages.push(img)
      else verticalImages.push(img)
    })

    const mulberry32 = (seed: number) => {
      let t = seed >>> 0
      return function () {
        t += 0x6D2B79F5
        let x = Math.imul(t ^ (t >>> 15), t | 1)
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296
      }
    }
    const rand = mulberry32(stackShuffleKey || Date.now())

    const shuffledVerticals = verticalImages.slice()
    for (let i = shuffledVerticals.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[shuffledVerticals[i], shuffledVerticals[j]] = [shuffledVerticals[j], shuffledVerticals[i]]
    }

    const groups: { pair: typeof images; single?: typeof images[0]; rotate?: boolean }[] = []
    let viIdx = 0
    let wiIdx = 0
    let pairStreak = 0

    while (viIdx < shuffledVerticals.length || wiIdx < wideImages.length) {
      if (pairStreak < 2 && viIdx + 1 < shuffledVerticals.length) {
        groups.push({ pair: [shuffledVerticals[viIdx], shuffledVerticals[viIdx + 1]], single: undefined })
        viIdx += 2
        pairStreak += 1
        continue
      }

      const canWide = wiIdx < wideImages.length
      const canVertSingle = viIdx < shuffledVerticals.length
      let useWide = false
      if (canWide && canVertSingle) useWide = rand() < 0.5
      else useWide = canWide && !canVertSingle

      if (useWide && canWide) {
        groups.push({ pair: [], single: wideImages[wiIdx++], rotate: false })
      } else if (canVertSingle) {
        const single = shuffledVerticals[viIdx++]
        const shouldRotate = rand() < 0.25
        groups.push({ pair: [], single, rotate: shouldRotate })
      } else {
        break
      }
      pairStreak = 0
    }
    return groups
  }, [images, wideMap, stackShuffleKey])

  useEffect(() => {
    if (viewMode === 'reel' && reelRef.current) {
      const reel = reelRef.current
      let autoRaf = 0
      let isUserInteracting = false
      let interactionTimeout: NodeJS.Timeout | null = null

      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        isUserInteracting = true
        clearTimeout(interactionTimeout!)
        reel.scrollLeft += e.deltaY + e.deltaX
        interactionTimeout = setTimeout(() => {
          isUserInteracting = false
        }, 1500)
      }

      const onScroll = () => {
        const half = reel.scrollWidth / 2
        if (reel.scrollLeft >= half) {
          reel.scrollLeft -= half
        } else if (reel.scrollLeft <= 0) {
          reel.scrollLeft += half
        }
      }

      let touchStartY = 0
      let touchStartX = 0

      const onTouchStart = (e: TouchEvent) => {
        isUserInteracting = true
        clearTimeout(interactionTimeout!)
        touchStartY = e.touches[0].clientY
        touchStartX = e.touches[0].clientX
      }

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        const deltaY = touchStartY - e.touches[0].clientY
        const deltaX = touchStartX - e.touches[0].clientX
        // Converte sia Y che X in scroll orizzontale
        reel.scrollLeft += deltaY + deltaX
        touchStartY = e.touches[0].clientY
        touchStartX = e.touches[0].clientX
      }

      const onTouchEnd = () => {
        interactionTimeout = setTimeout(() => {
          isUserInteracting = false
        }, 1500)
      }

      reel.addEventListener('wheel', onWheel, { passive: false })
      reel.addEventListener('scroll', onScroll)
      reel.addEventListener('touchstart', onTouchStart, { passive: true })
      reel.addEventListener('touchmove', onTouchMove, { passive: false })
      reel.addEventListener('touchend', onTouchEnd, { passive: true })

      requestAnimationFrame(() => {
        reel.scrollLeft = reel.scrollWidth / 4
      })
      const tick = () => {
        // Auto-scroll leggero anche su mobile, ma pausa se l'utente interagisce
        if (!isUserInteracting) {
          reel.scrollLeft += 0.35
        }
        autoRaf = requestAnimationFrame(tick)
      }
      autoRaf = requestAnimationFrame(tick)

      return () => {
        reel.removeEventListener('wheel', onWheel)
        reel.removeEventListener('scroll', onScroll)
        reel.removeEventListener('touchstart', onTouchStart)
        reel.removeEventListener('touchmove', onTouchMove)
        reel.removeEventListener('touchend', onTouchEnd)
        if (autoRaf) cancelAnimationFrame(autoRaf)
        if (interactionTimeout) clearTimeout(interactionTimeout)
      }
    }

    if (viewMode === 'stack' && stackScrollRef.current) {
      const scroller = stackScrollRef.current
      if (!scroller) return

      let autoRaf = 0
      let isUserInteracting = false
      let interactionTimeout: NodeJS.Timeout | null = null

      const onScroll = () => {
        const half = scroller.scrollHeight / 2
        if (scroller.scrollTop >= half) {
          scroller.scrollTop -= half
        } else if (scroller.scrollTop <= 1) {
          scroller.scrollTop += half
        }
      }

      const onTouchStart = () => {
        isUserInteracting = true
        clearTimeout(interactionTimeout!)
      }

      const onTouchEnd = () => {
        interactionTimeout = setTimeout(() => {
          isUserInteracting = false
        }, 1500)
      }

      scroller.addEventListener('scroll', onScroll, { passive: true })
      scroller.addEventListener('touchstart', onTouchStart, { passive: true })
      scroller.addEventListener('touchend', onTouchEnd, { passive: true })

      requestAnimationFrame(() => {
        if (scroller.scrollHeight > 0) {
          scroller.scrollTop = scroller.scrollHeight / 4
        }
      })

      const tick = () => {
        if (!isUserInteracting && scroller) {
          scroller.scrollTop += 0.35
        }
        autoRaf = requestAnimationFrame(tick)
      }
      autoRaf = requestAnimationFrame(tick)

      return () => {
        scroller.removeEventListener('scroll', onScroll)
        scroller.removeEventListener('touchstart', onTouchStart)
        scroller.removeEventListener('touchend', onTouchEnd)
        if (autoRaf) cancelAnimationFrame(autoRaf)
        if (interactionTimeout) clearTimeout(interactionTimeout)
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
      
      // Calcola THUMB_WIDTH reale dalla misurazione (escludendo padding del container)
      const trackStyles = getComputedStyle(trackA)
      const paddingLeft = parseFloat(trackStyles.paddingLeft || '0')
      const paddingX = paddingLeft + parseFloat(trackStyles.paddingRight || '0')
      const THUMB_WIDTH = (SPAN_WIDTH - paddingX) / marqueeImages.length
      
      const SCROLL_MULTIPLIER = 0.5
      const MIN_VELOCITY = 0.1
      
      // Calcola offset iniziale per centrare la PRIMA immagine
      // La prima immagine deve essere al centro del viewport
      const initialOffset = viewportWidth / 2 - (paddingLeft + THUMB_WIDTH / 2)
      
      // Stato scroll con inerzia - partendo da offset per centrare img 1
      let targetScroll = -initialOffset / SCROLL_MULTIPLIER
      let currentScroll = targetScroll
      let velocity = 0
      
      // Calcola quale immagine è al CENTRO del viewport
      const getCenterImageIndex = (loopedPosition: number) => {
        const viewportCenter = viewportWidth / 2
        const centerOffset = viewportCenter - (loopedPosition + paddingLeft)
        // Usa rounding al thumb più vicino per evitare salti sul bordo
        const thumbIndex = Math.round(centerOffset / THUMB_WIDTH)
        // Sincronizza hero con marquee senza skip
        const idx = ((thumbIndex % images.length) + images.length) % images.length
        setHeroIndex(idx)
        return idx
      }

      const syncNow = () => {
        currentScroll = targetScroll
        updateMarqueePosition()
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
        const loopedPosition = ((rawPosition % SPAN_WIDTH) + SPAN_WIDTH) % SPAN_WIDTH // 0..SPAN_WIDTH
        
        trackA.style.transform = `translateX(${loopedPosition}px)`
        trackB.style.transform = `translateX(${loopedPosition - SPAN_WIDTH}px)`
        trackC.style.transform = `translateX(${loopedPosition + SPAN_WIDTH}px)`
        
        const centerIndex = getCenterImageIndex(loopedPosition)
        setHeroIndex(centerIndex)
      }
      
      const tick = () => {
        updateMarqueePosition()
        rafId = requestAnimationFrame(tick)
      }

      // Prima sincronizzazione per mostrare subito la foto 1
      syncNow()
      setHeroIndex(0)
      
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
        setHeroIndex((prev) => (prev + 1) % images.length) // aggiorna subito l'hero
        targetScroll += THUMB_WIDTH / SCROLL_MULTIPLIER
        syncNow()
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

  const handleAspectRecord = useCallback((src: string, width: number, height: number) => {
    const isWide = width > height
    setWideMap((prev) => (prev[src] === isWide ? prev : { ...prev, [src]: isWide }))
  }, [])

  return (
    <>
      <main className={`w-full h-screen ${viewMode === 'reel' ? 'is-reel' : viewMode === 'stack' ? 'is-stack' : 'is-grid'} bg-white text-[#111]`}>
        {/* View Switcher - Top Right */}
        <div className="fixed bottom-[1em] right-[1em] z-[100] flex items-center gap-4 text-xs nav-menu work-view-toggle">
          <span className="pointer-events-none work-photo-counter">{photoCounter}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Blocca clic multipli durante transizione
              if (isTransitioning) return
              setIsTransitioning(true)
              
              const nextMode: ViewMode =
                viewMode === 'grid' ? 'stack' : viewMode === 'stack' ? 'reel' : 'grid'
              setTransitionPhase('out')
              
              // Delay più lungo per dare tempo a Safari di fare cleanup
              window.setTimeout(() => {
                setViewMode(nextMode)
                // Reset heroIndex quando si torna alla grid view
                if (nextMode === 'grid') {
                  setHeroIndex(0)
                }
                setTransitionPhase('in')
                window.setTimeout(() => {
                  setTransitionPhase(null)
                  setIsTransitioning(false)
                }, 350)
              }, 280)
            }}
            onPointerDown={(e) => { e.stopPropagation() }}
            onTouchStart={(e) => { e.stopPropagation() }}
            disabled={isTransitioning}
            className="p-2 bg-transparent border-0 hover:opacity-70 transition pointer-events-auto work-view-toggle-button"
          >
            {viewMode === 'grid' ? (
              <svg className="work-view-toggle-icon" width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
                <rect x="9" y="1" width="6" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
                <rect x="1" y="9" width="6" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
                <rect x="9" y="9" width="6" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
              </svg>
            ) : viewMode === 'stack' ? (
              <svg className="work-view-toggle-icon" width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
                <rect x="9" y="1" width="6" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
                <rect x="1" y="9" width="14" height="6" stroke="currentColor" fill="none" strokeWidth="1" />
              </svg>
            ) : (
              <svg className="work-view-toggle-icon" width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="3" width="14" height="4" stroke="currentColor" fill="none" strokeWidth="1" />
                <rect x="1" y="9" width="14" height="4" stroke="currentColor" fill="none" strokeWidth="1" />
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

              {/* Bottom Marquee - due span per loop infinito */}
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
                            animationDelay: `${(groupIndex * 3 + imgIndex) * 40}ms`,
                          }}
                        >
                          <img className="work-stack-pair-img" src={img.src} alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                  {group.single && (
                    <div
                      className={
                        wideMap[group.single.src]
                          ? "work-stack-full work-stack-full--bleed"
                          : group.rotate
                            ? "work-stack-full work-stack-full--rotated"
                            : "work-stack-full work-stack-full--centered"
                      }
                      style={{
                        animationDelay: `${(groupIndex * 3 + 2) * 40}ms`,
                      }}
                    >
                      <img
                        src={group.single.src}
                        alt=""
                        className="work-stack-full-img"
                        onLoad={(e) =>
                          handleAspectRecord(
                            group.single!.src,
                            e.currentTarget.naturalWidth,
                            e.currentTarget.naturalHeight
                          )
                        }
                      />
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
                            animationDelay: `${(groupIndex * 3 + imgIndex) * 40}ms`,
                          }}
                        >
                          <img className="work-stack-pair-img" src={img.src} alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                  {group.single && (
                    <div
                      className={
                        wideMap[group.single.src]
                          ? "work-stack-full work-stack-full--bleed"
                          : group.rotate
                            ? "work-stack-full work-stack-full--rotated"
                            : "work-stack-full work-stack-full--centered"
                      }
                      style={{
                        animationDelay: `${(groupIndex * 3 + 2) * 40}ms`,
                      }}
                    >
                      <img
                        src={group.single.src}
                        alt=""
                        className="work-stack-full-img"
                        onLoad={(e) =>
                          handleAspectRecord(
                            group.single!.src,
                            e.currentTarget.naturalWidth,
                            e.currentTarget.naturalHeight
                          )
                        }
                      />
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
                  <img
                    className="work-reel-img"
                    src={img.src}
                    alt=""
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
