import PoelIndelingAdmin from "@/components/admin/PoelIndelingAdmin"

export const dynamic = "force-dynamic"

export default function PoelenPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-[#a90000] mb-1">Poelindeling — Jubileumtoernooi 50 jaar OVJV</h1>
      <p className="text-sm text-gray-500 mb-4">Zaterdag 17 oktober 2026 · De Vossenkuil, Oud-Vossemeer. Wijzigingen worden automatisch in de database opgeslagen en zijn op elk apparaat zichtbaar.</p>
      <PoelIndelingAdmin slug="jubileumtoernooi-2026-10-17" />
    </div>
  )
}
