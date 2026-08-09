'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TRAINING_GROUPS, GROUP_LABELS_NL } from '@/lib/student-progress-types'
import type { TrainingGroupValue } from '@/lib/student-progress-types'

interface StudentData {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  currentBelt: string | null
  location: string | null
  trainingGroups: TrainingGroupValue[] | null
  primaryGroup: TrainingGroupValue | null
  joinDate: string
  isActive: boolean
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  medicalNotes: string | null
  user: {
    role: string
  }
}

const BELTS = [
  { value: 'WIT', label: 'Witte band' },
  { value: 'WIT_GEEL', label: 'Witte band met gele slip' },
  { value: 'GEEL', label: 'Gele band' },
  { value: 'GEEL_ORANJE', label: 'Gele band met oranje slip' },
  { value: 'ORANJE', label: 'Oranje band' },
  { value: 'ORANJE_GROEN', label: 'Oranje band met groene slip' },
  { value: 'GROEN', label: 'Groene band' },
  { value: 'GROEN_BLAUW', label: 'Groene band met blauwe slip' },
  { value: 'BLAUW', label: 'Blauwe band' },
  { value: 'BLAUW_BRUIN', label: 'Blauwe band met bruine slip' },
  { value: 'BRUIN', label: 'Bruine band' },
  { value: 'ZWART_1', label: 'Zwarte band 1e Dan' },
  { value: 'ZWART_2', label: 'Zwarte band 2e Dan' },
  { value: 'ZWART_3', label: 'Zwarte band 3e Dan' },
  { value: 'ZWART_4', label: 'Zwarte band 4e Dan' },
  { value: 'ZWART_5', label: 'Zwarte band 5e Dan' },
  { value: 'ZWART_6', label: 'Zwarte band 6e Dan' },
  { value: 'ZWART_7', label: 'Zwarte band 7e Dan' },
  { value: 'ZWART_8', label: 'Zwarte band 8e Dan' },
  { value: 'ZWART_9', label: 'Zwarte band 9e Dan' },
  { value: 'ZWART_10', label: 'Zwarte band 10e Dan' },
]

const ROLES = [
  { value: 'MEMBER', label: 'Lid' },
  { value: 'PARENT', label: 'Ouder' },
  { value: 'INSTRUCTOR', label: 'Instructor' },
  { value: 'ADMIN', label: 'Admin' },
]

