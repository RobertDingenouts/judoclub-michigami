import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { TOERNOOIEN, niveauOptiesVoor, BANDEN } from '@/lib/toernooien'

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

    const { toernooi, naam, geslacht, leeftijd, geboortedatum, gewicht, band, niveau, betaald, opmerking } = body

    const cfg = TOERNOOIEN[toernooi]
    if (!cfg) {
      return NextResponse.json({ success: false, error: 'Onbekend toernooi' }, { status: 400 })
    }
    if (!naam || !geslacht || !gewicht || !band || !niveau) {
      return NextResponse.json({ success: false, error: 'Vul alle verplichte velden in' }, { status: 400 })
    }
    if (!['Man', 'Vrouw'].includes(geslacht)) {
      return NextResponse.json({ success: false, error: 'Ongeldig geslacht' }, { status: 400 })
    }
    if (!niveauOptiesVoor(toernooi)[niveau]) {
      return NextResponse.json({ success: false, error: 'Ongeldig niveau' }, { status: 400 })
    }
    if (!(BANDEN as readonly string[]).includes(band)) {
      return NextResponse.json({ success: false, error: 'Ongeldige bandkleur' }, { status: 400 })
    }

    // Geboortedatum: verplicht voor toernooien die die vragen (Yoshi-Kwai);
    // leeftijd wordt eruit berekend als die niet apart mee komt.
    let geoDatum: string | null = null
    const leeftijdInput = (leeftijd === '' || leeftijd === null || leeftijd === undefined) ? NaN : Math.round(Number(leeftijd))
    let leeftijdN = leeftijdInput
    if (geboortedatum) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(geboortedatum)) {
        return NextResponse.json({ success: false, error: 'Geboortedatum klopt niet (jjjj-mm-dd)' }, { status: 400 })
      }
      const geboorte = new Date(geboortedatum)
      const nu = new Date()
      if (isNaN(geboorte.getTime()) || geboorte > nu || geboorte.getFullYear() < 1930) {
        return NextResponse.json({ success: false, error: 'Geboortedatum klopt niet' }, { status: 400 })
      }
      geoDatum = geboortedatum
      const toernooiD = new Date(cfg.toernooidatumISO)
      let berekend = toernooiD.getFullYear() - geboorte.getFullYear()
      const mm = toernooiD.getMonth() - geboorte.getMonth()
      if (mm < 0 || (mm === 0 && toernooiD.getDate() < geboorte.getDate())) berekend--
      if (!Number.isFinite(leeftijdN)) leeftijdN = berekend
    }
    if (cfg.vraagGeboortedatum && !geoDatum) {
      return NextResponse.json({ success: false, error: 'Geboortedatum is verplicht voor dit toernooi' }, { status: 400 })
    }
    if (cfg.verplichtBetalingBijInschrijving && betaald !== true && betaald !== 'ja') {
      return NextResponse.json({ success: false, error: 'Maak het inschrijfgeld eerst over op de clubrekening en vink daarna bevestigd aan — inschrijven kan pas daarna.' }, { status: 400 })
    }
    if (!Number.isFinite(leeftijdN) || leeftijdN < 4 || leeftijdN > 70) {
      return NextResponse.json({ success: false, error: 'Leeftijd moet tussen 4 en 70 zijn' }, { status: 400 })
    }
    const gewichtN = Number(gewicht)
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
        geboortedatum: geoDatum,
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
