import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ textAlign: "center", pointerEvents: "none" }}>
        <div
          style={{
            fontFamily: '"Messina Sans", system-ui, -apple-system, sans-serif',
            fontWeight: 400,
            fontSize: "clamp(100px, 20vw, 220px)",
            lineHeight: 0.85,
            letterSpacing: "-0.12em",
            color: "#000",
          }}
        >
          404
        </div>
        <div
          style={{
            fontFamily: '"Messina Sans", system-ui, -apple-system, sans-serif',
            fontWeight: 400,
            fontSize: "clamp(32px, 6.5vw, 80px)",
            letterSpacing: "-0.06em",
            color: "#000",
            marginTop: "0.3em",
          }}
        >
          Sara Lorusso
        </div>
      </div>

      <div className="trail-bottom">
        <span className="trail-bottom-left">
          Page not found.
        </span>
        <Link
          href="/"
          className="trail-bottom-right"
          style={{ pointerEvents: "auto", color: "#0a0a0a", textDecoration: "none" }}
        >
          ← home
        </Link>
      </div>
    </div>
  )
}
