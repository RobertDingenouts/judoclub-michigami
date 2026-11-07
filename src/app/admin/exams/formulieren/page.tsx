import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GROEP_LABELS } from '@/lib/examens'
import { FormulierenSelectie } from './Selectie'

export const dynamic = 'force-dynamic'

export default async function FormulierenPage({ searchParams }: { searchParams: Promise<{ groep?: string }> }) {
  if (!(await isAdmin())) redirect('/admin-login')
  const q = await searchParams
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link href="/admin/exams" className="text-sm text-[#a90000] hover:underline">← Examenoverzicht</Link>
          <h1 className="text-lg font-bold text-gray-800">📄 Examenformulieren printen</h1>
        </div>
        <p className="mx-auto mt-1 max-w-3xl text-xs text-gray-500">
          Formulier per lid met doel, exameneisen en betalingsgegevens (betaling uiterlijk 1 dag vóór het examen). Print ze al vóór de les uit; vul op de les alleen nog de examendatum in.
        </p>
      </div>
      <FormulierenSelectie groepen={GROEP_LABELS} start={q.groep ?? ''} />
    </div>
  )
}