export default function StudentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [student, setStudent] = useState<StudentData | null>(null)

  useEffect(() => {
    params.then((p) => setResolvedParams(p))
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return
    const id = resolvedParams.id
    async function fetchStudent() {
      try {
        const res = await fetch(`/api/admin/students/${id}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Student niet gevonden')
          return
        }
        setStudent(data.member)
      } catch {
        setError('Fout bij ophalen student')
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [resolvedParams])

  if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>
  if (error && !student) return (
    <div className="p-8">
      <Link href="/admin/students" className="text-gray-400 hover:text-[#a90000] mb-4 inline-block">← Terug</Link>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  )
  if (!student) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    try {
      // trainingGroups komt van meerdere checkboxes -> FormData geeft een
      // comma-string (geen JSON). Parse veilig naar een array.
      const rawGroups = formData.getAll('trainingGroups')
      const trainingGroups =
        rawGroups.length > 0
          ? rawGroups.map((g) => String(g))
          : JSON.parse((formData.get('trainingGroups') as string) || '[]')

      const body: Record<string, any> = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        dateOfBirth: formData.get('dateOfBirth') as string || null,
        currentBelt: formData.get('currentBelt') as string || null,
        location: formData.get('location') as string || null,
        joinDate: formData.get('joinDate') as string || null,
        role: formData.get('role') as string || null,
        isActive: formData.get('isActive') === 'on',
        trainingGroups,
        primaryGroup: formData.get('primaryGroup') as string || null,
        emergencyContactName: formData.get('emergencyContactName') as string || null,
        emergencyContactPhone: formData.get('emergencyContactPhone') as string || null,
        medicalNotes: formData.get('medicalNotes') as string || null,
        tempPassword: (formData.get('tempPassword') as string) || '',
      }

      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fout bij opslaan')
        return
      }
      setSuccess(true)
      setStudent(data.member)
    } catch {
      setError('Fout bij opslaan student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/students/${student.id}`} className="text-gray-400 hover:text-[#a90000]">
          ← Terug
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Student Bewerken</h1>
          <p className="text-sm text-gray-500 mt-1">{student.firstName} {student.lastName}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✓ Student succesvol bijgewerkt
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Personal info */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Persoonlijke Gegevens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Voornaam" name="firstName" defaultValue={student.firstName} required />
            <FormField label="Achternaam" name="lastName" defaultValue={student.lastName} required />
            <FormField label="E-mail" name="email" type="email" defaultValue={student.email || ''} />
            <FormField label="Telefoon" name="phone" type="tel" defaultValue={student.phone || ''} />
            <FormField label="Geboortedatum" name="dateOfBirth" type="date" defaultValue={student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ''} />
            <FormField label="Lid vanaf" name="joinDate" type="date" defaultValue={student.joinDate ? new Date(student.joinDate).toISOString().split('T')[0] : ''} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Band</label>
              <select
                name="currentBelt"
                defaultValue={student.currentBelt || ''}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Geen band</option>
                {BELTS.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Rol</label>
              <select
                name="role"
                defaultValue={student.user?.role || 'MEMBER'}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Trainingslocatie</label>
              <select
                name="location"
                defaultValue={student.location || ''}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Geen locatie</option>
                <option value="STeenbergen">Steenbergen</option>
                <option value="OUD_VOSSEMEER">Oud-Vossemeer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Training groups */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Trainingsgroepen</h2>
          <p className="text-sm text-gray-500 mb-3">Selecteer de groepen waar deze student aan deelneemt.</p>
          <div className="space-y-2">
            {TRAINING_GROUPS.map(group => {
              const isSelected = (student.trainingGroups || []).includes(group.value)
              return (
                <label key={group.value} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="trainingGroups"
                    value={group.value}
                    defaultChecked={isSelected}
                    className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{group.label}</span>
                  </div>
                </label>
              )
            })}
          </div>
          {(student.trainingGroups || []).length > 1 && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Hoofdgroep (voor examens)
                <span className="text-xs text-gray-400 font-normal ml-2">— deze groep wordt gebruikt voor bandexamens</span>
              </label>
              <select
                name="primaryGroup"
                defaultValue={student.primaryGroup || ''}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Selecteer hoofdgroep...</option>
                {TRAINING_GROUPS.filter(g => (student.trainingGroups || []).includes(g.value)).map(g => (
                  <option key={g.value} value={g.value}>{GROUP_LABELS_NL[g.value]}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Emergency contact */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Noodcontact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Naam" name="emergencyContactName" defaultValue={student.emergencyContactName || ''} />
            <FormField label="Telefoon" name="emergencyContactPhone" type="tel" defaultValue={student.emergencyContactPhone || ''} />
          </div>
        </div>

        {/* Medical notes */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Medische Notities</h2>
          <textarea
            name="medicalNotes"
            defaultValue={student.medicalNotes || ''}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            placeholder="Allergieën, aandoeningen, etc."
          />
        </div>

        {/* Login access */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Inlog Account</h2>
          <p className="text-sm text-gray-500 mb-4">
            {student.email
              ? 'Laat leeg om het huidige wachtwoord te behouden. Vul alleen in om het wachtwoord te wijzigen.'
              : 'Zodra je een email invult, kun je hier een tijdelijk wachtwoord instellen.'}
          </p>
          <FormField label="Tijdelijk wachtwoord" name="tempPassword" type="password" defaultValue="" placeholder="Vul in om wachtwoord te instellen" />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={student.isActive}
              className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]"
            />
            <span className="text-sm font-medium text-gray-700">Actief lid</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
          <Link
            href={`/admin/students/${student.id}`}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}

function FormField({ label, name, type = 'text', defaultValue = '', required = false, placeholder }: {
  label: string; name: string; type?: string; defaultValue?: string; required?: boolean; placeholder?: string
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
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
      />
    </div>
  )
}
