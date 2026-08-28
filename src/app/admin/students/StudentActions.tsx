'use client'

import Link from 'next/link'

interface StudentActionsProps {
  studentId: string
  firstName: string
  lastName: string
  showTrashed: boolean
}

export function StudentActions({ studentId, firstName, lastName, showTrashed }: StudentActionsProps) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/students/${studentId}`}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
      >
        Bekijken
      </Link>
      {!showTrashed && (
        <Link
          href={`/admin/students/${studentId}/edit`}
          className="rounded-lg bg-[#a90000]/10 px-3 py-1.5 text-xs font-medium text-[#a90000] transition-colors hover:bg-[#a90000]/20"
        >
          Bewerken
        </Link>
      )}
      {showTrashed ? (
        <>
          <button
            onClick={async () => {
              await fetch(`/api/admin/students/${studentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true }),
              })
              window.location.reload()
            }}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
          >
            Herstel
          </button>
          <button
            onClick={async () => {
              if (!confirm('Definitief verwijderen? Dit kan niet ongedaan worden.')) return
              try {
                const res = await fetch(`/api/admin/students/${studentId}?permanent=true`, { method: 'DELETE' })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                  alert(`Verwijderen mislukt: ${data.error || 'Onbekende fout'}`)
                  return
                }
              } catch {
                alert('Verwijderen mislukt: netwerkfout')
                return
              }
              window.location.reload()
            }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
          >
            Definitief
          </button>
        </>
      ) : (
        <button
          onClick={async () => {
            if (!confirm(`${firstName} ${lastName} naar prullenbak?`)) return
            await fetch(`/api/admin/students/${studentId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: false }),
            })
            window.location.reload()
          }}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Verwijderen
        </button>
      )}
    </div>
  )
}
