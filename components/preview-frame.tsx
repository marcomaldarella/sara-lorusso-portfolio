"use client"
import React from 'react'

function randomFilename() {
  const n = Math.floor(Math.random() * 9000) + 1
  return `DSC_${String(n).padStart(4, '0')}.jpg`
}

export default function PreviewFrame({ className = '' }: { className?: string }) {
  const [name] = React.useState(randomFilename)
  return (
    <div className={`preview-frame ${className}`} aria-hidden="true">
      <div className="preview-toolbar">
        <div className="preview-buttons">
          <span className="btn close" />
          <span className="btn minimize" />
          <span className="btn maximize" />
        </div>
        <div className="preview-title">{name}</div>
        <div className="preview-actions">
          <span className="icon expand" aria-hidden />
        </div>
      </div>
      <div className="preview-content">
        {/* visual frame only - image content is handled by canvas underneath */}
      </div>
    </div>
  )
}
