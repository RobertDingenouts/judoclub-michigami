'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

function ResetForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Ongeldige of ontbrekende reset-link.')
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setStatus('error')
      setMessage('Wachtwoord moet minimaal 8 tekens zijn.')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('Wachtwoorden komen niet overeen.')
      return
    }
    setSubmitting(true)
    setStatus('idle')
    setMessage('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kon wachtwoord niet wijzigen')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Er is een fout opgetreden')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4">
        <div className="bg-white rounded-none shadow-lg max-w-md w-full p-8 text-center">
          <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
          <h1 className="text-xl font-bold text-[#2a2a2a] mt-4">Wachtwoord gewijzigd</h1>
          <p className="text-gray-600 mt-2 text-sm">Je kunt nu inloggen met je nieuwe wachtwoord.</p>
          <Link href="/signin" className="inline-block mt-6 bg-[#a90000] text-white px-6 py-2.5 rounded-none font-medium hover:bg-[#8c0000] transition-colors">
            Ga naar inloggen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] px-4">
      <div className="bg-white rounded-none shadow-lg max-w-md w-full p-8">
        <h1 className="text-xl font-bold text-[#2a2a2a]">Nieuw wachtwoord instellen</h1>
        <p className="text-gray-600 mt-2 text-sm">Kies een nieuw wachtwoord voor je account.</p>

        {status === 'error' && (
          <div className="mt-4 rounded-none border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nieuw wachtwoord</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-none border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                placeholder="Minimaal 8 tekens"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Herhaal wachtwoord</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-none border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !token}
            className="w-full bg-[#a90000] text-white py-2.5 rounded-none font-medium hover:bg-[#8c0000] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Bezig...' : 'Wachtwoord wijzigen'}
          </button>
        </form>

        <Link href="/signin" className="block text-center text-sm text-gray-500 mt-4 hover:text-[#a90000]">
          Terug naar inloggen
        </Link>
      </div>
    </div>
  )
}

export default function WachtwoordResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Laden...</div>}>
      <ResetForm />
    </Suspense>
  )
}
