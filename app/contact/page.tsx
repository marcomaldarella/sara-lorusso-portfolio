"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 3000)
  }

  return (
    <>
      <main className="min-h-screen pt-24 bg-white text-[#111] relative">
        {/* Grain texture overlay */}
        <div className="fixed inset-0 pointer-events-none z-[5] opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            mixBlendMode: 'multiply'
          }}
        />
        
        <section className="max-w-2xl mx-auto px-6 py-20 relative z-10">
          <h1 className="text-xs mb-8 lowercase">contact</h1>

          <p className="text-xs mb-16 lowercase opacity-70">
            for projects, collaborations, or inquiries
          </p>

        <div className="grid md:grid-cols-2 gap-16 mb-16">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs mb-2 lowercase">name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-transparent border border-[#111]/30 hover:border-[#111] transition focus:outline-none focus:border-[#111] text-xs lowercase"
              />
            </div>

            <div>
              <label className="block text-xs mb-2 lowercase">email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-transparent border border-[#111]/30 hover:border-[#111] transition focus:outline-none focus:border-[#111] text-xs lowercase"
              />
            </div>

            <div>
              <label className="block text-xs mb-2 lowercase">subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-transparent border border-[#111]/30 hover:border-[#111] transition focus:outline-none focus:border-[#111] text-xs lowercase"
              />
            </div>

            <div>
              <label className="block text-xs mb-2 lowercase">message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 bg-transparent border border-[#111]/30 hover:border-[#111] transition focus:outline-none focus:border-[#111] resize-none text-xs lowercase"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#111] text-[#d8d2cd] hover:opacity-80 transition text-xs lowercase"
            >
              {isSubmitted ? "message sent" : "send message"}
            </button>
          </form>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xs mb-2 lowercase opacity-70">email</h3>
              <Link href="mailto:sara@saralorusso.com" className="text-xs hover:opacity-60 transition lowercase">
                sara@saralorusso.com
              </Link>
            </div>

            <div>
              <h3 className="text-xs mb-2 lowercase opacity-70">social</h3>
              <div className="space-y-2">
                <Link href="#" className="block hover:opacity-60 transition text-xs lowercase">
                  instagram
                </Link>
                <Link href="#" className="block hover:opacity-60 transition text-xs lowercase">
                  vimeo
                </Link>
                <Link href="#" className="block hover:opacity-60 transition text-xs lowercase">
                  mulieris magazine
                </Link>
              </div>
            </div>

            <div className="pt-8 border-t border-[#111]/20">
              <p className="text-xs leading-relaxed lowercase opacity-70">
                available for commissions and editorial work. based in bologna, italy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

      {/* Global styles moved to app/globals.css */}
    </>
  )
}
