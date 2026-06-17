'use client'

import { useState, useEffect } from 'react'
import { fetchUserDiplomas, getDiplomaDownloadUrl } from '@/lib/actions/diploma-actions'

interface Diploma {
  id: string
  type: string
  title: string
  description: string | null | undefined
  beltLevel: any // BeltLevel enum from Prisma
  awardedAt: Date
  verificationCode: string
}

const BELT_COLORS: Record<string, string> = {
  WIT: '#FFFFFF',
  WIT_GEEL: '#FFFFFF',
  GEEL: '#FFD700',
  GEEL_ORANJE: '#FFD700',
  ORANJE: '#FF8C00',
  ORANJE_GROEN: '#FF8C00',
  GROEN: '#228B22',
  GROEN_BLAUW: '#228B22',
  BLAUW: '#0000FF',
  BLAUW_BRUIN: '#0000FF',
  BRUIN: '#8B4513',
  ZWART_1: '#000000',
  ZWART_2: '#000000',
  ZWART_3: '#000000',
  ZWART_4: '#000000',
  ZWART_5: '#000000',
  ZWART_6: '#000000',
  ZWART_7: '#000000',
  ZWART_8: '#000000',
  ZWART_9: '#000000',
  ZWART_10: '#000000',
}

interface DiplomasSectionProps {
  userId?: string
}

export function DiplomasSection({ userId }: DiplomasSectionProps) {
  const [diplomas, setDiplomas] = useState<Diploma[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null)

  useEffect(() => {
    // If userId prop provided, use it directly
    if (userId) {
      setResolvedUserId(userId)
      fetchUserDiplomas(userId).then((data) => {
        setDiplomas(data.map(d => ({ id: d.id, type: d.type, title: d.title, description: d.description ?? undefined, beltLevel: d.beltLevel ?? undefined, awardedAt: d.awardedAt, verificationCode: d.verificationCode })))
        setLoading(false)
      })
      return
    }

    // Otherwise fetch current user from auth API
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setResolvedUserId(data.user.id)
          return fetchUserDiplomas(data.user.id)
        } else {
          setLoading(false)
          return []
        }
      })
      .then((data: any) => {
        if (data) {
          setDiplomas(data.map(d => ({ id: d.id, type: d.type, title: d.title, description: d.description ?? undefined, beltLevel: d.beltLevel ?? undefined, awardedAt: d.awardedAt, verificationCode: d.verificationCode })))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const currentUserId = userId || resolvedUserId

  const handleDownload = async (diplomaId: string) => {
    setDownloadingId(diplomaId)
    try {
      const url = await getDiplomaDownloadUrl(diplomaId)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleShare = async (diploma: Diploma) => {
    const verifyUrl = `${window.location.origin}/diploma/verifieren?code=${diploma.verificationCode}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: diploma.title,
          text: `Verifieer mijn judo diploma: ${diploma.title}`,
          url: verifyUrl,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(verifyUrl)
      alert('Verificatielink gekopieerd naar klembord!')
    }
  }

  if (!currentUserId && !loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Mijn Diplomas</h1>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">Inloggen vereist om je diplomas te bekijken</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-800">Log in om je judo diplomas te bekijken en te downloaden.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Mijn Diplomas</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Je behaalde judo examens en certificaten</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#a90000] border-t-transparent rounded-full" />
        </div>
      )}

      {/* Empty state */}
      {!loading && diplomas.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">🎓</div>
          <h3 className="font-bold text-gray-700">Nog geen diplomas</h3>
          <p className="text-sm text-gray-500">
            Wanneer je een judo examen haalt, ontvang je automatisch een digitaal diploma.
          </p>
        </div>
      )}

      {/* Diploma list */}
      {!loading && diplomas.length > 0 && (
        <div className="space-y-4">
          {diplomas.map((diploma) => {
            const beltColor = diploma.beltLevel ? (BELT_COLORS[diploma.beltLevel] || '#a90000') : '#a90000'
            const isWhiteBelt = diploma.beltLevel === 'WIT'
            const isCourseJapanese = diploma.type === 'COURSE_JAPANESE'

            return (
              <div
                key={diploma.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow ${
                  isCourseJapanese ? 'ring-2 ring-yellow-200' : ''
                }`}
              >
                {/* Belt color bar */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: beltColor }}
                />

                <div className="p-4 sm:p-5">
                  {/* Type badge */}
                  {isCourseJapanese && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                        🎓 Cursus Japans
                      </span>
                    </div>
                  )}
                  {/* Title and date */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{diploma.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(diploma.awardedAt).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Belt badge */}
                    {diploma.beltLevel && (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                          isWhiteBelt ? 'border border-gray-300 text-gray-600' : 'text-white'
                        }`}
                        style={{ backgroundColor: isWhiteBelt ? '#fff' : beltColor }}
                      >
                        {diploma.beltLevel.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {diploma.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {diploma.description}
                    </p>
                  )}

                  {/* Verification code */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Verificatiecode:</span>
                    <code className="text-xs font-mono bg-white px-2 py-0.5 rounded border">
                      {diploma.verificationCode}
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(diploma.id)}
                      disabled={downloadingId === diploma.id}
                      className="flex-1 bg-[#a90000] hover:bg-[#8c0000] text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {downloadingId === diploma.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(diploma)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Delen
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
