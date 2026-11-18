'use client'

import { useEffect } from 'react'

// Schaal A4-brede printinhoud op mobiel scherm passend (CSS zoom; print zelf blijft 1:1
// via @media print { .print-fit { zoom: 1 } } in globals.css).
export default function PrintFitter() {
  useEffect(() => {
    const fit = () => {
      const t = document.querySelector<HTMLElement>('.print-fit')
      if (!t) return
      t.style.zoom = ''
      const kids = Array.from(t.querySelectorAll<HTMLElement>('.diploma-page, table, .print-shell'))
        .map(e => e.offsetWidth)
      const nat = Math.max(t.scrollWidth, ...kids, 0)
      const w = document.documentElement.clientWidth
      const s = nat > w + 2 ? (w - 4) / nat : 1
      if (s < 1) t.style.zoom = String(s)
    }
    fit()
    addEventListener('resize', fit)
    return () => removeEventListener('resize', fit)
  }, [])
  return null
}
