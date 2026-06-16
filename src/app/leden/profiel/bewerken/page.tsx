'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, Shield, Bell, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface ProfileEditData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContactName: string
  emergencyContactPhone: string
  medicalNotes: string
  imageUrl?: string | null
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'gegevens' | 'wachtwoord' | 'notificaties'>('gegevens')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileEditData | null>(null)
  const [form, setForm] = useState<ProfileEditData | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailTraining: true,
    emailExams: true,
    emailDiplomas: true,
    emailAnnouncements: true,
    pushEnabled: true,
    smsEnabled: false,
  })

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
          dateOfBirth: p.member?.dateOfBirth ? new Date(p.member.dateOfBirth).toISOString().split('T')[0] : '',
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

  const handleFormChange = (field: keyof ProfileEditData, value: string) => {
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
      dateOfBirth: form.dateOfBirth,
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

  const handleNotificationsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    // Save to localStorage
    localStorage.setItem('notificationPrefs', JSON.stringify(notifications))
    setSuccess('Notificatievoorkeuren opgeslagen!')
    setSaving(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Afbeelding mag maximaal 2MB zijn')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-6 text-white">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse space-y-4">
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
          ← Terug naar dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2a2a2a]">Mijn Profiel</h1>
          <p className="text-sm text-gray-500 mt-1">Beheer je persoonlijke gegevens en instellingen</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
              Persoonlijke gegevens
            </button>
            <button
              onClick={() => { setActiveTab('wachtwoord'); setError(null); setSuccess(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'wachtwoord'
                  ? 'border-[#a90000] text-[#a90000]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" /> Wachtwoord
            </button>
            <button
              onClick={() => { setActiveTab('notificaties'); setError(null); setSuccess(null); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notificaties'
                  ? 'border-[#a90000] text-[#a90000]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              <Bell className="w-4 h-4" /> Notificaties
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-2">
              {success}
            </div>
          )}

          {activeTab === 'gegevens' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-3 border-[#a90000]/20 overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-400">👤</span>
                  )}
                </div>
                <div>
                  <label htmlFor="avatar" className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                    <Camera className="w-4 h-4" />
                    Foto kiezen
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG. Wordt opgeslagen bij opslaan.</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Personal Info */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Persoonlijke Gegevens</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Voornaam" name="firstName" value={form?.firstName || ''} required onChange={(e) => handleFormChange('firstName', e.target.value)} />
                <FormField label="Achternaam" name="lastName" value={form?.lastName || ''} required onChange={(e) => handleFormChange('lastName', e.target.value)} />
                <FormField label="E-mail" name="email" type="email" value={form?.email || ''} required onChange={(e) => handleFormChange('email', e.target.value)} />
                <FormField label="Telefoon" name="phone" type="tel" value={form?.phone || ''} onChange={(e) => handleFormChange('phone', e.target.value)} />
                <FormField label="Geboortedatum" name="dateOfBirth" type="date" value={form?.dateOfBirth || ''} onChange={(e) => handleFormChange('dateOfBirth', e.target.value)} />
              </div>

              <hr className="border-gray-100" />

              {/* Emergency Contact */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Noodcontact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Naam" name="emergencyContactName" value={form?.emergencyContactName || ''} onChange={(e) => handleFormChange('emergencyContactName', e.target.value)} />
                <FormField label="Telefoon" name="emergencyContactPhone" type="tel" value={form?.emergencyContactPhone || ''} onChange={(e) => handleFormChange('emergencyContactPhone', e.target.value)} />
              </div>

              <hr className="border-gray-100" />

              {/* Medical Notes */}
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Medische Notities</h2>
              <textarea
                name="medicalNotes"
                value={form?.medicalNotes || ''}
                onChange={(e) => handleFormChange('medicalNotes', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                placeholder="Allergieën, aandoeningen, medicijnen, etc. (alleen zichtbaar voor beheerders en instructeurs)"
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
                >
                  {saving ? 'Opslaan...' : 'Wijzigingen opslaan'}
                </button>
                <p className="text-xs text-gray-400 flex items-start">
                  ⚠️ Bij belangrijke wijzigingen (e-mail, noodcontact, medische notities) krijgt het admin team een notificatie.
                </p>
              </div>
            </form>
          )}

          {activeTab === 'wachtwoord' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Wachtwoord wijzigen</h2>
              <p className="text-sm text-gray-500">
                Je huidige wachtwoord is vereist om je wachtwoord te wijzigen.
                Kies een veilig wachtwoord van minimaal 8 tekens.
              </p>

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Huidig wachtwoord *
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                    placeholder="Voer huidig wachtwoord in"
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
                  Nieuw wachtwoord *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                    placeholder="Minimaal 8 tekens"
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
                  Bevestig nieuw wachtwoord *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30"
                    placeholder="Herhaal nieuw wachtwoord"
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
                  {saving ? 'Wachtwoord wijzigen...' : 'Wachtwoord wijzigen'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Tip: Gebruik een wachtwoordmanager voor sterke, unieke wachtwoorden.
                </p>
              </div>
            </form>
          )}

          {activeTab === 'notificaties' && (
            <form onSubmit={handleNotificationsSubmit} className="space-y-6">
              <h2 className="text-lg font-semibold text-[#2a2a2a]">Notificatievoorkeuren</h2>
              <p className="text-sm text-gray-500">
                Kies welke notificaties je wilt ontvangen. Instellingen worden lokaal opgeslagen.
              </p>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">E-mail notificaties</h3>
                <NotificationToggle
                  label="Trainingstijden wijzigingen"
                  desc="Wijzigingen in de trainingsschema's"
                  checked={notifications.emailTraining}
                  onChange={(checked) => setNotifications({ ...notifications, emailTraining: checked })}
                />
                <NotificationToggle
                  label="Examengegevens"
                  desc="Informatie over aankomende examens"
                  checked={notifications.emailExams}
                  onChange={(checked) => setNotifications({ ...notifications, emailExams: checked })}
                />
                <NotificationToggle
                  label="Diploma's uitgegeven"
                  desc="Melding wanneer je een diploma hebt behaald"
                  checked={notifications.emailDiplomas}
                  onChange={(checked) => setNotifications({ ...notifications, emailDiplomas: checked })}
                />
                <NotificationToggle
                  label="Algemene mededelingen"
                  desc="Nieuwsbrieven en clubmededelingen"
                  checked={notifications.emailAnnouncements}
                  onChange={(checked) => setNotifications({ ...notifications, emailAnnouncements: checked })}
                />
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Push notificaties</h3>
                <NotificationToggle
                  label="Push notificaties inschakelen"
                  desc="Ontvang direct meldingen in de app/browser"
                  checked={notifications.pushEnabled}
                  onChange={(checked) => setNotifications({ ...notifications, pushEnabled: checked })}
                />
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">SMS notificaties</h3>
                <NotificationToggle
                  label="SMS notificaties"
                  desc="Belangrijke mededelingen via SMS (noodcontact, acute wijzigingen)"
                  checked={notifications.smsEnabled}
                  onChange={(checked) => setNotifications({ ...notifications, smsEnabled: checked })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#a90000] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] disabled:opacity-50"
                >
                  {saving ? 'Opslaan...' : 'Voorkeuren opslaan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function FormField({ label, name, type = 'text', value = '', required = false, onChange }: {
  label: string; name: string; type?: string; value?: string; required?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-[#a90000]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#a90000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 transition-colors"
      />
    </div>
  )
}

function NotificationToggle({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-[#a90000]' : 'bg-gray-200'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </label>
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
            className={`flex-1 rounded-sm transition-colors ${
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
