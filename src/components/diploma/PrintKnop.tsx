'use client'

export default function PrintKnop({ label = '🖨 Printen' }: { label?: string }) {
  return <button onClick={() => window.print()} className="ml-auto rounded-sm bg-white px-3 py-1 font-medium text-black hover:bg-gray-100">{label}</button>
}
