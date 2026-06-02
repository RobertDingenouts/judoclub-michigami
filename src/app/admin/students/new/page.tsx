'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BELTS = [
  { value: 'WIT', label: 'Wit' },
  { value: 'GEEL', label: 'Geel' },
  { value: 'ORANJE', label: 'Oranje' },
  { value: 'GROEN', label: 'Groen' },
  { value: 'BLAUW', label: 'Blauw' },
  { value: 'BRUIN_1', label: 'Bruin 1' },
  { value: 'BRUIN_2', label: 'Bruin 2' },
  { value: 'BRUIN_3', label: 'Bruin 3' },
  { value: 'Zwart_1', label: 'Zwart 1' },
  { value: 'Zwart_2', label: 'Zwart 2' },
  { value: 'Zwart_3', label: 'Zwart 3' },
]

export default function NewStudentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      currentBelt: formData.get('currentBelt') as string || undefined,
      emergencyContactName: formData.get('emergencyContactName') as string || undefined,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string || undefined,
      medicalNotes: formData.get('medicalNotes') as string || undefined,
    }

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fout bij aanmaken student')
        return
      }
      router.push(`/admin/students/${data.member.id}`)
    } catch {
      setError('Fout bij aanmaken student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/students" className="text-gray-400 hover:text-[#a90000]">
          ← Terug
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Nieuwe Student Toevoegen</h1>
          <p className="text-sm text-gray-500 mt-1">Registreer een nieuwe student</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Personal info */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Persoonlijke Gegevens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Voornaam" name="firstName" required />
            <FormField label="Achternaam" name="lastName" required />
            <FormField label="E-mail" name="email" type="email" />
            <FormField label="Telefoon" name="phone" type="tel" />
            <FormField label="Geboortedatum" name="dateOfBirth" type="date" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Band</label>
              <select
                name="currentBelt"
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Geen band</option>
                {BELTS.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Noodcontact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Naam" name="emergencyContactName" />
            <FormField label="Telefoon" name="emergencyContactPhone" type="tel" />
          </div>
        </div>

        {/* Medical notes */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Medische Notities</h2>
          <textarea
            name="medicalNotes"
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            placeholder="Allergieën, aandoeningen, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
          >
            {saving ? 'Aanmaken...' : 'Student Toevoegen'}
          </button>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}

function FormField({ label, name, type = 'text', required = false }: {
  label: string; name: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
      />
    </div>
  )
}
