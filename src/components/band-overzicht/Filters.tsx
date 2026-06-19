'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { BELT_LABELS_NL } from '@/lib/student-progress-types'

const ALL_BELTS = Object.entries(BELT_LABELS_NL)
  .filter(([key]) => !key.includes('_1') || key === 'ZWART_1')
  .filter(([key]) => !['BRUIN_1', 'BRUIN_2', 'BRUIN_3', 'Zwart_1', 'Zwart_2', 'Zwart_3'].includes(key))
  .map(([value, label]) => ({ value, label }))

export function Filters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentLocation = searchParams.get('location') || 'ALL'
  const currentBelt = searchParams.get('belt') || ''
  const currentQ = searchParams.get('q') || ''

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <input
        type="text"
        placeholder="Zoeken op naam..."
        value={currentQ}
        onChange={(e) => updateParam('q', e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none sm:w-64"
      />

      {/* Location filter */}
      <select
        value={currentLocation}
        onChange={(e) => updateParam('location', e.target.value === 'ALL' ? '' : e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none"
      >
        <option value="ALL">Alle locaties</option>
        <option value="STeenbergen">Steenbergen</option>
        <option value="OUD_VOSSEMEER">Oud-Vossemeer</option>
      </select>

      {/* Belt filter */}
      <select
        value={currentBelt}
        onChange={(e) => updateParam('belt', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#a90000] focus:outline-none"
      >
        <option value="">Alle graden</option>
        {ALL_BELTS.map((b) => (
          <option key={b.value} value={b.value}>{b.label}</option>
        ))}
      </select>
    </div>
  )
}
