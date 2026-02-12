'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchPhotosByCategory, preloadPhotos, type PhotoImage } from '@/lib/fetch-photos'

type CommissionedImage = PhotoImage

type ViewMode = 'grid' | 'reel'

const formatCounter = (value: number) => String(value).padStart(2, '0')

// Calcola dinamicamente configurazione marquee basato su viewport
const calculateMarqueeConfig = (totalImages: number = 26) => {
  if (typeof window === 'undefined') return {
    viewportWidth: 1920,
    thumbWidth: 60,
    thumbsPerViewport: 32,
    iterations: 2,
    totalWidth: 7560,
    totalImages
  }

  const viewportWidth = window.innerWidth
  const THUMB_WIDTH = 60 // width (50px) + gap (10px)
  const thumbsPerViewport = Math.ceil(viewportWidth / THUMB_WIDTH)
  const totalImages_value = totalImages

  // Serve 3x coverage per scorrimento continuo (3 span)
  const requiredCoverage = thumbsPerViewport * 3
  const iterations = Math.ceil(requiredCoverage / totalImages_value)
  const totalWidth = iterations * totalImages_value * THUMB_WIDTH

  return {
    viewportWidth,
    thumbWidth: THUMB_WIDTH,
    thumbsPerViewport,
    iterations,
    totalWidth,
    totalImages: totalImages_value
  }
}

// Calcola quante ripetizioni servono per coprire il viewport
const getMarqueeIterations = (totalImages: number) => {
  if (typeof window === 'undefined') return 4
  const viewportWidth = window.innerWidth
  const THUMB_WIDTH = 60
  const thumbsPerViewport = Math.ceil(viewportWidth / THUMB_WIDTH)
  const requiredCoverage = thumbsPerViewport * 3
  return Math.max(4, Math.ceil(requiredCoverage / Math.max(1, totalImages)))
}

