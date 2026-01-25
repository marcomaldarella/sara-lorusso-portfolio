"use client"

import { X } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  image: string
  category: string
  year: number
  details: string
  technologies: string[]
}

interface PortfolioModalProps {
  project: Project
  onClose: () => void
}

export default function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.title}
            className="w-full rounded-lg mb-6 object-cover max-h-96"
          />

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">ABOUT</h3>
              <p className="text-foreground">{project.details}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">CATEGORY</h3>
              <p className="text-foreground">{project.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">YEAR</h3>
              <p className="text-foreground">{project.year}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">TECHNOLOGIES</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
