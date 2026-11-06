import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const p = new PrismaClient();
const members = await p.member.findMany({
  select: { id: true, firstName: true, lastName: true, currentBelt: true, dateOfBirth: true, isActive: true,
            bondHistory: { select: { belt: true, awardedAt: true, source: true }, orderBy: { awardedAt: 'asc' } } },
  orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
});
fs.writeFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/db_banden.json',
  JSON.stringify(members.map(m => ({
    id: m.id, naam: `${m.firstName} ${m.lastName}`.trim(), currentBelt: m.currentBelt,
    geb: m.dateOfBirth ? m.dateOfBirth.toISOString().slice(0,10) : null,
    actief: m.isActive,
    history: m.bondHistory.map(h => ({ belt: h.belt, datum: h.awardedAt.toISOString().slice(0,10), bron: h.source })),
  })), null, 1));
console.log('leden:', members.length, '| met history:', members.filter(m=>m.bondHistory.length).length);
await p.$disconnect();
