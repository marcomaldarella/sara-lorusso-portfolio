"use client"

import Link from "next/link"

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="w-full pl-[0.75em] pr-[1em] py-0 flex items-center justify-between">
          <Link href="/" className="text-xs nav-name" aria-label="Sara Lorusso" style={{ fontFamily: '"Messina Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400, paddingLeft: '8px', paddingRight: '8px' }}>
            Sara Lorusso
          </Link>

        <div className="flex gap-6 nav-menu" style={{ marginRight: '1em' }}>
          <Link href="/work" className="text-[#111] hover:opacity-60 transition lowercase text-xs nav-link">
            work
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
