'use client'

import { useEffect } from 'react'

// Maakt de naam (en plaats/datum) net als in Canva: opschalen als hij breder is dan het tekstvak.
export default function DiplomaNaamFitter() {
  useEffect(() => {
    function fit() {
      const MAX_PX = 131.1 * (96 / 72) // Canva-tekstvakbreedte in px
      document.querySelectorAll<HTMLElement>('.naam-waarde').forEach(el => {
        el.style.transform = 'none'
        const w = el.getBoundingClientRect().width
        if (w > MAX_PX) el.style.transform = `scaleX(${(MAX_PX / w).toFixed(4)})`
      })
    }
    fit()
    if (document.fonts?.ready) document.fonts.ready.then(fit)
    window.addEventListener('beforeprint', fit)
    return () => window.removeEventListener('beforeprint', fit)
  }, [])
  return null
}
