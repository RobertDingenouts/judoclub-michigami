'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Create user record in our database via API
    if (data.user) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            name,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          setError(err.error || 'Registratie mislukt')
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('Register error:', err)
      }
    }

    setSuccess(true)
    setLoading(false)

    // Auto sign in after successful registration
    setTimeout(() => {
      router.push('/signin')
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registreren</h1>
          <p className="text-gray-600 mt-2">Judoclub Michigami</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Registratie gelukt!
            </h2>
            <p className="text-gray-600">
              Je kunt nu inloggen. Worden doorgestuurd...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Volledige naam"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="jouw@email.nl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wachtwoord (min. 6 karakters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Registreren...' : 'Registreren'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Al een account?{' '}
          <Link href="/signin" className="text-red-700 hover:underline font-medium">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
