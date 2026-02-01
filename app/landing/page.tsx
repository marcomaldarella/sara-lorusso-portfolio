"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

// Sistema fluidodinamico coordinato con canvas motion
const BASE_BLUR = 18 // Ridotto da 24 - più sofisticato
const MIN_BLUR = 6 // Ridotto da 8
const BASE_RADIUS = 0.32 // Aumentato da 0.28 - mostra più contenuto
const MAX_RADIUS = 0.55
const FLUID_SMOOTHING = 0.08

export default function LandingPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(100)
  const [isExiting, setIsExiting] = useState(false)

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
    let mounted = true

    const loadPhotos = async () => {
      try {
        // Simuliamo il caricamento
        if (mounted) {
          setLoadProgress(100)
        }
      } catch (error) {
        console.error('Failed to load photos:', error)
      }
    }

    loadPhotos()

    return () => { mounted = false }
  }, [])

  // Animazione titolo
  useEffect(() => {
    const titleEl = titleRef.current
    if (!titleEl) return

    const lines = ["Sara", "Lorusso"]
    titleEl.innerHTML = ""

    const baseDelayMs = isLoading ? 0 : 200
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
    if (!isLoading) {
      titleEl.classList.add("letters-ready")
    }
  }, [isLoading])

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

      // Smooth interpolation verso target (coordinato con canvas)
      fluid.x += (fluid.targetX - fluid.x) * FLUID_SMOOTHING
      fluid.y += (fluid.targetY - fluid.y) * FLUID_SMOOTHING

      // Raggio dinamico basato su velocità canvas
      const speedFactor = Math.min(fluid.canvasSpeed * 0.8, 1)
      const targetRadius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * speedFactor
      fluid.radius += (targetRadius - fluid.radius) * 0.06

      // Blur dinamico: più movimento = meno blur (rivela di più)
      const targetBlur = fluid.canvasDragging
        ? MIN_BLUR + (BASE_BLUR - MIN_BLUR) * 0.3  // Meno blur durante drag
        : BASE_BLUR - (BASE_BLUR - MIN_BLUR) * speedFactor * 0.6
      fluid.blur += (targetBlur - fluid.blur) * 0.05

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
    if (wasDragging && !hasDragged && !isLoading) {
      setIsExiting(true)
      setTimeout(() => {
        router.push("/work")
      }, 600)
    }
  }, [router, isLoading])

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
      {/* Canvas area */}
      <div className={`landing-media ${!isLoading ? 'is-visible' : ''}`}>
      </div>

      {/* Blur overlay */}
      <div className="landing-blur" />

      {/* Exit overlay */}
      <div className={`landing-exit-overlay ${isExiting ? 'is-active' : ''}`} />

      {/* Title/Logo unificato - stesso elemento per loader e titolo */}
      <div className="landing-title-wrap">
        <h1 ref={titleRef} className={`landing-title ${isLoading ? 'is-loading' : ''}`} data-text="Sara Lorusso">
          <span className="landing-title-line">Sara</span>
          <span className="landing-title-line">Lorusso</span>
        </h1>
        {/* Progress bar durante loading */}
        <div className={`landing-title-progress ${isLoading ? 'is-visible' : ''}`}>
          <div className="landing-title-progress-bar" style={{ width: `${loadProgress}%` }} />
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
