'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyDiplomaPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    valid: boolean
    diploma?: {
      id: string
      title: string
      recipientName: string
      beltLevel: string | null
      awardedAt: Date
      verificationCode: string
    }
  } | null>(null)
  const [error, setError] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/diplomas/verify?code=${encodeURIComponent(code)}`)
      const data = await res.json()

      if (!res.ok) {
        setResult({ valid: false })
        setError(data.error || 'Diploma niet gevonden')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('Er ging iets mis bij het verifiëren')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-6 text-white">
          <h1 className="text-2xl font-bold">Diploma Verifiëren</h1>
          <p className="text-white/80 mt-1">Controleer de authenticiteit van een judo diploma</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Input form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verificatiecode
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MJ-XXXX-XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a90000] focus:border-transparent uppercase tracking-wider font-mono text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code}
              className="w-full bg-[#a90000] hover:bg-[#8c0000] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Controleren...' : 'Verifiëren'}
            </button>
          </form>

          {/* Result */}
          {result?.valid && result.diploma && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-green-800">Geldig diploma</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ontvanger:</span>
                  <span className="font-medium">{result.diploma.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Titel:</span>
                  <span className="font-medium">{result.diploma.title}</span>
                </div>
                {result.diploma.beltLevel && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Band:</span>
                    <span className="font-medium">{result.diploma.beltLevel}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Datum:</span>
                  <span className="font-medium">
                    {new Date(result.diploma.awardedAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {result.diploma.verificationCode}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!result?.valid && (error || result?.valid === false) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="font-bold text-red-800">Ongeldig diploma</h3>
              </div>
              <p className="text-sm text-red-700">{error || 'De opgegeven verificatiecode is niet geldig of bestaat niet.'}</p>
            </div>
          )}

          {/* Back link */}
          <button
            onClick={() => router.push('/')}
            className="text-[#a90000] hover:underline text-sm"
          >
            ← Terug naar de website
          </button>
        </div>
      </div>
    </div>
  )
}
