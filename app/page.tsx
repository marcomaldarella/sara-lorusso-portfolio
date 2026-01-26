"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { MediaItem, MotionState } from "@/components/infinite-canvas/types"
import { getPhotosForCanvas } from "@/lib/photos"

const InfiniteCanvas = dynamic(
  () => import("@/components/infinite-canvas").then((mod) => mod.InfiniteCanvas),
  { ssr: false }
)

// Sistema fluidodinamico coordinato con canvas motion migliorato
const BASE_BLUR = 16 // Ridotto per maggiore chiarezza
const MIN_BLUR = 4 // Ancora più nitido durante il movimento
const BASE_RADIUS = 0.35 // Aumentato per mostrare più contenuto
const MAX_RADIUS = 0.60 // Espande di più durante la navigazione
const FLUID_SMOOTHING = 0.12 // Più responsivo per seguire meglio il mouse

export default function Home() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  
  // Refs per gestione pointer (solo per click detection)
  const pointerStartRef = useRef({ x: 0, y: 0, time: 0 })
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  
  // Stato fluidodinamico coordinato con canvas
  const fluidRef = useRef({
    x: 0.5, y: 0.5,
    targetX: 0.5, targetY: 0.5,
    radius: BASE_RADIUS,
    blur: BASE_BLUR,
    canvasSpeed: 0,
    canvasDragging: false
  })

  // Caricamento immagini con progress (ora da Sanity)
  useEffect(() => {
    // Controlla se è la prima visita
    const hasVisited = sessionStorage.getItem('hasVisitedHome')
    if (hasVisited) {
      setIsFirstVisit(false)
      setIsLoading(false)
      setLoadProgress(100)
    }
    
    let mounted = true
    
    const loadPhotos = async () => {
      try {
        const photos = await getPhotosForCanvas()
        
        if (!mounted) return
        setMedia(photos)
        
        // Se non è la prima visita, carica immediatamente
        if (!isFirstVisit) {
          return
        }
        
        // Altrimenti simula il caricamento con progress
        let loaded = 0
        const loadPromises = photos.map((photo) =>
          new Promise<MediaItem>((resolve) => {
            const img = new Image()
            img.src = photo.url
            img.onload = () => {
              loaded++
              if (mounted) setLoadProgress(Math.round((loaded / photos.length) * 100))
              resolve({ 
                url: photo.url, 
                width: photo.width || img.naturalWidth || 3, 
                height: photo.height || img.naturalHeight || 4,
                _id: photo._id,
                category: photo.category
              })
            }
            img.onerror = () => {
              loaded++
              if (mounted) setLoadProgress(Math.round((loaded / photos.length) * 100))
              resolve({ 
                url: photo.url, 
                width: photo.width || 3, 
                height: photo.height || 4,
                _id: photo._id,
                category: photo.category
              })
            }
          })
        )

        Promise.all(loadPromises).then((loadedMedia) => {
          if (!mounted) return
          setMedia(loadedMedia)
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false)
              sessionStorage.setItem('hasVisitedHome', 'true')
            }
          }, 400)
        })
      } catch (error) {
        console.error('Failed to load photos:', error)
        if (mounted) setIsLoading(false)
      }
    }

    loadPhotos()

    return () => { mounted = false }
  }, [isFirstVisit])

  // Aggiorna il blur del titolo in base al progresso
  useEffect(() => {
    const titleEl = titleRef.current
    if (!titleEl) return

    if (isFirstVisit && isLoading) {
      // Calcola blur: da 25px (0%) a 0px (100%)
      const blurAmount = Math.max(0, 25 * (100 - loadProgress) / 100)
      titleEl.style.setProperty('--title-blur', `${blurAmount}px`)
    } else {
      // Nessun blur se non è la prima visita o caricamento completato
      titleEl.style.setProperty('--title-blur', '0px')
    }
  }, [loadProgress, isLoading, isFirstVisit])

  // Animazione titolo
  useEffect(() => {
    const titleEl = titleRef.current
    if (!titleEl) return

    // Imposta blur iniziale se è la prima visita
    if (isFirstVisit && isLoading) {
      titleEl.style.setProperty('--title-blur', '25px')
    }

    const lines = ["Sara", "Lorusso"]
    titleEl.innerHTML = ""
    
    // Nessun delay se non è la prima visita
    const baseDelayMs = (!isFirstVisit || !isLoading) ? 0 : 200
    const staggerMs = 15
    const durationMs = 500
    
    let index = 0
    lines.forEach((line) => {
      const lineSpan = document.createElement("span")
      lineSpan.className = "landing-title-line"
      
      line.split("").forEach((char) => {
        const charSpan = document.createElement("span")
        charSpan.className = "char"
        charSpan.style.setProperty("--char-delay", `${baseDelayMs + index * staggerMs}ms`)
        charSpan.style.setProperty("--char-duration", `${durationMs}ms`)
        charSpan.textContent = char
        lineSpan.appendChild(charSpan)
        index++
      })
      
      titleEl.appendChild(lineSpan)
    })

    titleEl.setAttribute("aria-label", "Sara Lorusso")
    if (!isLoading || !isFirstVisit) {
      titleEl.classList.add("letters-ready")
    }
  }, [isLoading, isFirstVisit])

  // Callback per ricevere il motion state dal canvas
  const handleCanvasMotion = useCallback((motion: MotionState) => {
    const fluid = fluidRef.current
    
    // Aggiorna target basato su mouse position del canvas
    fluid.targetX = (motion.mouseX + 1) / 2  // Converti da -1..1 a 0..1
    fluid.targetY = 1 - (motion.mouseY + 1) / 2  // Inverti Y e converti
    fluid.canvasSpeed = motion.speed
    fluid.canvasDragging = motion.isDragging
  }, [])

  // Loop fluidodinamico coordinato con canvas
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = 0

    const tick = () => {
      const fluid = fluidRef.current

      // Smooth interpolation verso target (coordinato con canvas migliorato)
      fluid.x += (fluid.targetX - fluid.x) * FLUID_SMOOTHING
      fluid.y += (fluid.targetY - fluid.y) * FLUID_SMOOTHING
      
      // Raggio dinamico basato su velocità canvas con transizione più fluida
      const speedFactor = Math.min(fluid.canvasSpeed * 1.2, 1) // Aumentato il moltiplicatore
      const targetRadius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * speedFactor
      fluid.radius += (targetRadius - fluid.radius) * 0.08 // Leggermente più veloce
      
      // Blur dinamico migliorato: più movimento = meno blur (rivela di più)
      const targetBlur = fluid.canvasDragging 
        ? MIN_BLUR + (BASE_BLUR - MIN_BLUR) * 0.2  // Ancora meno blur durante la navigazione
        : BASE_BLUR - (BASE_BLUR - MIN_BLUR) * speedFactor * 0.8 // Maggiore riduzione del blur
      fluid.blur += (targetBlur - fluid.blur) * 0.07 // Transizione più veloce

      // Applica stili CSS vignette
      container.style.setProperty('--vignette-x', `${(fluid.x * 100).toFixed(2)}%`)
      container.style.setProperty('--vignette-y', `${(fluid.y * 100).toFixed(2)}%`)
      container.style.setProperty('--vignette-radius', `${(fluid.radius * 100).toFixed(2)}%`)
      container.style.setProperty('--landing-blur', `${fluid.blur.toFixed(2)}px`)
      
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isLoading])

  // Handler pointer (solo per click detection, il canvas gestisce il drag)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true
    hasDraggedRef.current = false
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - pointerStartRef.current.x
      const dy = e.clientY - pointerStartRef.current.y
      if (Math.hypot(dx, dy) > 8) {
        hasDraggedRef.current = true
      }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    const wasDragging = isDraggingRef.current
    const hasDragged = hasDraggedRef.current
    
    isDraggingRef.current = false
    
    // Naviga solo se è stato un click senza drag
    if (wasDragging && !hasDragged) {
      setIsExiting(true)
      setTimeout(() => {
        router.push("/work")
      }, 600)
    }
  }, [router])

  const handlePointerLeave = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  return (
    <div
      ref={containerRef}
      className={`landing-canvas ${isExiting ? 'is-exiting' : ''} ${isLoading ? 'is-loading' : 'is-loaded'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Canvas con callback motion */}
      <div className={`landing-media ${!isLoading ? 'is-visible' : ''}`}>
        {media.length > 0 && (
          <InfiniteCanvas
            media={media}
            backgroundColor="#ffffff"
            fogColor="#ffffff"
            cameraFar={1200}
            cameraNear={0.1}
            onMotion={handleCanvasMotion}
          />
        )}
      </div>

      {/* Blur overlay */}
      <div className="landing-blur" />
      
      {/* Exit overlay */}
      <div className={`landing-exit-overlay ${isExiting ? 'is-active' : ''}`} />

      {/* Title/Logo unificato - stesso elemento per loader e titolo */}
      <div className="landing-title-wrap">
        <h1 ref={titleRef} className={`landing-title ${isLoading && isFirstVisit ? 'is-loading' : ''}`} data-text="Sara Lorusso">
          <span className="landing-title-line">Sara</span>
          <span className="landing-title-line">Lorusso</span>
        </h1>
        {/* Progress bar durante loading - solo sotto il titolo */}
        <div className={`landing-title-progress ${isLoading && isFirstVisit ? 'is-visible' : ''}`}>
          <span className="landing-progress-percent-small">{loadProgress}%</span>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <span>©2026</span>
        <div className="landing-footer-right">
          <a className="landing-footer-link" href="https://www.instagram.com/loruponyo/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="landing-footer-link" href="mailto:lorussosara1995@gmail.com">Contact</a>
          <span className="landing-footer-cta">Click anywhere to enter</span>
        </div>
      </div>
    </div>
  )
}
