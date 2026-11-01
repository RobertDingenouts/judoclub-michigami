'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BELTS = [
  { value: 'WIT', label: 'Wit' },
  { value: 'GEEL', label: 'Geel' },
  { value: 'ORANJE', label: 'Oranje' },
  { value: 'GROEN', label: 'Groen' },
  { value: 'BLAUW', label: 'Blauw' },
  { value: 'BRUIN', label: 'Bruine band' },
  { value: 'BRUIN', label: 'Bruine band' },
  { value: 'BRUIN', label: 'Bruine band' },
  { value: 'ZWART_1', label: 'Zwarte band 1e Dan' },
  { value: 'ZWART_2', label: 'Zwarte band 2e Dan' },
  { value: 'ZWART_3', label: 'Zwarte band 3e Dan' },
]

interface Student {
  id: string
  firstName: string
  lastName: string
  currentBelt: string | null
  email: string | null
}

export default function NewExamPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/admin/students')
      .then(r => r.json())
      .then(data => {
        setStudents(data.students || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Fout bij ophalen studenten')
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const memberId = formData.get('memberId') as string
    const member = students.find(s => s.id === memberId)
    if (!member) {
      setError('Selecteer een student')
      setSaving(false)
      return
    }

    const body = {
      memberId,
      userId: member.id, // will be fixed by API
      beltLevel: formData.get('beltLevel') as string,
      examDate: formData.get('examDate') as string || undefined,
      examiner: formData.get('examiner') as string || undefined,
      notes: formData.get('notes') as string || undefined,
      status: 'SCHEDULED',
    }

    try {
      const res = await fetch('/api/exams/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fout bij aanmaken examen')
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/admin/exams'), 1500)
    } catch {
      setError('Fout bij aanmaken examen')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/exams" className="text-gray-400 hover:text-[#a90000]">
          ← Terug
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Nieuw Examen Plannen</h1>
          <p className="text-sm text-gray-500 mt-1">Registreer een nieuw examen voor een student</p>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-sm border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✓ Examen succesvol aangemaakt. Doorverwijzen...
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Student selection */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Student <span className="text-red-500">*</span>
          </label>
          <select
            name="memberId"
            required
            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
          >
            <option value="">Selecteer een student...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} {s.currentBelt ? `(${s.currentBelt})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Exam details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bandniveau <span className="text-red-500">*</span>
            </label>
            <select
              name="beltLevel"
              required
              className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            >
              <option value="">Selecteer band...</option>
              {BELTS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Examen Datum</label>
            <input
              name="examDate"
              type="date"
              className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Examiner</label>
            <input
              name="examiner"
              type="text"
              placeholder="Naam examiner"
              className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Notities</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            placeholder="Optionele notities..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
          >
            {saving ? 'Aanmaken...' : 'Examen Plannen'}
          </button>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 rounded-sm border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}
