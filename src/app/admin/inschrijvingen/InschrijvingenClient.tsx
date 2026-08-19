'use client'

import { useState } from 'react'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  dateOfBirth: Date | null
  gender: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  location: string
  isChild: boolean
  parentName: string | null
  parentEmail: string | null
  parentPhone: string | null
  medicalNotes: string | null
  emergencyContact: string | null
  costAgreed: boolean
  privacyAgreed: boolean
  privacyAgreedAt: Date | null
  termsAgreed: boolean
  termsAgreedAt: Date | null
  codeOfConduct: boolean
  portraitRights: boolean | null
  nameMention: boolean | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNotes: string | null
  approvedBy: string | null
  approvedAt: Date | null
  rejectedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

interface InschrijvingenClientProps {
  applications: Application[]
}

export default function InschrijvingenClient({ applications }: InschrijvingenClientProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [actionModal, setActionModal] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string; tempPassword?: string } | null>(null)

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter)

  const handleAction = async () => {
    if (!selectedApp || !actionModal) return
    setProcessing(true)
    setResult(null)

    try {
      const res = await fetch(`/api/admin/inschrijvingen/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal,
          adminNotes: adminNotes || undefined,
          rejectionReason: rejectionReason || undefined,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        setResult({ type: 'error', message: data.error || 'Actie mislukt' })
        return
      }

      setResult({
        type: 'success',
        message: data.message,
        tempPassword: data.tempPassword,
      })

      if (actionModal === 'APPROVE') {
        selectedApp.status = 'APPROVED'
      } else {
        selectedApp.status = 'REJECTED'
      }
    } catch (err: any) {
      setResult({ type: 'error', message: err.message || 'Er is een fout opgetreden' })
    } finally {
      setProcessing(false)
    }
  }

  const closeModal = () => {
    setSelectedApp(null)
    setActionModal(null)
    setAdminNotes('')
    setRejectionReason('')
    setResult(null)
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 'In afwachting'
      case 'APPROVED': return 'Goedgekeurd'
      case 'REJECTED': return 'Afgewezen'
      default: return status
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => {
          const count = f === 'ALL' ? applications.length : applications.filter(a => a.status === f).length
          return (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-[#a90000] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'ALL' ? 'Alle' : formatStatus(f)}
            <span className="ml-1.5 opacity-70">({count})</span>
          </button>
          )
        })}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Geen inschrijvingen gevonden
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app.id} className={`rounded-lg border p-4 shadow-sm ${
              app.status === 'PENDING' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[#2a2a2a]">
                      {app.firstName} {app.lastName}
                    </h3>
                    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${statusColor(app.status)}`}>
                      {formatStatus(app.status)}
                    </span>
                    {app.isChild && (
                      <span className="inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        Kind
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span>{app.email}</span>
                    {app.phone && <span>{app.phone}</span>}
                    <span>{app.location === 'STeenbergen' ? 'Steenbergen' : 'Oud-Vossemeer'}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Verzonden op {formatDateTime(app.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedApp(app); }}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Details
                  </button>
                  {app.status === 'PENDING' && (
                    <>
                      <button onClick={() => { setSelectedApp(app); setActionModal('APPROVE'); }}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                        Goedkeuren
                      </button>
                      <button onClick={() => { setSelectedApp(app); setActionModal('REJECT'); }}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                        Afwijzen
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedApp && actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#2a2a2a]">
              {actionModal === 'APPROVE' ? 'Goedkeuren' : 'Afwijzen'}: {selectedApp.firstName} {selectedApp.lastName}
            </h2>

            {/* App details summary */}
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm space-y-1">
              <div><strong>E-mail:</strong> {selectedApp.email}</div>
              <div><strong>Telefoon:</strong> {selectedApp.phone || '-'}</div>
              <div><strong>Locatie:</strong> {selectedApp.location === 'STeenbergen' ? 'Steenbergen' : 'Oud-Vossemeer'}</div>
              {selectedApp.isChild && <div><strong>Ouder:</strong> {selectedApp.parentName || '-'}</div>}
            </div>

            {actionModal === 'APPROVE' && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Opmerking (optioneel)</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                  placeholder="Optionele notitie..." />
                <p className="mt-2 text-xs text-gray-500">
                  Na goedkeuring wordt automatisch een account aangemaakt met een tijdelijk wachtwoord.
                </p>
              </div>
            )}

            {actionModal === 'REJECT' && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Reden van afwijzing *</label>
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none focus:ring-1 focus:ring-[#a90000]"
                  placeholder="Leg uit waarom deze inschrijving wordt afgewezen..." />
              </div>
            )}

            {/* Result message */}
            {result && (
              <div className={`mt-4 rounded-lg border p-3 text-sm ${
                result.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {result.message}
                {result.tempPassword && (
                  <div className="mt-2">
                    <strong>Tijdelijk wachtwoord:</strong>{' '}
                    <code className="rounded bg-green-100 px-2 py-0.5 font-mono text-sm">{result.tempPassword}</code>
                    <p className="mt-1 text-xs">
                      Het lid krijgt dit automatisch per e-mail (met bevestigingslink) naar <strong>{selectedApp.email}</strong>.
                      Ziet het lid geen mail, geef het tijdelijke wachtwoord dan handmatig door.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button onClick={closeModal}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Sluiten
              </button>
              {!result && (
                <button onClick={handleAction} disabled={processing}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                    actionModal === 'APPROVE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verwerken...
                    </span>
                  ) : (
                    `${actionModal === 'APPROVE' ? 'Goedkeuren' : 'Afwijzen'}`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal (view only) */}
      {selectedApp && !actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#2a2a2a]">
              Details: {selectedApp.firstName} {selectedApp.lastName}
            </h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <h3 className="text-sm font-semibold text-[#2a2a2a] mb-2">Persoonlijke gegevens</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">E-mail:</span> {selectedApp.email}</div>
                  <div><span className="text-gray-500">Telefoon:</span> {selectedApp.phone || '-'}</div>
                  <div><span className="text-gray-500">Geboortedatum:</span> {selectedApp.dateOfBirth ? formatDate(selectedApp.dateOfBirth) : '-'}</div>
                  <div><span className="text-gray-500">Geslacht:</span> {selectedApp.gender || '-'}</div>
                  <div className="col-span-2"><span className="text-gray-500">Adres:</span> {selectedApp.address || '-'} {selectedApp.postalCode || ''} {selectedApp.city || ''}</div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <h3 className="text-sm font-semibold text-[#2a2a2a] mb-2">Lidmaatschap</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Locatie:</span> {selectedApp.location === 'STeenbergen' ? 'Steenbergen' : 'Oud-Vossemeer'}</div>
                  <div><span className="text-gray-500">Status:</span> {formatStatus(selectedApp.status)}</div>
                  <div><span className="text-gray-500">Portretrecht:</span> {selectedApp.portraitRights ? 'Ja' : 'Nee'}</div>
                  <div><span className="text-gray-500">Naam vermelden:</span> {selectedApp.nameMention ? 'Ja' : 'Nee'}</div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <h3 className="text-sm font-semibold text-[#2a2a2a] mb-2">Akkoorden</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Kosten:</span> {selectedApp.costAgreed ? '✓ Akkoord' : '✗ Niet akkoord'}</div>
                  <div><span className="text-gray-500">Privacy:</span> {selectedApp.privacyAgreed ? '✓ Akkoord' : '✗ Niet akkoord'}</div>
                  <div><span className="text-gray-500">Voorwaarden:</span> {selectedApp.termsAgreed ? '✓ Akkoord' : '✗ Niet akkoord'}</div>
                  <div><span className="text-gray-500">Gedragscode:</span> {selectedApp.codeOfConduct ? '✓ Akkoord' : '✗ Niet akkoord'}</div>
                </div>
              </div>

              {selectedApp.isChild && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-sm font-semibold text-[#2a2a2a] mb-2">Ouder/Voogd</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Naam:</span> {selectedApp.parentName || '-'}</div>
                    <div><span className="text-gray-500">E-mail:</span> {selectedApp.parentEmail || '-'}</div>
                    <div><span className="text-gray-500">Telefoon:</span> {selectedApp.parentPhone || '-'}</div>
                  </div>
                </div>
              )}

              {(selectedApp.medicalNotes || selectedApp.emergencyContact) && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <h3 className="text-sm font-semibold text-[#2a2a2a] mb-2">Medisch & Noodcontact</h3>
                  <div className="space-y-2 text-sm">
                    {selectedApp.emergencyContact && <div><span className="text-gray-500">Noodcontact:</span> {selectedApp.emergencyContact}</div>}
                    {selectedApp.medicalNotes && <div><span className="text-gray-500">Medische notities:</span> {selectedApp.medicalNotes}</div>}
                  </div>
                </div>
              )}

              {selectedApp.status === 'APPROVED' && selectedApp.approvedAt && (
                <div className="text-xs text-gray-400">Goedgekeurd op {formatDateTime(selectedApp.approvedAt)}</div>
              )}
              {selectedApp.status === 'REJECTED' && (
                <div className="text-sm text-red-600">
                  <strong>Reden:</strong> {selectedApp.rejectionReason || 'Geen reden opgegeven'}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={closeModal}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Sluiten
              </button>
              {selectedApp.status === 'PENDING' && (
                <>
                  <button onClick={() => setActionModal('APPROVE')}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                    Goedkeuren
                  </button>
                  <button onClick={() => setActionModal('REJECT')}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700">
                    Afwijzen
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
