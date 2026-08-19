import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Publieke zelf-registratie is uitgeschakeld.
 *
 * Accounts worden uitsluitend aangemaakt door de club:
 *  1. Lid inschrijven via het inschrijfformulier → admin goedgekeurd →
 *     account + tijdelijk wachtwoord per e-mail.
 *  2. Admin voegt (bestaand) lid toe in het admin-dashboard →
 *     account + tijdelijk wachtwoord per e-mail.
 *
 * Deze route blijft bestaan (410) zodat oude bookmarks/links nette
 * melding geven in plaats van een 500.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Zelfstandige registratie is niet mogelijk. Accounts worden door Judoclub Michigami aangemaakt: schrijf je in via het inschrijfformulier en de club maakt je account aan.',
    },
    { status: 410 }
  )
}