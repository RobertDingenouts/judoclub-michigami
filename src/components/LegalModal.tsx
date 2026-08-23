'use client'

import { useEffect, useRef } from 'react'
import { legalDocuments, type LegalDocument } from '@/data/legal'

/**
 * LegalModal — toont een juridisch document (privacyverklaring, algemene
 * voorwaarden, gedragscode) in een overlay.
 *
 * Waarom een modal en geen link naar /#juridisch?
 * Op mobiel opent `target="_blank"` de homepage vaak in hetzelfde tabblad,
 * waardoor iemand die het inschrijfformulier invult zijn ingevulde data
 * verliest en alles opnieuw moet invullen. Met een modal blijft het
 * formulier (met alle data) gewoon staan achter de overlay.
 */
export function LegalModal({ docId, onClose }: { docId: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const doc: LegalDocument | undefined = legalDocuments.find(d => d.id === docId)

  // Focus de sluitknop + blokkeer body-scroll + Escape sluit.
  useEffect(() => {
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!doc) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
    >
      {/* Backdrop — klik sluit */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        {/* Kop */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-bold leading-snug text-[#2a2a2a]">{doc.title}</h2>
            {(doc.version || doc.lastUpdated) && (
              <p className="mt-0.5 text-xs text-gray-500">
                {[doc.version && `Versie ${doc.version}`, doc.lastUpdated && `Bijgewerkt: ${doc.lastUpdated}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a90000]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Inhoud — scrollbaar (min-h-0 zodat de flex-child kan krimpen & scrollen) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {doc.sections.map((section, i) => (
              <section key={i}>
                <h3 className="mb-1.5 text-sm font-semibold text-[#a90000]">{section.heading}</h3>
                {section.content && (
                  <div className="space-y-2 text-sm leading-relaxed text-gray-700">
                    {section.content.split(/\n\n+/).map((para, j) => (
                      <p key={j} className={para.startsWith('- ') ? 'list-disc pl-4' : ''}>
                        {para.replace(/^-\s?/gm, '')}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Voet — sluiten */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#8c0000] focus:outline-none focus:ring-2 focus:ring-[#a90000]"
          >
            Begrepen, sluiten
          </button>
        </div>
      </div>
    </div>
  )
}
