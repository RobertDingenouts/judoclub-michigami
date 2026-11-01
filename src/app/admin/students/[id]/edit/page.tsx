'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GROEPEN } from '@/lib/admin2'

interface StudentData {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  phone2: string | null
  whatsappGroup: string | null
  dateOfBirth: string | null
  currentBelt: string | null
  location: string | null
  gender: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  clubStatus: string
  isTrainer: boolean
  portraitRights: boolean | null
  leaveDate: string | null
  remarks: string | null
  trainingGroups: string[] | null
  primaryGroup: string | null
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
  // Inloggegevens van zojuist nieuw aangemaakt account (uit de "nieuw" flow)
  const [newAccount, setNewAccount] = useState<{ tempPassword: string; email: string | null; mailSent: boolean } | null>(null)

  useEffect(() => {
    // Eenmalig ophalen: tijdelijk wachtwoord van net aangemaakt account
    const raw = sessionStorage.getItem('newStudentResult')
    if (raw) {
      sessionStorage.removeItem('newStudentResult')
      try {
        const r = JSON.parse(raw)
        if (r.tempPassword) setNewAccount({ tempPassword: r.tempPassword, email: r.email, mailSent: r.mailSent })
      } catch { /* negeer */ }
    }
  }, [])

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
      <Link href="/admin/leden" className="text-gray-400 hover:text-[#a90000] mb-4 inline-block">← Terug naar Leden</Link>
      <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-center">
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
        phone2: formData.get('phone2') as string || null,
        whatsappGroup: formData.get('whatsappGroup') as string || null,
        dateOfBirth: formData.get('dateOfBirth') as string || null,
        currentBelt: formData.get('currentBelt') as string || null,
        location: formData.get('location') as string || null,
        gender: formData.get('gender') as string || null,
        address: formData.get('address') as string || null,
        postalCode: formData.get('postalCode') as string || null,
        city: formData.get('city') as string || null,
        joinDate: formData.get('joinDate') as string || null,
        role: formData.get('role') as string || null,
        clubStatus: formData.get('clubStatus') as string || null,
        isTrainer: formData.get('isTrainer') === 'on',
        portraitRights: formData.get('portraitRights') === 'on',
        remarks: formData.get('remarks') as string || null,
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
        <Link href="/admin/leden" className="text-gray-400 hover:text-[#a90000]">
          ← Terug naar Leden
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Student Bewerken</h1>
          <p className="text-sm text-gray-500 mt-1">{student.firstName} {student.lastName}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {newAccount && (
        <div className="rounded-sm border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">Account aangemaakt — tijdelijk inloggegevens</p>
            <button onClick={() => setNewAccount(null)} className="text-blue-500 hover:text-blue-800 font-bold px-1" aria-label="Sluiten">×</button>
          </div>
          <p>
            E-mail: <strong>{newAccount.email}</strong> · Tijdelijk wachtwoord:{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono">{newAccount.tempPassword}</code>
          </p>
          <p className="text-xs text-blue-700">
            {newAccount.mailSent
              ? 'De inloggegevens zijn per e-mail verzonden.'
              : 'De e-mail kon niet worden verstuurd — geef het tijdelijke wachtwoord handmatig door.'}{' '}
            Het lid kan het wachtwoord wijzigen in "Profiel en instellingen".
          </p>
        </div>
      )}
      {success && (
        <div className="rounded-sm border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✓ Student succesvol bijgewerkt
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {/* Personal info */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Persoonlijke Gegevens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Voornaam" name="firstName" defaultValue={student.firstName} required />
            <FormField label="Achternaam" name="lastName" defaultValue={student.lastName} required />
            <FormField label="E-mail" name="email" type="email" defaultValue={student.email || ''} />
            <FormField label="Telefoon" name="phone" type="tel" defaultValue={student.phone || ''} />
            <FormField label="Telefoon (2e)" name="phone2" type="tel" defaultValue={student.phone2 || ''} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Groepsapp</label>
              <select
                name="whatsappGroup"
                defaultValue={student.whatsappGroup || ''}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Nee, bedankt</option>
                <option value="ja1">Ja — telefoonnummer 1</option>
                <option value="ja2">Ja — telefoonnummer 2</option>
                <option value="ja12">Ja — beide telefoonnummers</option>
              </select>
            </div>
            <FormField label="Geboortedatum" name="dateOfBirth" type="date" defaultValue={student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ''} />
            <FormField label="Lid vanaf" name="joinDate" type="date" defaultValue={student.joinDate ? new Date(student.joinDate).toISOString().split('T')[0] : ''} />
            <FormField label="Adres" name="address" defaultValue={student.address || ''} />
            <FormField label="Postcode" name="postalCode" defaultValue={student.postalCode || ''} />
            <FormField label="Woonplaats" name="city" defaultValue={student.city || ''} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Geslacht</label>
              <select
                name="gender"
                defaultValue={student.gender || ''}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Onbekend</option>
                <option value="M">Man</option>
                <option value="V">Vrouw</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Band</label>
              <select
                name="currentBelt"
                defaultValue={student.currentBelt || ''}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="">Geen band</option>
                {BELTS.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Rol (inlogrecht)</label>
              <select
                name="role"
                defaultValue={student.user?.role || 'MEMBER'}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">Rol = wat het account mag in het systeem. Clubstatus hieronder = of iemand meejudot.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Clubstatus</label>
              <select
                name="clubStatus"
                defaultValue={student.clubStatus || 'LID'}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
              >
                <option value="LID">Lid</option>
                <option value="PROEF">Proefles</option>
                <option value="RESERVE">Reserve</option>
                <option value="VRIJGESTELD">Vrijgesteld (betaalt geen contributie)</option>
                <option value="STOPPEND">Stoppend</option>
                <option value="GESTOPT">Gestopt</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Trainingslocatie</label>
              <select
                name="location"
                defaultValue={student.location || ''}
                className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
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
          <p className="text-sm text-gray-500 mb-3">Vink de groepen aan waarin dit lid meetelt in het lessenrooster. De hoofdgroep bepaalt in welke leslijst het lid standaard verschijnt.</p>
          <div className="space-y-2">
            {GROEPEN.map(group => {
              const isSelected = (student.trainingGroups || []).includes(group.value) || student.primaryGroup === group.value
              return (
                <label key={group.value} className="flex items-center gap-3 rounded-sm border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="trainingGroups"
                    value={group.value}
                    defaultChecked={isSelected}
                    className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{group.label}</span>
                    {group.dag && <span className="ml-2 text-xs text-gray-400">{group.dag} · {group.locatie}</span>}
                  </div>
                </label>
              )
            })}
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Hoofdgroep (leslijst + examens)
            </label>
            <select
              name="primaryGroup"
              defaultValue={student.primaryGroup || ''}
              className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            >
              <option value="">Geen hoofdgroep</option>
              {GROEPEN.map(g => (
                <option key={g.value} value={g.value}>{g.label}{g.dag ? ` — ${g.dag}` : ' — o.a. trainers'}</option>
              ))}
            </select>
          </div>
          <label className="mt-4 flex items-center gap-3 rounded-sm border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              name="isTrainer"
              defaultChecked={student.isTrainer}
              className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]"
            />
            <span className="text-sm font-medium text-gray-700">Trainer — verschijnt onderaan élke les in de lesmodus</span>
          </label>
        </div>

        {/* Notities */}
        <div>
          <h2 className="text-lg font-semibold text-[#2a2a2a] mb-4">Notities</h2>
          <textarea
            name="remarks"
            defaultValue={student.remarks || ''}
            rows={2}
            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
            placeholder="Interne notities bij dit lid"
          />
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
            className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
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
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={student.isActive}
              className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]"
            />
            <span className="text-sm font-medium text-gray-700">Actief lid</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="portraitRights"
              defaultChecked={student.portraitRights !== false}
              className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]"
            />
            <span className="text-sm font-medium text-gray-700">Portretrecht (foto's mogen getoond worden)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
          <Link
            href={`/admin/students/${student.id}`}
            className="inline-flex items-center gap-2 rounded-sm border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
        className="w-full rounded-sm border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
      />
    </div>
  )
}
