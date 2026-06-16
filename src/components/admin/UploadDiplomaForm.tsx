'use client'

import { useState, useEffect } from 'react'

export default function UploadDiplomaForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])

  const [formData, setFormData] = useState({
    memberId: '',
    diplomaType: 'ACHIEVEMENT',
    title: '',
    beltLevel: '',
    awardedAt: new Date().toISOString().split('T')[0],
    file: null as File | null,
  })

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open])

  async function fetchMembers() {
    try {
      const res = await fetch('/api/admin/students')
      const data = await res.json()
      if (data.students) {
        setMembers(data.students.map((s: any) => ({
          id: s.member?.id || s.id,
          firstName: s.member?.firstName || s.name || '',
          lastName: s.member?.lastName || '',
        })))
      }
    } catch {
      // silent fail
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.memberId || !formData.title || !formData.file) {
      setError('Vul alle verplichte velden in en kies een bestand')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const body = new FormData()
    body.append('memberId', formData.memberId)
    body.append('diplomaType', formData.diplomaType)
    body.append('title', formData.title)
    if (formData.beltLevel) body.append('beltLevel', formData.beltLevel)
    body.append('awardedAt', formData.awardedAt)
    body.append('file', formData.file)

    try {
      const res = await fetch('/api/admin/diplomas/upload', {
        method: 'POST',
        body,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload mislukt')

      setSuccess(`Diploma "${data.diploma.title}" succesvol toegevoegd! Code: ${data.diploma.verificationCode}`)
      setFormData({
        memberId: '',
        diplomaType: 'ACHIEVEMENT',
        title: '',
        beltLevel: '',
        awardedAt: new Date().toISOString().split('T')[0],
        file: null,
      })
    } catch (err: any) {
      setError(err.message || 'Upload mislukt')
    } finally {
      setLoading(false)
    }
  }

  const beltOptions = [
    { value: 'WIT', label: 'Wit' },
    { value: 'GEEL', label: 'Geel' },
    { value: 'ORANJE', label: 'Oranje' },
    { value: 'GROEN', label: 'Groen' },
    { value: 'BLAUW', label: 'Blauw' },
    { value: 'BRUIN_1', label: 'Bruin 1' },
    { value: 'BRUIN_2', label: 'Bruin 2' },
    { value: 'BRUIN_3', label: 'Bruin 3' },
    { value: 'Zwart_1', label: 'Zwart 1e Dan' },
    { value: 'Zwart_2', label: 'Zwart 2e Dan' },
    { value: 'Zwart_3', label: 'Zwart 3e Dan' },
  ]

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
      >
        <div>
          <h3 className="text-sm font-semibold text-[#2a2a2a]">📄 Praktijk diploma uploaden</h3>
          <p className="text-xs text-gray-500 mt-0.5">Upload een scan/foto van een fysiek diploma voor een lid</p>
        </div>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lid *</label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
              required
            >
              <option value="">— Kies lid —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diploma type *</label>
              <select
                value={formData.diplomaType}
                onChange={(e) => setFormData({ ...formData, diplomaType: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
              >
                <option value="BELT_EXAM">Band Examen</option>
                <option value="ACHIEVEMENT">Bijzonderheid</option>
                <option value="COURSE_JAPANESE">Cursus Japans</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Band (optioneel)</label>
              <select
                value={formData.beltLevel}
                onChange={(e) => setFormData({ ...formData, beltLevel: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
              >
                <option value="">— Geen band —</option>
                {beltOptions.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Bijv. Zwarte band 1e Dan - All Japan Judo Championships"
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum uitreiking *</label>
            <input
              type="date"
              value={formData.awardedAt}
              onChange={(e) => setFormData({ ...formData, awardedAt: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-[#a90000] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bestand (PDF/JPG/PNG) *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#a90000] file:text-white file:text-sm file:font-medium hover:file:bg-[#8c0000]"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#a90000] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
            >
              {loading ? 'Uploaden...' : '📤 Diploma uploaden'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
