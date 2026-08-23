import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Diploma Verifiëren - Judoclub Michigami',
  description: 'Verifieer de authenticiteit van een diploma van Judoclub Michigami Steenbergen',
}

export const dynamic = 'force-dynamic'

interface DiplomaVerifyPageProps {
  params: Promise<{ code: string }>
}

export default async function DiplomaVerifyPage({ params }: DiplomaVerifyPageProps) {
  const { code } = await params

  if (!code) {
    redirect('/diploma/verifieren')
  }

  // Fetch diploma data
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://judoclubmichigami.nl'}/api/diplomas/verify?code=${code}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    redirect('/diploma/verifieren?error=not_found')
  }

  const data = await res.json()

  if (!data.valid || !data.diploma) {
    redirect('/diploma/verifieren?error=invalid')
  }

  const diploma = data.diploma
  const beltLabel = diploma.beltLevel || 'Onbekend'
  const dateStr = new Date(diploma.awardedAt).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-8 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#a90000] transition-colors mb-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Terug naar website
          </Link>
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg border-4 border-[#a90000]/20 bg-gradient-to-br from-[#fdf6f6] to-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-[#a90000]">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2a2a2a]">Diploma Verificatie</h1>
          <p className="text-gray-500 mt-1">Controleer de authenticiteit van dit diploma</p>
        </div>

        {/* Verification status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold mb-3">
            ✓ Diploma is geldig en geverifieerd
          </div>
          <p className="text-sm text-green-700">
            Verificatiecode: <code className="font-mono bg-white px-1 rounded">{diploma.verificationCode}</code>
          </p>
        </div>

        {/* Diploma Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-6 text-white">
            <h2 className="text-xl sm:text-2xl font-bold">JUDOCLUB MICHIGAMI STEENBERGEN</h2>
            <p className="text-white/80 mt-1 text-sm">Certificaat van Behaalde Judo Examen</p>
            <div className="w-20 h-1 bg-white/30 rounded-lg mt-4 mx-auto" />
          </div>

          <div className="p-6 space-y-6">
            {/* Main info */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Toegekend aan</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#2a2a2a] underline underline-offset-2 decoration-[#a90000] decoration-2">
                {diploma.recipientName}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">{diploma.description || 'Diploma verkregen bij Judoclub Michigami Steenbergen'}</p>
            </div>

            {/* Belt achieved */}
            <div className="bg-[#fdf6f6] rounded-lg p-4 text-center border border-[#a90000]/20">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Behaalde graad</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#a90000] mt-1">{beltLabel}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Diploma type" value={diploma.type === 'BELT_EXAM' ? 'Band Examen' : diploma.type === 'COURSE_JAPANESE' ? 'Cursus Japans' : 'Bijzonderheid'} />
              <DetailItem label="Uitreikdatum" value={dateStr} />
              {diploma.examAttempt && (
                <>
                  <DetailItem label="Examen" value={diploma.examAttempt.beltLevel ? beltLabel(diploma.examAttempt.beltLevel) : 'N.v.t.'} />
                  {diploma.examAttempt.overallScore != null && (
                    <DetailItem label="Score" value={`${diploma.examAttempt.overallScore}/100`} />
                  )}
                  {diploma.examAttempt.examiner && (
                    <DetailItem label="Examinator" value={diploma.examAttempt.examiner} />
                  )}
                  {diploma.examAttempt.examDate && (
                    <DetailItem label="Examen datum" value={new Date(diploma.examAttempt.examDate).toLocaleDateString('nl-NL')} />
                  )}
                </>
              )}
            </div>

            {/* Verification code */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs text-gray-500 text-center mb-2">Verificatiecode</p>
              <div className="text-center">
                <code className="font-mono text-lg font-bold text-[#a90000] tracking-wider bg-[#fdf6f6] px-4 py-2 rounded-lg border border-[#a90000]/20 inline-block">
                  {diploma.verificationCode}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
          <p>Dit diploma is uitgegeven door Judoclub Michigami Steenbergen</p>
          <p>Verifieer altijd via deze pagina: <code className="font-mono bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_BASE_URL}/diploma/verifieren/{code}</code></p>
          <Link href="/" className="text-[#a90000] hover:underline">← Terug naar website</Link>
        </div>
      </div>
    </div>
  )
}

function beltLabel(belt: string | null): string {
  const labels: Record<string, string> = {
    WIT: 'Witte band', GEEL: 'Gele band', ORANJE: 'Oranje band', GROEN: 'Groene band',
    BLAUW: 'Blauwe band', BRUIN: 'Bruine band',
    ZWART_1: 'Zwarte band 1e dan', ZWART_2: 'Zwarte band 2e dan', ZWART_3: 'Zwarte band 3e dan',
  }
  return labels[belt || ''] || belt || 'Onbekend'
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  )
}