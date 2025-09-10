"use client";

import { useEffect } from "react";

export function ClientBody({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const canvas = document.getElementById("stars-canvas") as HTMLCanvasElement | null
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    const DPR = Math.min(2, window.devicePixelRatio || 1)
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
    }))

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      canvas.style.width = w + "px"
      canvas.style.height = h + "px"
    }

    const render = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "rgba(255,255,255,0.9)"

      for (const s of stars) {
        s.x = (s.x + s.vx + 1) % 1
        s.y = (s.y + s.vy + 1) % 1
        const px = s.x * w
        const py = s.y * h
        const r = Math.max(0.5, 1.8 * s.z)
        ctx.globalAlpha = 0.6 * s.z
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 0.25
      ctx.strokeStyle = "rgba(56,189,248,0.35)" // cyan-400
      for (let i = 0; i < 5; i++) {
        const y = ((performance.now() / 2000 + i * 0.2) % 1) * h
        ctx.beginPath()
        for (let x = 0; x <= w; x += 6) {
          const t = (x / w) * Math.PI * 2
          const offset = Math.sin(t + i) * 10 * DPR
          const yy = y + offset
          if (x === 0) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.stroke()
      }

      raf = requestAnimationFrame(render)
    }

    resize()
    render()
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <>{children}</>
}
