"use client"

import gsap from "gsap"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getPhotosForCanvas } from "@/lib/photos"

type TrailPhoto = {
  url: string
  width?: number
  height?: number
  _id?: string
  category?: string
}

type TrailNode = {
  el: HTMLDivElement
  inner: HTMLDivElement
  rect: DOMRect
  timeline?: gsap.core.Timeline
}

const MAX_IMAGES = 14
const DISTANCE_THRESHOLD = 80

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b

const shuffle = <T,>(list: T[]) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const preload = async (urls: string[]) => {
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = url
        })
    )
  )
}

const filterWorkOnly = (items: TrailPhoto[]) =>
  items.filter((item) => {
    if (!item?.url) return false
    if (item.category === "commissioned") return false
    if (item.category === "work") return true
    // fallback for static assets
    if (item.url.includes("/commissioned/")) return false
    return true
  })

export default function Home() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  const mousePos = useRef({ x: 0, y: 0 })
  const cacheMousePos = useRef({ x: 0, y: 0 })
  const lastMousePos = useRef({ x: 0, y: 0 })
  const zIndexRef = useRef(1)
  const imgPositionRef = useRef(0)
  const activeCountRef = useRef(0)
  const isIdleRef = useRef(true)
  const rafRef = useRef<number | null>(null)
  const nodesRef = useRef<TrailNode[]>([])

  const [photos, setPhotos] = useState<TrailPhoto[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    document.body.classList.add("home-sequence")
    return () => document.body.classList.remove("home-sequence")
  }, [])

  // Build title split animation (Sara first, then Lorusso)
  useEffect(() => {
    const titleEl = titleRef.current
    if (!titleEl) return

    const lines = ["Sara", "Lorusso"]
    titleEl.innerHTML = ""

    let delay = 0
    const charGap = 42
    const linePause = 220

    lines.forEach((line, lineIndex) => {
      const lineSpan = document.createElement("span")
      lineSpan.className = "trail-title-line"

      line.split("").forEach((char, charIndex) => {
        const charSpan = document.createElement("span")
        charSpan.className = "char"
        charSpan.textContent = char
        const totalDelay = delay + charIndex * charGap
        charSpan.style.setProperty("--char-delay", `${totalDelay}ms`)
        lineSpan.appendChild(charSpan)
      })

      delay += line.length * charGap + (lineIndex === 0 ? linePause : 0)
      titleEl.appendChild(lineSpan)
    })

    requestAnimationFrame(() => {
      titleEl.classList.add("is-ready")
    })
  }, [])

  // Fetch and prep work-only photos
  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const all = await getPhotosForCanvas()
        const workOnly = filterWorkOnly(all)
        const selected = shuffle(workOnly).slice(0, MAX_IMAGES)

        if (!mounted) return
        setPhotos(selected)

        await preload(selected.map((item) => item.url))
        if (!mounted) return
        setIsReady(true)
      } catch (error) {
        console.error("Failed to load photos", error)
        if (mounted) setIsReady(true)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  // Mouse/touch position handlers
  useEffect(() => {
    if (typeof window === "undefined") return
    mousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    cacheMousePos.current = { ...mousePos.current }
    lastMousePos.current = { ...mousePos.current }
  }, [])

  // Trail animation setup
  useEffect(() => {
    if (!isReady || photos.length === 0) return

    const items: TrailNode[] = imageRefs.current
      .map((el) => el)
      .filter((el): el is HTMLDivElement => Boolean(el))
      .map((el) => ({
        el,
        inner: el.querySelector(".trail-img-inner") as HTMLDivElement,
        rect: el.getBoundingClientRect(),
      })) as TrailNode[]

    nodesRef.current = items

    gsap.set(items.map((i) => i.el), { opacity: 0, x: 0, y: 0, scale: 1 })

    const updateRects = () => {
      items.forEach((item) => {
        item.rect = item.el.getBoundingClientRect()
        gsap.set(item.el, { opacity: 0, x: 0, y: 0, scale: 1 })
      })
      zIndexRef.current = 1
    }

    const handlePointerMove = (ev: PointerEvent) => {
      mousePos.current = { x: ev.clientX, y: ev.clientY }
    }

    const handleTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length === 0) return
      const t = ev.touches[0]
      mousePos.current = { x: t.clientX, y: t.clientY }
    }

    const showNextImage = () => {
      const { x: mx, y: my } = mousePos.current
      const { x: cx, y: cy } = cacheMousePos.current

      zIndexRef.current += 1
      imgPositionRef.current =
        imgPositionRef.current < items.length - 1 ? imgPositionRef.current + 1 : 0

      const img = items[imgPositionRef.current]
      gsap.killTweensOf(img.el)

      let dx = mx - cx
      let dy = my - cy
      const distance = Math.hypot(dx, dy)

      if (distance !== 0) {
        dx /= distance
        dy /= distance
      }

      dx *= distance / 100
      dy *= distance / 100

      img.timeline = gsap
        .timeline({
          onStart: () => {
            activeCountRef.current += 1
            isIdleRef.current = false
          },
          onComplete: () => {
            activeCountRef.current -= 1
            if (activeCountRef.current === 0) {
              isIdleRef.current = true
            }
          },
        })
        .fromTo(
          img.el,
          {
            opacity: 1,
            scale: 0,
            zIndex: zIndexRef.current,
            x: cx - img.rect.width / 2,
            y: cy - img.rect.height / 2,
          },
          {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            x: mx - img.rect.width / 2,
            y: my - img.rect.height / 2,
          },
          0
        )
        .fromTo(
          img.inner,
          {
            scale: 1.9,
            filter: "brightness(100%) contrast(100%)",
          },
          {
            duration: 0.4,
            ease: "power1",
            scale: 1,
            filter: "brightness(100%) contrast(100%)",
          },
          0
        )
        .to(
          img.el,
          {
            duration: 0.4,
            ease: "power3",
            opacity: 0,
          },
          0.42
        )
        .to(
          img.el,
          {
            duration: 1.4,
            ease: "power4",
            x: `+=${dx * 110}`,
            y: `+=${dy * 110}`,
          },
          0.06
        )
    }

    const render = () => {
      const { x, y } = mousePos.current
      const last = lastMousePos.current
      const distance = Math.hypot(x - last.x, y - last.y)

      if (distance > DISTANCE_THRESHOLD) {
        showNextImage()
        lastMousePos.current = { x, y }
      }

      cacheMousePos.current.x = lerp(cacheMousePos.current.x, x, 0.1)
      cacheMousePos.current.y = lerp(cacheMousePos.current.y, y, 0.1)

      if (isIdleRef.current && zIndexRef.current !== 1) {
        zIndexRef.current = 1
      }

      rafRef.current = requestAnimationFrame(render)
    }

    const startLoop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(render)
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: true })
    window.addEventListener("resize", updateRects)

    // Kick things off after first movement to avoid jank
    const initMove = () => {
      cacheMousePos.current = { ...mousePos.current }
      lastMousePos.current = { ...mousePos.current }
      startLoop()
      window.removeEventListener("pointermove", initMove)
      window.removeEventListener("touchmove", initMove as any)
    }

    window.addEventListener("pointermove", initMove)
    window.addEventListener("touchmove", initMove as any, { passive: true })

    // If user doesn't move, still start after slight delay so click works
    const idleTimeout = setTimeout(() => {
      startLoop()
    }, 800)

    return () => {
      clearTimeout(idleTimeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("resize", updateRects)
      window.removeEventListener("pointermove", initMove)
      window.removeEventListener("touchmove", initMove as any)
    }
  }, [isReady, photos.length])

  const handleEnter = () => {
    router.push("/work")
  }

  return (
    <div
      ref={containerRef}
      className="trail-hero"
      role="button"
      tabIndex={0}
      onClick={handleEnter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleEnter()
      }}
    >
      <div className="trail-images">
        {photos.map((photo, index) => (
          <div
            key={photo._id || photo.url + index}
            ref={(el) => { imageRefs.current[index] = el }}
            className="trail-img"
          >
            <img className="trail-img-inner" src={photo.url} alt="" />
          </div>
        ))}
      </div>

      <div className="trail-center">
        <div className="trail-title-wrap">
          <h1 ref={titleRef} className="trail-title" aria-label="Sara Lorusso" />
        </div>
      </div>

      <div className="trail-bottom">
        <span className="trail-bottom-left">
          A visual practice exploring vulnerability<br />through personal and collective experience.
        </span>
        <span className="trail-bottom-right">2026</span>
      </div>

      {!isReady && <div className="trail-loader" aria-hidden="true" />}
    </div>
  )
}
