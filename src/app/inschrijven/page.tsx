'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TRAINING_GROUPS } from '@/lib/student-progress-types'
import { LegalModal } from '@/components/LegalModal'
import { ActionCostNote } from '@/components/ActionCostNote'

export default function InschrijvenPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [legalDoc, setLegalDoc] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    postalCode: '',
    city: '',
    location: '',
    preferredGroup: '',
    isChild: false,
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    medicalNotes: '',
    emergencyContact: '',
    costAgreed: false,
    privacyAgreed: false,
    termsAgreed: false,
    codeOfConduct: false,
    portraitRights: true,
    nameMention: true,
  })

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep1 = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Vul je naam in'
    if (!form.email.trim() || !form.email.includes('@')) return 'Vul een geldig e-mailadres in'
    if (!form.phone.trim()) return 'Vul je telefoonnummer in'
    if (!form.dateOfBirth) return 'Vul je geboortedatum in'
    if (!form.location) return 'Kies een locatie'
    return null
  }

  const validateStep2 = () => {
    if (!form.costAgreed) return 'Je moet akkoord gaan met de kosten'
    if (!form.privacyAgreed) return 'Je moet de privacyverklaring accepteren'
    if (!form.termsAgreed) return 'Je moet de algemene voorwaarden accepteren'
    if (!form.codeOfConduct) return 'Je moet de gedragscode accepteren'
    if (form.isChild && (!form.parentName.trim() || !form.parentEmail.trim())) return 'Vul de gegevens van de ouder/voogd in'
    return null
  }

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)

    try {
      const payload: Record<string, any> = { ...form }
      payload.dateOfBirth = payload.dateOfBirth ? new Date(payload.dateOfBirth).toISOString() : null

      const res = await fetch('/api/inschrijven', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Inschrijven mislukt')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0] px-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Inschrijving verzonden!</h1>
          <p className="mt-3 text-gray-600">
            Je inschrijfformulier is ontvangen. We nemen zo snel mogelijk contact met je op.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Je ontvangt binnen enkele dagen een bevestiging van de club.
          </p>
          <div className="mt-8">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#8c0000]">
              Terug naar website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#a90000] hover:text-[#8c0000]">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M9.793 14.707a1 1 0 010-1.414L12.179 11H5a1 1 0 110-2h7.179l-2.386-2.386a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Terug naar website
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Logo + Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-20 w-20">
            <img src="/logo-hd.png" alt="Judoclub Michigami" className="h-20 w-20 object-contain rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-[#2a2a2a]">Inschrijven</h1>
          <p className="mt-2 text-gray-600">Vul het formulier in om je aan te melden bij Judoclub Michigami</p>
        </div>

        {/* Progress steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${step >= 1 ? 'bg-[#a90000] text-white' : 'bg-gray-200 text-gray-500'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-xs">1</span>
            Persoonlijke gegevens
          </div>
          <div className={`h-px w-8 ${step >= 2 ? 'bg-[#a90000]' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${step >= 2 ? 'bg-[#a90000] text-white' : 'bg-gray-200 text-gray-500'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-xs">2</span>
            Akkoorden & Kosten
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Persoonlijke gegevens</h2>

              {/* Naam */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Voornaam *</label>
                  <input type="text" required value={form.firstName} onChange={e => update('firstName', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                    placeholder="Jan" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Achternaam *</label>
                  <input type="text" required value={form.lastName} onChange={e => update('lastName', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                    placeholder="Jansen" />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mailadres *</label>
                  <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                    placeholder="jan@voorbeeld.nl" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefoonnummer *</label>
                  <input type="tel" required value={form.phone} onChange={e => update('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                    placeholder="06-12345678" />
                </div>
              </div>

              {/* Geboortedatum + Geslacht */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Geboortedatum *</label>
                  <input type="date" required value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Geslacht</label>
                  <select value={form.gender} onChange={e => update('gender', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]">
                    <option value="">Selecteer...</option>
                    <option value="M">Mannelijk</option>
                    <option value="V">Vrouwelijk</option>
                    <option value="A">Anders</option>
                  </select>
                </div>
              </div>

              {/* Adres */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Straat + huisnummer</label>
                <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                  placeholder="Forumlust 123" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Postcode</label>
                  <input type="text" value={form.postalCode} onChange={e => update('postalCode', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                    placeholder="4881 AA" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Woonplaats</label>
                  <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                    placeholder="Steenbergen" />
                </div>
              </div>

              {/* Locatie */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Trainingslocatie *</label>
                <select value={form.location} onChange={e => update('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                  required>
                  <option value="">Selecteer locatie...</option>
                  <option value="STeenbergen">Steenbergen</option>
                  <option value="OUD_VOSSEMEER">Oud-Vossemeer</option>
                </select>
              </div>

              {/* Voorkeursgroep */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Voorkeursgroep</label>
                <p className="text-xs text-gray-500 mb-1.5">Selecteer je voorkeur, de admin bepaalt de definitieve indeling.</p>
                <select value={form.preferredGroup} onChange={e => update('preferredGroup', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]">
                  <option value="">Selecteer groep...</option>
                  {TRAINING_GROUPS.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              {/* Is child? */}
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
                <input type="checkbox" id="isChild" checked={form.isChild} onChange={e => update('isChild', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                <label htmlFor="isChild" className="text-sm text-gray-700">
                  Dit is een inschrijving voor een kind (ouder/voogd vult in)
                </label>
              </div>

              {/* Parent info */}
              {form.isChild && (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-[#2a2a2a]">Gegevens ouder/voogd *</h3>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Naam ouder/voogd</label>
                    <input type="text" value={form.parentName} onChange={e => update('parentName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                      placeholder="Volledige naam" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail ouder/voogd</label>
                      <input type="email" value={form.parentEmail} onChange={e => update('parentEmail', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                        placeholder="ouder@voorbeeld.nl" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefoon ouder/voogd</label>
                      <input type="tel" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                        placeholder="06-12345678" />
                    </div>
                  </div>
                </div>
              )}

              {/* Noodcontact + Medische notities */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Noodcontact (naam + telefoon)</label>
                <input type="text" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                  placeholder="Moeder: 06-12345678" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Medische notities (allergieën, aandoeningen, etc.)</label>
                <textarea value={form.medicalNotes} onChange={e => update('medicalNotes', e.target.value)} rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                  placeholder="Geen bekende allergieën" />
              </div>

              <button type="button" onClick={() => { const err = validateStep1(); if (err) { setError(err); } else { setStep(2); setError(null); } }}
                className="w-full rounded-lg bg-[#a90000] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#8c0000] shadow-sm">
                Volgende: Akkoorden & Kosten →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Akkoorden & Kosten</h2>

              {/* Kosten overzicht */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-[#2a2a2a] mb-3">Kostenoverzicht</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lidmaatschap</span>
                    <span className="font-medium">€42 per kwartaal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inschrijfgeld (eenmalig)</span>
                    <span className="font-medium">
                      <span className="line-through text-gray-400 mr-1">€15</span>
                      <span className="text-[#27ae60]">gratis</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verzekering</span>
                    <span className="font-medium">€15 per jaar</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Totaal eerste kwartaal</span>
                      <span>
                        <span className="line-through text-gray-400 mr-1">€72</span>
                        <span className="text-[#27ae60]">€57</span>
                      </span>
                    </div>
                  </div>
                </div>
                <ActionCostNote />
                <p className="mt-3 text-xs text-gray-500">
                  Lidmaatschap wordt per kwartaal in rekening gebracht. Opzegtermijn is 1 maand voor het einde van het kwartaal.
                </p>
              </div>

              {/* Akkoorden */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form.costAgreed} onChange={e => update('costAgreed', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                  <span className="text-sm text-gray-700">
                    Ik ga akkoord met de bovenstaande kosten en begrijp dat het lidmaatschap per kwartaal wordt gefactureerd. *
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form.privacyAgreed} onChange={e => update('privacyAgreed', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                  <span className="text-sm text-gray-700">
                    Ik ga akkoord met de <button type="button" onClick={() => setLegalDoc('privacyverklaring-michigami')} className="text-[#a90000] underline hover:text-[#8c0000]">privacyverklaring</button> van Judoclub Michigami. *
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form.termsAgreed} onChange={e => update('termsAgreed', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                  <span className="text-sm text-gray-700">
                    Ik ga akkoord met de <button type="button" onClick={() => setLegalDoc('algemene-voorwaarden-michigami')} className="text-[#a90000] underline hover:text-[#8c0000]">algemene voorwaarden</button> van Judoclub Michigami. *
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form.codeOfConduct} onChange={e => update('codeOfConduct', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                  <span className="text-sm text-gray-700">
                    Ik ga akkoord met de <button type="button" onClick={() => setLegalDoc('gedragscode-michigami')} className="text-[#a90000] underline hover:text-[#8c0000]">gedragscode</button> van Judoclub Michigami. *
                  </span>
                </label>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm font-medium text-[#2a2a2a] mb-2">Instellingen</p>

                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={form.portraitRights ?? true} onChange={e => update('portraitRights', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                    <span className="text-sm text-gray-700">
                      Portretrecht: ik ga akkoord met het maken en gebruiken van foto's/video's voor promotie van de club.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={form.nameMention ?? true} onChange={e => update('nameMention', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#a90000] focus:ring-[#a90000]" />
                    <span className="text-sm text-gray-700">
                      Naam vermelden: ik ga akkoord met het vermelden van mijn naam in nieuwsberichten en op de website.
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(null); }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  ← Terug
                </button>
                <button type="button" onClick={() => { const err = validateStep2(); if (err) { setError(err); } else { handleSubmit(); } }}
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-[#a90000] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#8c0000] disabled:opacity-50 shadow-sm">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verzenden...
                    </span>
                  ) : (
                    'Inschrijving verzenden'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Na goedkeuring door de admin ontvang je een e-mail met je inloggegevens.
        </p>
      </div>

      {/* Juridische documenten in modal — formulier (met data) blijft staan */}
      {legalDoc && <LegalModal docId={legalDoc} onClose={() => setLegalDoc(null)} />}
    </div>
  )
}
