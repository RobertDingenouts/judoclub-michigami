'use client'
export default function PrintKnop({ label = '🖨 Printen (band: 1 per A4 · slip: 2 per A4)' }: { label?: string }) {
  return <button onClick={() => window.print()} className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-medium text-white hover:bg-[#8c0000]">{label}</button>
}
