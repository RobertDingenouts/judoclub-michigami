import { db } from '@/lib/db'

// AUTO-ARCHIEF: een GESTOPT lid met een stopdatum in de toekomst blijft actief
// t/m die dag (zie api/admin2/member-status). De dag ná de stopdatum moet het
// lid naar archief; zonder cron doet elke admin-pagina dit idempotente
// updateMany bij het laden. leaveDate staat op 00:00 UTC van de stopdatum, dus
// met 'lt dagStart' is het lid op de stopdatum zelf nog actief.
export async function archivePassedStops() {
  const dagStart = new Date(new Date().toISOString().slice(0, 10))
  await db.member.updateMany({
    where: { clubStatus: 'GESTOPT', isActive: true, leaveDate: { lt: dagStart } },
    data: { isActive: false },
  })
}
