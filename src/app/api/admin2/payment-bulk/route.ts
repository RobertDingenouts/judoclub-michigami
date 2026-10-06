import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// POST { periodId, status, dueDate?, exceptMemberIds?, onlyPastDue? } — zet ALLE openstaande
// facturen van een periode in één keer op een status en/of vervaldatum.
// onlyPastDue: alleen facturen waarvan de vervaldatum verstreken is (schuldig).
// Herinneringen hebben alleen zin voor schuldigen — de officiële betaaldatum
// ligt vóór de kwartaalstart, dus zolang die niet geweest is is er niets te herinneren.
//
// Let op: `status` en `paidAt` gaan altijd samen. Eerder was er een bulkactie
// die alleen `paidAt` zette en de status op OPEN liet: 31 betaalde facturen
// (Q2) verschenen daardoor als "nog betalen". Daarom wordt de status hier
// expliciet meegegeven en nooit los gezet van de datum.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Geen admin' }, { status: 403 })

  const { periodId, status, dueDate, exceptMemberIds, onlyPastDue } = await req.json()
  const valid = ['OPEN', 'BETAALD', 'HERINNERING1', 'HERINNERING2', 'VIJGESTELD']
  if (!periodId) return NextResponse.json({ error: 'periodId nodig' }, { status: 400 })
  if (status && !valid.includes(status)) return NextResponse.json({ error: `Ongeldige status: ${status}` }, { status: 400 })
  if (!status && !dueDate) return NextResponse.json({ error: 'status of dueDate nodig' }, { status: 400 })

  const where: Prisma.PaymentWhereInput = {
    periodId,
    // Statuswijziging: alleen niet-afgehandelde facturen (vrijgestelden en
    // betaalden nooit overschrijven). Alleen dueDate: het hele blok mag bij.
    ...(status ? { status: { in: ['OPEN', 'HERINNERING1', 'HERINNERING2'] } } : {}),
    ...(Array.isArray(exceptMemberIds) && exceptMemberIds.length
      ? { memberId: { notIn: exceptMemberIds } }
      : {}),
    ...(onlyPastDue ? { dueDate: { lt: new Date(new Date().toISOString().slice(0, 10)) } } : {}),
  }

  // Eerst tellen voor de bevestiging in de UI.
  const n = await db.payment.count({ where })

  const data: Prisma.PaymentUpdateManyMutationInput = {}
  if (status) data.status = status as Prisma.EnumPaymentStatusFieldUpdateOperationsInput['set']
  // Status en datum altijd tegelijk: anders ontstaat de inconsistentie van mei.
  if (status) data.paidAt = status === 'BETAALD' ? new Date() : null
  if (dueDate) data.dueDate = new Date(dueDate)

  const res = await db.payment.updateMany({ where, data })

  return NextResponse.json({ ok: true, count: res.count, gevonden: n })
}
