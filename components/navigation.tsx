"use client"

import Link from "next/link"

type NavigationProps = {
  hideName?: boolean
}

export default function Navigation({ hideName = false }: NavigationProps) {
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="w-full pl-[0.75em] pr-[1em] py-[0.75em] pt-[1.4em] flex items-start justify-between">
        <Link
          href="/"
          className="nav-name"
          aria-label="Sara Lorusso"
          aria-hidden={hideName}
          style={{
            fontFamily:
              '"Messina Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontWeight: 400,
            paddingLeft: "8px",
            paddingRight: "8px",
            fontSize: "14px",
            lineHeight: "1",
            visibility: hideName ? "hidden" : "visible",
            pointerEvents: hideName ? "none" : "auto",
          }}
        >
          <span className="nav-name-lines">
            <span>Sara</span>
            <span>Lorusso</span>
          </span>
        </Link>

        <div className="flex gap-6 nav-menu" style={{ marginRight: "1em" }}>
          <Link href="/personal" className="text-[#111] hover:opacity-60 transition lowercase text-xs nav-link">
            personal
          </Link>
          <Link href="/commissioned" className="text-[#111] hover:opacity-60 transition lowercase text-xs nav-link">
            commissioned
          </Link>
          <Link href="/about" className="text-[#111] hover:opacity-60 transition lowercase text-xs nav-link">
            about
          </Link>
          <a href="mailto:lorussosara1995@gmail.com" className="text-[#111] hover:opacity-60 transition lowercase text-xs nav-link">
            contact
          </a>
        </div>
      </div>
    </nav>
  )
}
