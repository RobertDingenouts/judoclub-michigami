import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function StudentsPage() {
  let count = 0
  let error: string | null = null
  try {
    count = await db.member.count()
  } catch (e: any) {
    error = e.message
  }
  return <div><h1>Studenten</h1><p>Totaal: {count}</p>{error && <p style={{color:'red'}}>{error}</p>}</div>
}
