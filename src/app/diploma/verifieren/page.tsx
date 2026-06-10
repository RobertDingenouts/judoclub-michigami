import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Diploma Verifiëren - Judoclub Michigami',
  description: 'Controleer de authenticiteit van een diploma via de verificatiecode of QR-code',
}

export const dynamic = 'force-dynamic'

export default async function DiplomaVerifyIndexPage({ searchParams }: { searchParams: Promise<{ get: (name: string) => string | null }> }) {
  const params = await searchParams
  const error = params?.get('error')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-8 sm:py-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#a90000]/20 bg-gradient-to-br from-[#fdf6f6] to-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-[#a90000]">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2a2a2a]">Diploma Verifiëren</h1>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            Voer de verificatiecode in of scan de QR-code op het diploma om de authenticiteit te controleren.
          </p>
        </div>

        {/* Error message */}
        {error === 'not_found' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center text-red-700" role="alert">
            <p className="font-medium">Diploma niet gevonden</p>
            <p className="text-sm mt-1">De verificatiecode is ongeldig of het diploma bestaat niet.</p>
          </div>
        )}
        {error === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center text-red-700" role="alert">
            <p className="font-medium">Ongeldige code</p>
            <p className="text-sm mt-1">De verificatiecode kon niet worden geverifieerd.</p>
          </div>
        )}

        {/* Form */}
        <form action="/" method="GET" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verificatiecode
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="Bijv. JP-A1B2-C3D4"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a90000] focus:border-transparent transition-all"
                autoComplete="off"
                autoCapitalize="characters"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              De code staat op het diploma (bijv. <code className="font-mono bg-gray-100 px-1 rounded">JP-A1B2-C3D4</code> of <code className="font-mono bg-gray-100 px-1 rounded">MJ-A1B2-C3D4</code>)
            </p>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#a90000] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8c0000] focus:outline-none focus:ring-2 focus:ring-[#a90000]/50 focus:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verifiëren
          </button>
        </form>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <InfoCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>}
            title="Geverifieerd diploma"
            desc="Geldig en authentic diploma van Judoclub Michigami"
          />
          <InfoCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="12" r="3" /></svg>}
            title="QR-code scannen"
            desc="Open de camera en scan de QR-code op het diploma"
          />
          <InfoCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            title="Veilige verificatie"
            desc="Alle verificatiecodes zijn uniek en kunnen niet worden ngemaakt"
          />
          <InfoCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            title="Data bescherming"
            desc="Alleen naam, band en datum worden getoond - geen privacygevoelige data"
          />
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#a90000] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug naar website
          </Link>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-[#a90000]/50 transition-colors">
      <div className="text-[#a90000] mb-2">{icon}</div>
      <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  )
}