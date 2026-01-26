"use client"
import React from 'react'

interface PlaneFrame {
  id: string
  screenX: number
  screenY: number
  scale: number
  visible: boolean
  filename: string
  imageWidth: number
  imageHeight: number
}

function randomFilename() {
  const n = Math.floor(Math.random() * 9000) + 1
  return `DSC_${String(n).padStart(4, '0')}.jpg`
}

export function PreviewOverlay({ 
  frames 
}: { 
  frames: PlaneFrame[]
}) {
  return (
    <div className="canvas-preview-overlay">
      {frames.map((frame) => {
        // Calculate frame dimensions based on image aspect ratio
        const aspectRatio = frame.imageWidth / frame.imageHeight
        const baseWidth = Math.min(280, Math.max(180, aspectRatio > 1 ? 240 : 180))
        const baseHeight = baseWidth / aspectRatio
        const totalHeight = baseHeight + 28 // Add toolbar height
        
        return (
          <div 
            key={frame.id}
            className="canvas-preview-window"
            style={{
              position: 'absolute',
              left: `${frame.screenX}px`,
              top: `${frame.screenY}px`,
              transform: `translate(-50%, -50%) scale(${frame.scale})`,
              width: `${baseWidth}px`,
              height: `${totalHeight}px`,
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            {/* Window Frame */}
            <div className="preview-window-frame">
              {/* Toolbar */}
              <div className="preview-toolbar">
                <div className="preview-buttons">
                  <span className="btn close" />
                  <span className="btn minimize" />
                  <span className="btn maximize" />
                </div>
                <div className="preview-title">{frame.filename}</div>
                <div className="preview-actions">
                  <span className="icon expand" />
                </div>
              </div>
              
              {/* Image Content Area */}
              <div 
                className="preview-content" 
                style={{
                  width: `${baseWidth}px`,
                  height: `${baseHeight}px`
                }}
              >
                {/* Image placeholder - the 3D image will show through */}
                <div className="preview-image-area" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}