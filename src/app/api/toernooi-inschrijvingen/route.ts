import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { TOERNOOIEN, NIVEAUS, BANDEN } from '@/lib/toernooien'

export const dynamic = 'force-dynamic'

// GET /api/toernooi-inschrijvingen?toernooi=<slug>  — alleen admin
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })
  const slug = req.nextUrl.searchParams.get('toernooi')
  const entries = await db.tournamentEntry.findMany({
    where: slug ? { toernooi: slug } : {},
    orderBy: [{ toernooi: 'asc' }, { leeftijd: 'asc' }, { naam: 'asc' }],
  })
  return NextResponse.json({ success: true, entries })
}

// POST /api/toernooi-inschrijvingen  — publiek inschrijfformulier
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>

    // Honeypot: stille tuimelvanger voor bots
    if (body.firmenaam) {
      return NextResponse.json({ success: true, message: 'Ok' })
    }

    const { toernooi, naam, geslacht, leeftijd, gewicht, band, niveau, betaald, opmerking } = body

    if (!TOERNOOIEN[toernooi]) {
      return NextResponse.json({ success: false, error: 'Onbekend toernooi' }, { status: 400 })
    }
    if (!naam || !geslacht || !leeftijd || !gewicht || !band || !niveau) {
      return NextResponse.json({ success: false, error: 'Vul alle verplichte velden in' }, { status: 400 })
    }
    if (!['Man', 'Vrouw'].includes(geslacht)) {
      return NextResponse.json({ success: false, error: 'Ongeldig geslacht' }, { status: 400 })
    }
    if (!NIVEAUS[niveau]) {
      return NextResponse.json({ success: false, error: 'Ongeldig niveau' }, { status: 400 })
    }
    if (!(BANDEN as readonly string[]).includes(band)) {
      return NextResponse.json({ success: false, error: 'Ongeldige bandkleur' }, { status: 400 })
    }
    const leeftijdN = Math.round(Number(leeftijd))
    const gewichtN = Number(gewicht)
    if (!Number.isFinite(leeftijdN) || leeftijdN < 4 || leeftijdN > 70) {
      return NextResponse.json({ success: false, error: 'Leeftijd moet tussen 4 en 70 zijn' }, { status: 400 })
    }
    if (!Number.isFinite(gewichtN) || gewichtN < 10 || gewichtN > 200) {
      return NextResponse.json({ success: false, error: 'Gewicht (kg) klopt niet' }, { status: 400 })
    }

    const schoon = String(naam).trim().replace(/\s+/g, ' ')
    const bestaand = await db.tournamentEntry.findFirst({
      where: { toernooi, naam: { equals: schoon, mode: 'insensitive' } },
    })
    if (bestaand) {
      return NextResponse.json({
        success: false,
        error: `${schoon} staat al ingeschreven voor dit toernooi. Fout ingevuld? Mail de secretaris dan, dan passen we het aan.`,
      }, { status: 409 })
    }

    // Wie was ingelogd? (optioneel, voor de admin-overzichten)
    let ingediendDoor: string | null = null
    try {
      const { getCurrentUser } = await import('@/lib/auth')
      const user = await getCurrentUser()
      if (user?.email) ingediendDoor = user.email
    } catch { /* niet ingelogd — prima */ }

    const entry = await db.tournamentEntry.create({
      data: {
        toernooi,
        naam: schoon,
        geslacht,
        leeftijd: leeftijdN,
        gewicht: gewichtN,
        band,
        niveau,
        betaald: betaald === true || betaald === 'ja',
        opmerking: opmerking ? String(opmerking).trim().slice(0, 500) : null,
        ingediendDoor,
      },
    })

    console.log(`[TOERNOOI-INSCHRIJVING] ${schoon} → ${toernooi} (ID ${entry.id})`)
    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error('[TOERNOOI-INSCHRIJVING] Error:', error)
    return NextResponse.json({ success: false, error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
