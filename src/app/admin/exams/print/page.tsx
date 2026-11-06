import { redirect } from 'next/navigation'

export default async function PrintRedirect({ searchParams }: { searchParams: Promise<{ sitting?: string; groep?: string }> }) {
  const q = await searchParams
  const qs = new URLSearchParams()
  if (q.sitting) qs.set('sitting', q.sitting)
  if (q.groep) qs.set('groep', q.groep)
  redirect(`/print/examen${qs.toString() ? `?${qs}` : ''}`)
}