function CommissionedContent() {
  // Fetch dinamico delle immagini da Sanity
  const [allImages, setAllImages] = useState<CommissionedImage[]>([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true)
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || null
  const currentImages = useMemo(() => {
    if (!selectedCategory) return allImages
    const inCat = allImages.filter((img) => img.category === selectedCategory)
    const outCat = allImages.filter((img) => img.category !== selectedCategory)
    return [...inCat, ...outCat]
  }, [selectedCategory, allImages])

  // Fetch immagini da Sanity al mount
  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoadingPhotos(true)
      try {
        const photos = await fetchPhotosByCategory('commissioned')
        setAllImages(photos)
        // Preload delle prime immagini
        await preloadPhotos(photos)
      } catch (error) {
        console.error('Failed to load photos:', error)
        setAllImages([])
      } finally {
        setIsLoadingPhotos(false)
      }
    }
    loadPhotos()
  }, [])

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [transitionPhase, setTransitionPhase] = useState<'out' | 'in' | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [marqueeIterations, setMarqueeIterations] = useState(4)
  const [currentSubcategory, setCurrentSubcategory] = useState<string>('')
  const [subcategoryOpacity, setSubcategoryOpacity] = useState(0)
  const reelRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const totalPhotos = currentImages.length
  const photoCounter = `${formatCounter(heroIndex + 1)}/${formatCounter(totalPhotos)}`
  const reelImages = useMemo(() => (currentImages.length > 0 ? [...currentImages, ...currentImages] : []), [currentImages])

  // Array ripetuto per marquee - garantisce copertura completa viewport
  const marqueeImages = useMemo(() => {
    const iterations = Math.max(1, getMarqueeIterations(currentImages.length))
    const result: CommissionedImage[] = []
    for (let i = 0; i < iterations; i++) {
      result.push(...currentImages)
    }
    return result
  }, [marqueeIterations, currentImages])

  // Stato per marquee con inerzia
  const sliderState = useRef({
    position: 0,
    velocity: 0,
  })

  // Aggiorna iterazioni su resize/load
  useEffect(() => {
    const updateIterations = () => {
      setMarqueeIterations(getMarqueeIterations(currentImages.length))
    }
    updateIterations()
    window.addEventListener('resize', updateIterations)
    window.addEventListener('orientationchange', updateIterations)
    return () => {
      window.removeEventListener('resize', updateIterations)
      window.removeEventListener('orientationchange', updateIterations)
    }
  }, [currentImages.length])

  // Preload immagini + animazione iniziale
  useEffect(() => {
    if (currentImages.length === 0 || isLoadingPhotos) return
    const preloadAll = async () => {
      const imagePromises = currentImages.map((img) => {
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

    preloadAll()
  }, [currentImages, isLoadingPhotos])

  useEffect(() => {
    if (viewMode === 'reel' && reelRef.current) {
      const reel = reelRef.current
      let autoRaf = 0

      // Track which subcategory is currently visible
      const updateSubcategory = () => {
        const reelRect = reel.getBoundingClientRect()
        const centerX = reelRect.left + reelRect.width / 2
        const items = reel.querySelectorAll('.work-reel-item')
        let found = ''
        items.forEach((item) => {
          const rect = item.getBoundingClientRect()
          if (rect.left <= centerX && rect.right >= centerX) {
            found = (item as HTMLElement).dataset.subcategory || ''
          }
        })
        if (found && found !== currentSubcategory) {
          setSubcategoryOpacity(0)
          setTimeout(() => {
            setCurrentSubcategory(found)
            setSubcategoryOpacity(1)
          }, 150)
        } else if (found && found === currentSubcategory) {
          setSubcategoryOpacity(1)
        }
      }

      // Wheel: traduce scroll verticale in orizzontale
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        reel.scrollLeft += e.deltaY + e.deltaX
      }

      const onScroll = () => {
        const half = reel.scrollWidth / 2
        if (reel.scrollLeft >= half) {
          reel.scrollLeft -= half
        } else if (reel.scrollLeft <= 0) {
          reel.scrollLeft += half
        }
        updateSubcategory()
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
        updateSubcategory()
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

    return undefined
  }, [viewMode, currentSubcategory])

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
        const len = Math.max(1, currentImages.length)
        return ((thumbIndex % len) + len) % len
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
        setHeroIndex((prev) => (prev + 1) % Math.max(1, currentImages.length)) // aggiorna subito l'hero
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
  }, [viewMode, marqueeImages.length, currentImages.length])

  const handleHeroNext = () => {
    setHeroIndex((prev) => (prev + 1) % Math.max(1, currentImages.length))
  }

  return (
    <>
      <main className={`w-full h-screen ${viewMode === 'reel' ? 'is-reel' : 'is-grid'} bg-white text-[#111]`}>
        {/* Loading / empty: spinner iOS */}
        {(isLoadingPhotos || currentImages.length === 0) && (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="ios-spinner">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ios-spinner-blade" />
              ))}
            </div>
          </div>
        )}

        {/* Main content - only render when photos are loaded */}
        {currentImages.length > 0 && (
        <>
        {/* Caption - visible in all views, same baseline as counter */}
        {currentImages[heroIndex]?.caption && (
          <div className={`work-caption fixed left-[1em] z-[90] text-xs pointer-events-none transition-all duration-300 ease-out line-clamp-1 hidden md:block ${viewMode === 'grid' ? 'bottom-[calc(6em+2%)]' : 'bottom-[calc(1em+5%)]'}`}>
            {currentImages[heroIndex]!.caption}
          </div>
        )}

        {/* Subcategory label - visible only in reel view */}
        {viewMode === 'reel' && currentSubcategory && (
          <div
            className="fixed left-[1em] top-1/2 -translate-y-1/2 z-[90] text-xs pointer-events-none"
            style={{
              mixBlendMode: 'difference',
              color: '#fff',
              opacity: subcategoryOpacity,
              transition: 'opacity 0.3s ease-out',
            }}
          >
            {currentSubcategory}
          </div>
        )}

        {/* View Switcher - moves up in grid to avoid marquee */}
        <div className={`fixed right-[1em] z-[100] flex items-center gap-4 text-xs nav-menu work-view-toggle transition-all duration-300 ease-out ${viewMode === 'grid' ? 'bottom-[calc(6em+2%)]' : 'bottom-[calc(1em+5%)]'}`}>
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
                viewMode === 'grid' ? 'reel' : 'grid'
              setTransitionPhase('out')

              // Delay ottimizzato per browser mobili - minimizza il flashing
              const transitionDuration = /iPhone|iPad|Android/.test(navigator.userAgent) ? 240 : 280
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
                }, 320)
              }, transitionDuration)
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
              <div className="works-top-overlay" />

              {/* Central Photo - semplice crossfade */}
              <div className="works-grid-photo">
                {currentImages.length > 0 && (
                  <img
                    src={currentImages[heroIndex]?.src}
                    alt={`Photo ${heroIndex + 1}`}
                    className="works-photo-img"
                  />
                )}
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
          ) : (
          <div ref={reelRef} className={`work-reel ${transitionPhase === 'out' ? 'view-fade-out' : ''} ${transitionPhase === 'in' ? 'view-fade-in' : ''}`}>
            <div className="work-reel-track">
              {reelImages.map((img, idx) => (
                <div key={idx} className="work-reel-item" data-subcategory={img.subcategory || ''}>
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
        </>
        )}
      </main>

      {/* Global styles moved to app/globals.css */}
    </>
  )
}

export default function CommissionedPage() {
  return (
    <Suspense fallback={null}>
      <CommissionedContent />
    </Suspense>
  )
}
