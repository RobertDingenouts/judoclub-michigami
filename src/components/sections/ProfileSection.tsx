'use client'

import { useState, useEffect } from 'react'
import { BELT_LABELS_NL, BELT_COLORS, LOCATION_LABELS_NL } from '@/lib/student-progress-types'
import { useT } from '@/i18n/LangContext'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  currentBelt: string | null
  joinDate: string | null
  member: {
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    dateOfBirth: string | null
    currentBelt: string | null
    location: string | null
    joinDate: string
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    medicalNotes: string | null
  } | null
}

export function ProfileSection() {
  const { t } = useT()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setProfile(data.user)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-6 text-white">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">{t('Mijn Profiel')}</h1>
          <p className="text-white/80 mt-1">{t('Je persoonlijke gegevens en statistieken')}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">{t('Log in om je profiel te bekijken.')}</p>
        </div>
      </div>
    )
  }

  const displayName = profile.member?.firstName || profile.name || profile.email.split('@')[0]
  const belt = profile.member?.currentBelt || profile.currentBelt
  const beltColor = belt ? BELT_COLORS[belt] || '#999' : '#999'
  const isWhiteBelt = belt === 'WIT'
  const beltLabel = belt ? (BELT_LABELS_NL[belt] || belt) : 'Nog geen band'
  const joinDate = profile.member?.joinDate || profile.joinDate
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrator',
    INSTRUCTOR: 'Instructor',
    PARENT: 'Ouder',
    MEMBER: 'Lid',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold text-white border-3"
              style={{
                backgroundColor: beltColor,
                borderColor: isWhiteBelt ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
              }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{displayName}</h1>
              <p className="text-white/80 text-sm">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg">
                  {roleLabels[profile.role] || profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Belt */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full border"
              style={{
                backgroundColor: isWhiteBelt ? '#fff' : beltColor,
                borderColor: isWhiteBelt ? '#ddd' : 'transparent',
              }}
            />
            <span className="text-xs text-gray-500">Huidige band</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{beltLabel}</p>
        </div>

        {/* Join date */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">Lid sinds</span>
          <p className="text-lg font-bold text-gray-800">
            {joinDate ? new Date(joinDate).getFullYear() : '-'}
          </p>
        </div>

        {/* Role */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">Rol</span>
          <p className="text-lg font-bold text-gray-800">
            {roleLabels[profile.role] || profile.role}
          </p>
        </div>

        {/* Edit link */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-center">
          <a
            href="/leden/profiel/bewerken"
            className="text-sm font-medium text-[#a90000] hover:underline"
          >
            Profiel bewerken →
          </a>
        </div>
      </div>

      {/* Personal Info */}
      {profile.member && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">{t('Persoonlijke Gegevens')}</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{t('Naam')}</span>
              <span className="text-sm font-medium text-gray-800">
                {profile.member.firstName} {profile.member.lastName}
              </span>
            </div>
            {profile.member.email && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('E-mail')}</span>
                <span className="text-sm font-medium text-gray-800">{profile.member.email}</span>
              </div>
            )}
            {profile.member.phone && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('Telefoon')}</span>
                <span className="text-sm font-medium text-gray-800">{profile.member.phone}</span>
              </div>
            )}
            {profile.member.dateOfBirth && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('Geboortedatum')}</span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date(profile.member.dateOfBirth).toLocaleDateString('nl-NL')}
                </span>
              </div>
            )}
            {joinDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('Lid sinds')}</span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date(joinDate).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {profile.member.location && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('Trainingslocatie')}</span>
                <span className="text-sm font-medium text-gray-800">
                  📍 {LOCATION_LABELS_NL[profile.member.location as keyof typeof LOCATION_LABELS_NL] || profile.member.location}
                </span>
              </div>
            )}
            {profile.member.emergencyContactName && (
              <>
                <div className="border-t border-gray-100 pt-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {t('Noodcontact')}
                  </h3>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t('Naam')}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {profile.member.emergencyContactName}
                  </span>
                </div>
                {profile.member.emergencyContactPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t('Telefoon')}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {profile.member.emergencyContactPhone}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
