'use client'
export default function PrintKnop() {
  return <button onClick={() => window.print()} className="rounded-sm bg-[#a90000] px-4 py-2 text-sm font-medium text-white hover:bg-[#8c0000]">🖨 Printen (2 formulieren per A4)</button>
}
