'use client'

interface SummaryProps {
  total: number
  youth: number
  adults: number
  danGrades: number
}

export function Summary({ total, youth, adults, danGrades }: SummaryProps) {
  const stats = [
    { label: 'Totaal', value: total, color: 'bg-[#fdf6f6] text-[#a90000]' },
    { label: 'Jeugd', value: youth, color: 'bg-blue-50 text-blue-700' },
    { label: 'Volwassenen', value: adults, color: 'bg-green-50 text-green-700' },
    { label: 'Dan-graden', value: danGrades, color: 'bg-gray-100 text-gray-800' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-none p-4 ${s.color}`}>
          <p className="text-2xl font-bold">{s.value}</p>
          <p className="text-xs font-medium opacity-75">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
