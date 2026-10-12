'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, Shield, Eye, EyeOff } from 'lucide-react'
import { compressImage } from '@/lib/image-compression'
import { useT } from '@/i18n/LangContext'

interface ProfileEditData {
  firstName: string
  lastName: string
  email: string
  phone: string
  phone2: string
  dateOfBirth: string
  gender: string
  address: string
  postalCode: string
  city: string
  location: string
  whatsappGroup: string
  portraitRights: boolean | null
  nameMention: boolean | null
  privacyAgreed: boolean | null
  privacyAgreedAt: string | null
  termsAgreed: boolean | null
  termsAgreedAt: string | null
  codeOfConduct: boolean | null
  codeOfConductAt: string | null
  remarks: string
  emergencyContactName: string
  emergencyContactPhone: string
  medicalNotes: string
  imageUrl?: string | null
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { t } = useT()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'gegevens' | 'wachtwoord' | 'akkoorden'>('gegevens')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileEditData | null>(null)
  const [form, setForm] = useState<ProfileEditData | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [compressing, setCompressing] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.authenticated && data.user) {
        const p = data.user
        const profileData = {
          firstName: p.member?.firstName || '',
          lastName: p.member?.lastName || '',
          email: p.member?.email || p.email || '',
          phone: p.member?.phone || '',
          phone2: p.member?.phone2 || '',
          dateOfBirth: p.member?.dateOfBirth ? new Date(p.member.dateOfBirth).toISOString().split('T')[0] : '',
          gender: p.member?.gender || '',
          address: p.member?.address || '',
          postalCode: p.member?.postalCode || '',
          city: p.member?.city || '',
          location: p.member?.location || '',
          whatsappGroup: p.member?.whatsappGroup || '',
          portraitRights: p.member?.portraitRights ?? null,
          nameMention: p.member?.nameMention ?? null,
          privacyAgreed: p.member?.privacyAgreed ?? null,
          privacyAgreedAt: p.member?.privacyAgreedAt || null,
          termsAgreed: p.member?.termsAgreed ?? null,
          termsAgreedAt: p.member?.termsAgreedAt || null,
          codeOfConduct: p.member?.codeOfConduct ?? null,
          codeOfConductAt: p.member?.codeOfConductAt || null,
          remarks: p.member?.remarks || '',
          emergencyContactName: p.member?.emergencyContactName || '',
          emergencyContactPhone: p.member?.emergencyContactPhone || '',
          medicalNotes: p.member?.medicalNotes || '',
          imageUrl: p.imageUrl || null,
        }
        setProfile(profileData)
        setForm(profileData)
        if (p.imageUrl) {
          setAvatarPreview(p.imageUrl)
        }
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof ProfileEditData, value: string | boolean) => {
    setForm(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    // First upload avatar if there's a new file
    let uploadedImageUrl = form.imageUrl
    if (avatarFile) {
      try {
        const avatarFormData = new FormData()
        avatarFormData.append('avatar', avatarFile)
        const avatarRes = await fetch('/api/user/avatar', {
          method: 'POST',
          body: avatarFormData,
        })
        const avatarData = await avatarRes.json()
        if (!avatarRes.ok) throw new Error(avatarData.error || 'Avatar upload failed')
        uploadedImageUrl = avatarData.imageUrl
      } catch (err: any) {
        setError(err.message || 'Fout bij uploaden profielfoto')
        setSaving(false)
        return
      }
    }

    const body = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      phone2: form.phone2,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      address: form.address,
      postalCode: form.postalCode,
      city: form.city,
      whatsappGroup: form.whatsappGroup,
      portraitRights: form.portraitRights,
      nameMention: form.nameMention,
      remarks: form.remarks,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      medicalNotes: form.medicalNotes,
      imageUrl: uploadedImageUrl,
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij opslaan')

      setSuccess('Profiel succesvol bijgewerkt!')
      const updatedProfile = { ...form, imageUrl: uploadedImageUrl }
      setProfile(updatedProfile)
      setForm(updatedProfile)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan profiel')
    } finally {
      setSaving(false)
    }
  }

  const handleAgreementsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    const body = {
      privacyAgreed: form.privacyAgreed,
      termsAgreed: form.termsAgreed,
      codeOfConduct: form.codeOfConduct,
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij opslaan')

      setSuccess('Akkoorden succesvol bijgewerkt!')
      const now = new Date().toISOString()
      const updatedForm = {
        ...form,
        privacyAgreed: form.privacyAgreed,
        privacyAgreedAt: form.privacyAgreed ? now : null,
        termsAgreed: form.termsAgreed,
        termsAgreedAt: form.termsAgreed ? now : null,
        codeOfConduct: form.codeOfConduct,
        codeOfConductAt: form.codeOfConduct ? now : null,
      }
      setProfile(updatedForm)
      setForm(updatedForm)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan akkoorden')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Nieuwe wachtwoorden komen niet overeen')
      return
    }
    if (newPassword.length < 8) {
      setError('Nieuw wachtwoord moet minimaal 8 tekens zijn')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fout bij wijzigen wachtwoord')

      setSuccess('Wachtwoord succesvol gewijzigd!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Fout bij wijzigen wachtwoord')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show immediate preview (original)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Compress in background
    setCompressing(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      setAvatarFile(compressed)
      const origKB = (file.size / 1024).toFixed(0)
      const compKB = (compressed.size / 1024).toFixed(0)
      setError(null)
      setSuccess(`Foto gecomprimeerd: ${origKB}KB → ${compKB}KB`)
    } catch (err) {
      console.error('Compressie mislukt, gebruik origineel:', err)
      setAvatarFile(file)
      setError('Compressie mislukt — origineel bestand wordt gebruikt.')
    } finally {
      setCompressing(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-6 text-white">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/leden" className="text-gray-400 hover:text-[#a90000] text-sm">
          ← {t('Terug naar dashboard')}
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">{t('Mijn Profiel')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('Beheer je persoonlijke gegevens en instellingen')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex -mb-px" aria-label="Profiel tabs">
            <button
              onClick={() => { setActiveTab('gegevens'); setError(null); setSuccess(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'gegevens'
                  ? 'border-[#a90000] text-[#a90000]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {t('Persoonlijke gegevens')}
            </button>
            <button
              onClick={() => { setActiveTab('wachtwoord'); setError(null); setSuccess(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'wachtwoord'
                  ? 'border-[#a90000] text-[#a90000]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" /> {t('Wachtwoord')}
            </button>
            <button
              onClick={() => { setActiveTab('akkoorden'); setError(null); setSuccess(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'akkoorden'
                  ? 'border-[#a90000] text-[#a90000]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              {t('Akkoorden')}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
              {t(error)}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-2">
              {t(success)}
            </div>
          )}

          {activeTab === 'gegevens' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border-3 border-[#a90000]/20 overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-400">👤</span>
                  )}
                </div>
                <div>
                  <label htmlFor="avatar" className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                    <Camera className="w-4 h-4" />
                    {compressing ? t('Verwerken...') : t('Foto kiezen')}
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={compressing}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('Automatisch verkleind voor optimale kwaliteit.')}</p>
                  {compressing && <p className="text-xs text-[#a90000] mt-0.5 animate-pulse">{t('Foto wordt verkleind...')}</p>}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Personal Info */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Persoonlijke Gegevens')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Voornaam" name="firstName" value={form?.firstName || ''} required onChange={(e) => handleFormChange('firstName', e.target.value)} />
                <FormField label="Achternaam" name="lastName" value={form?.lastName || ''} required onChange={(e) => handleFormChange('lastName', e.target.value)} />
                <FormField label="E-mail" name="email" type="email" value={form?.email || ''} required onChange={(e) => handleFormChange('email', e.target.value)} />
                <FormField label="Geboortedatum" name="dateOfBirth" type="date" value={form?.dateOfBirth || ''} onChange={(e) => handleFormChange('dateOfBirth', e.target.value)} />
                <FormField label="Geslacht" name="gender" value={form?.gender || ''} onChange={(e) => handleFormChange('gender', e.target.value)} placeholder="Bijv. man, vrouw, anders" />
              </div>

              <hr className="border-gray-100" />

              {/* Adres */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Adres')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Straat + huisnummer" name="address" value={form?.address || ''} onChange={(e) => handleFormChange('address', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Postcode" name="postalCode" value={form?.postalCode || ''} onChange={(e) => handleFormChange('postalCode', e.target.value)} />
                  <FormField label="Woonplaats" name="city" value={form?.city || ''} onChange={(e) => handleFormChange('city', e.target.value)} />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Contact */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Contact')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Telefoonnummer 1" name="phone" type="tel" value={form?.phone || ''} onChange={(e) => handleFormChange('phone', e.target.value)} />
                <FormField label="Telefoonnummer 2" name="phone2" type="tel" value={form?.phone2 || ''} onChange={(e) => handleFormChange('phone2', e.target.value)} />
              </div>

              <hr className="border-gray-100" />

              {/* Groepsapp */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Groepsapp')}</h2>
              <p className="text-sm text-gray-500 mb-3">{t('Wil je toegevoegd worden aan onze judoclub groepsapp voor belangrijke mededelingen en updates?')}</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="whatsappGroup"
                    value=""
                    checked={form?.whatsappGroup === '' || !form?.whatsappGroup}
                    onChange={() => handleFormChange('whatsappGroup', '')}
                    className="text-[#a90000] focus:ring-[#a90000]"
                  />
                  <span className="text-sm text-gray-700">{t('Nee, bedankt')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="whatsappGroup"
                    value="ja1"
                    checked={form?.whatsappGroup === 'ja1'}
                    onChange={() => handleFormChange('whatsappGroup', 'ja1')}
                    className="text-[#a90000] focus:ring-[#a90000]"
                  />
                  <span className="text-sm text-gray-700">{t('Ja, met telefoonnummer 1')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="whatsappGroup"
                    value="ja2"
                    checked={form?.whatsappGroup === 'ja2'}
                    onChange={() => handleFormChange('whatsappGroup', 'ja2')}
                    className="text-[#a90000] focus:ring-[#a90000]"
                  />
                  <span className="text-sm text-gray-700">{t('Ja, met telefoonnummer 2')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="whatsappGroup"
                    value="ja12"
                    checked={form?.whatsappGroup === 'ja12'}
                    onChange={() => handleFormChange('whatsappGroup', 'ja12')}
                    className="text-[#a90000] focus:ring-[#a90000]"
                  />
                  <span className="text-sm text-gray-700">{t('Ja, met beide telefoonnummers')}</span>
                </label>
              </div>

              <hr className="border-gray-100" />

              {/* Location (read-only) */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Trainingslocatie')}</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{t('Locatie')}</span>
                  <span className="text-sm text-gray-600">
                    {form?.location ? (
                      <>📍 {form.location === 'STeenbergen' ? 'Steenbergen' : form.location === 'OUD_VOSSEMEER' ? 'Oud-Vossemeer' : form.location}</>
                    ) : (
                      <span className="text-gray-400 italic">{t('Nog geen locatie toegekend')}</span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('Contacteer de admin om je locatie te wijzigen.')}</p>
              </div>

              <hr className="border-gray-100" />

              {/* Emergency Contact */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Noodcontact')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Naam" name="emergencyContactName" value={form?.emergencyContactName || ''} onChange={(e) => handleFormChange('emergencyContactName', e.target.value)} />
                <FormField label="Telefoon" name="emergencyContactPhone" type="tel" value={form?.emergencyContactPhone || ''} onChange={(e) => handleFormChange('emergencyContactPhone', e.target.value)} />
              </div>

              <hr className="border-gray-100" />

              {/* Medical Notes */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Medische Notities')}</h2>
              <textarea
                name="medicalNotes"
                value={form?.medicalNotes || ''}
                onChange={(e) => handleFormChange('medicalNotes', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                placeholder={t('Allergieën, aandoeningen, medicijnen, etc. (alleen zichtbaar voor beheerders en instructeurs)')} 
              />

              <hr className="border-gray-100" />

              {/* Opmerkingen */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Overige Opmerkingen')}</h2>
              <textarea
                name="remarks"
                value={form?.remarks || ''}
                onChange={(e) => handleFormChange('remarks', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                placeholder={t('Opmerkingen voor de club (optioneel)')} 
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
                >
                  {saving ? t('Opslaan...') : t('Wijzigingen opslaan')}
                </button>
                <p className="text-xs text-gray-400 flex items-start">
                  ⚠️ {t('Bij belangrijke wijzigingen (e-mail, noodcontact, medische notities) krijgt het admin team een notificatie.')}
                </p>
              </div>
            </form>
          )}

          {activeTab === 'wachtwoord' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Wachtwoord wijzigen')}</h2>
              <p className="text-sm text-gray-500">
                {t('Je huidige wachtwoord is vereist om je wachtwoord te wijzigen. Kies een veilig wachtwoord van minimaal 8 tekens.')}
              </p>

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('Huidig wachtwoord')} *
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                    placeholder={t('Voer huidig wachtwoord in')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showCurrentPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('Nieuw wachtwoord')} *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                    placeholder={t('Minimaal 8 tekens')}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showNewPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('Bevestig nieuw wachtwoord')} *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                    placeholder={t('Herhaal nieuw wachtwoord')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
                >
                  {saving ? t('Wachtwoord wijzigen...') : t('Wachtwoord wijzigen')}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {t('Tip: Gebruik een wachtwoordmanager voor sterke, unieke wachtwoorden.')}
                </p>
              </div>
            </form>
          )}

          {activeTab === 'akkoorden' && (
            <form onSubmit={handleAgreementsSubmit} className="space-y-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-[#2a2a2a]">{t('Akkoorden & Toestemmingen')}</h2>
              <p className="text-sm text-gray-500">
                {t('Hieronder kun je je toestemmingen beheren. Deze zijn gegeven bij je inschrijving.')}
              </p>

              {/* Portretrecht */}
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <h3 className="font-medium text-[#2a2a2a]">{t("Portretrecht — Foto's & Video's")}</h3>
                <p className="text-sm text-gray-600">
                  {t("Mag de judoclub foto's en video's van je maken tijdens evenementen en trainingen en deze gebruiken voor promotiedoeleinden op social media en onze website?")}
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="portraitRights"
                      checked={form?.portraitRights === true}
                      onChange={() => handleFormChange('portraitRights', true)}
                      className="text-[#a90000] focus:ring-[#a90000]"
                    />
                    <span className="text-sm text-gray-700">{t('Ja, ik geef toestemming')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="portraitRights"
                      checked={form?.portraitRights === false}
                      onChange={() => handleFormChange('portraitRights', false)}
                      className="text-[#a90000] focus:ring-[#a90000]"
                    />
                    <span className="text-sm text-gray-700">{t('Nee, ik geef geen toestemming')}</span>
                  </label>
                  {form?.portraitRights === null && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">
                      ⚠️ {t('Nog niet ingesteld. Kies een optie hierboven.')}
                    </p>
                  )}
                </div>
              </div>

              {/* Naam vermelden */}
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <h3 className="font-medium text-[#2a2a2a]">{t('Naam Vermelden')}</h3>
                <p className="text-sm text-gray-600">
                  {t('Mag de judoclub je naam vermelden in nieuwsberichten op social media en onze website?')}
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="nameMention"
                      checked={form?.nameMention === true}
                      onChange={() => handleFormChange('nameMention', true)}
                      className="text-[#a90000] focus:ring-[#a90000]"
                    />
                    <span className="text-sm text-gray-700">{t('Ja, ik geef toestemming')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="nameMention"
                      checked={form?.nameMention === false}
                      onChange={() => handleFormChange('nameMention', false)}
                      className="text-[#a90000] focus:ring-[#a90000]"
                    />
                    <span className="text-sm text-gray-700">{t('Nee, ik geef geen toestemming')}</span>
                  </label>
                  {form?.nameMention === null && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">
                      ⚠️ {t('Nog niet ingesteld. Kies een optie hierboven.')}
                    </p>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Privacyverklaring */}
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <h3 className="font-medium text-[#2a2a2a]">{t('Privacyverklaring')}</h3>
                <p className="text-sm text-gray-600">
                  {t('Ga je akkoord met het gebruik van je persoonsgegevens zoals beschreven in de privacyverklaring?')}
                </p>
                <a href="/#juridisch" target="_blank" className="text-sm text-[#a90000] hover:underline inline-block">
                  📄 {t('Privacyverklaring lezen')} →
                </a>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="privacyAgreed"
                    checked={form?.privacyAgreed || false}
                    onChange={(e) => handleFormChange('privacyAgreed', e.target.checked)}
                    className="rounded text-[#a90000] focus:ring-[#a90000]"
                  />
                  <label htmlFor="privacyAgreed" className="text-sm text-gray-700 cursor-pointer">
                    {t('Ik ga akkoord met de privacyverklaring')}
                  </label>
                </div>
                {form?.privacyAgreedAt && (
                  <p className="text-xs text-gray-400">
                    {t('Akkoord gegeven op')} {formatDate(form.privacyAgreedAt)}
                  </p>
                )}
              </div>

              {/* Algemene Voorwaarden */}
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <h3 className="font-medium text-[#2a2a2a]">{t('Algemene Voorwaarden')}</h3>
                <p className="text-sm text-gray-600">
                  {t('Ga je akkoord met de algemene voorwaarden van Judoclub Michigami?')}
                </p>
                <a href="/#juridisch" target="_blank" className="text-sm text-[#a90000] hover:underline inline-block">
                  📄 {t('Algemene voorwaarden lezen')} →
                </a>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="termsAgreed"
                    checked={form?.termsAgreed || false}
                    onChange={(e) => handleFormChange('termsAgreed', e.target.checked)}
                    className="rounded text-[#a90000] focus:ring-[#a90000]"
                  />
                  <label htmlFor="termsAgreed" className="text-sm text-gray-700 cursor-pointer">
                    {t('Ik ga akkoord met de algemene voorwaarden')}
                  </label>
                </div>
                {form?.termsAgreedAt && (
                  <p className="text-xs text-gray-400">
                    {t('Akkoord gegeven op')} {formatDate(form.termsAgreedAt)}
                  </p>
                )}
              </div>

              {/* Gedragscode */}
              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <h3 className="font-medium text-[#2a2a2a]">{t('Gedragscode')}</h3>
                <p className="text-sm text-gray-600">
                  {t('Ga je akkoord met de gedragscode van Judoclub Michigami?')}
                </p>
                <a href="/#juridisch" target="_blank" className="text-sm text-[#a90000] hover:underline inline-block">
                  📄 {t('Gedragscode lezen')} →
                </a>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="codeOfConduct"
                    checked={form?.codeOfConduct || false}
                    onChange={(e) => handleFormChange('codeOfConduct', e.target.checked)}
                    className="rounded text-[#a90000] focus:ring-[#a90000]"
                  />
                  <label htmlFor="codeOfConduct" className="text-sm text-gray-700 cursor-pointer">
                    {t('Ik ga akkoord met de gedragscode')}
                  </label>
                </div>
                {form?.codeOfConduct && form?.codeOfConductAt && (
                  <p className="text-xs text-gray-400">
                    {t('Akkoord gegeven op')} {formatDate(form.codeOfConductAt)}
                  </p>
                )}
                {form?.codeOfConduct === null && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">
                    ⚠️ {t('Nog niet ingesteld. Vink aan als je akkoord gaat.')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
                >
                  {saving ? t('Opslaan...') : t('Akkoorden opslaan')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function FormField({ label, name, type = 'text', value = '', required = false, onChange, placeholder }: {
  label: string; name: string; type?: string; value?: string; required?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string
}) {
  const { t } = useT()
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {t(label)}{required && <span className="text-[#a90000]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder ? t(placeholder) : undefined}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 transition-colors"
      />
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  let strength = 0
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  strength = checks.filter(Boolean).length

  const labels = ['Zeer zwak', 'Zwak', 'Gemiddeld', 'Sterk', 'Zeer sterk']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600']

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-lg transition-colors ${
              i < strength ? colors[i] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Sterkte: {labels[strength - 1] || 'Zeer zwak'}
      </p>
    </div>
  )
}
