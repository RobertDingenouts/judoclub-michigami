'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-md bg-[#a90000] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#8c0000] disabled:opacity-50 shadow-sm"
    >
      {pending ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Registreren...
        </>
      ) : (
        'Registreren'
      )}
    </button>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)

    const nameValue = formData.get('name') as string
    const emailValue = formData.get('email') as string
    const passwordValue = formData.get('password') as string
    const passwordConfirm = formData.get('passwordConfirm') as string

    if (!nameValue || !emailValue || !passwordValue) {
      setError('Vul alle velden in')
      return
    }

    if (passwordValue !== passwordConfirm) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (passwordValue.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters zijn')
      return
    }

    setName(nameValue)
    setEmail(emailValue)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue, email: emailValue, password: passwordValue }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Registratie mislukt')
        return
      }

      // Auto-login succeeded, redirect to member dashboard
      router.replace('/')
      router.refresh()
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0] px-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#a90000] hover:text-[#8c0000]">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M9.793 14.707a1 1 0 010-1.414L12.179 11H5a1 1 0 110-2h7.179l-2.386-2.386a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Terug naar website
        </Link>
      </div>

      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16">
            <img
              src="/logo-hd.png"
              alt="Judoclub Michigami"
              className="h-16 w-16 object-contain rounded-full bg-[#a90000]/10 p-1"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Lid Registreren</h1>
          <p className="mt-1 text-sm text-gray-500">Judoclub Michigami</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Register form */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Naam
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              defaultValue={name}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              placeholder="Jan Jansen"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={email}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              placeholder="jan@voorbeeld.nl"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              placeholder="Minimaal 6 karakters"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="mb-1.5 block text-sm font-medium text-gray-700">
              Wachtwoord bevestigen
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              placeholder="Herhaal je wachtwoord"
            />
          </div>

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Al een account?{' '}
          <Link href="/signin" className="font-medium text-[#a90000] hover:text-[#8c0000]">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
