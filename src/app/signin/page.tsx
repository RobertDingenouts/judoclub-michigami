'use client'

import { useState } from 'react'
import { SeasonalLogo } from '@/components/SeasonalLogo'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useT } from '@/i18n/LangContext'
import { LangToggle } from '@/components/LangToggle'
import { LangProvider } from '@/i18n/LangContext'

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useT()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#a90000] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#8c0000] disabled:opacity-50 shadow-sm"
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('Inloggen...')}
        </>
      ) : (
        t('Inloggen')
      )}
    </button>
  )
}

export default function SignInPage() {
  return (
    <LangProvider>
      <SignInInner />
    </LangProvider>
  )
}

function SignInInner() {
  const router = useRouter()
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [forgotMsg, setForgotMsg] = useState('')

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setForgotStatus('sending')
    setForgotMsg('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Kon verzoek niet verwerken')
      setForgotStatus('sent')
    } catch (err: any) {
      setForgotStatus('error')
      setForgotMsg(err.message || 'Er is een fout opgetreden')
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)

    const emailValue = formData.get('email') as string
    const passwordValue = formData.get('password') as string

    if (!emailValue || !passwordValue) {
      setError('Vul alle velden in')
      return
    }

    setEmail(emailValue)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Inloggen mislukt')
        return
      }

      // Redirect to home page — user avatar shows logged-in state
      router.replace('/')
      router.refresh()
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f0] px-4">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#a90000]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#a90000]/10 blur-3xl" />

      <div className="absolute top-6 right-6 z-10">
        <LangToggle />
      </div>

      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#a90000] hover:text-[#8c0000]">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M9.793 14.707a1 1 0 010-1.414L12.179 11H5a1 1 0 110-2h7.179l-2.386-2.386a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {t('Terug naar website')}
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-lg border border-white/60 bg-white/90 p-8 shadow-[0_8px_40px_-8px_rgba(169,0,0,0.18)] backdrop-blur-xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-[#fdf6f6] to-white p-1 shadow-sm ring-4 ring-[#a90000]/10">
            <SeasonalLogo alt="Judoclub Michigami" className="h-16 w-16 object-contain rounded-full" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#2a2a2a]">{t('Leden Login')}</h1>
          <p className="mt-1 text-sm text-gray-500">Judoclub Michigami</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {t(error)}
          </div>
        )}

        {/* Login form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('E-mailadres')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={email}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-all focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/20"
              placeholder="jan@voorbeeld.nl"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('Wachtwoord')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm transition-all focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/20"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton />
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setForgotOpen(!forgotOpen); setForgotStatus('idle'); setForgotMsg('') }}
            className="text-sm text-gray-500 hover:text-[#a90000] underline-offset-2 hover:underline"
          >
            {t('Wachtwoord vergeten?')}
          </button>
        </div>

        {forgotOpen && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            {forgotStatus === 'sent' ? (
              <p className="text-sm text-green-700">
                {t('Als dit e-mailadres bij ons bekend is, hebben we een reset-link gestuurd. Controleer je inbox.')}
              </p>
            ) : (
              <form onSubmit={handleForgot} className="space-y-3">
                <p className="text-xs text-gray-600">{t('Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.')}</p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="jeroen@voorbeeld.nl"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                />
                {forgotStatus === 'error' && (
                  <p className="text-xs text-red-600">{forgotMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={forgotStatus === 'sending'}
                  className="w-full rounded-lg bg-[#a90000] px-4 py-2 text-sm font-medium text-white hover:bg-[#8c0000] disabled:opacity-50"
                >
                  {forgotStatus === 'sending' ? t('Bezig...') : t('Verstuur reset-link')}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('Nog geen account?')}{' '}
          <Link href="/inschrijven" className="font-medium text-[#a90000] hover:text-[#8c0000]">
            {t('Word lid')}
          </Link>
          {' '}·{' '}
          <Link href="/signup" className="font-medium text-[#a90000] hover:text-[#8c0000]">
            {t('Hoe werkt het?')}
          </Link>
        </p>
      </div>
    </div>
  )
}
