import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const h = await db.member.findMany({ where: { firstName: { contains: 'Hanna' }, OR: [{ lastName: { contains: 'leefman' } }] }, select: { id: true, firstName: true, lastName: true, isActive: true, clubStatus: true, leaveDate: true, primaryGroup: true } })
console.log('HANNA:', JSON.stringify(h, null, 1))
const gestopt = await db.member.groupBy({ by: ['isActive', 'clubStatus'], _count: true })
console.log('STATUSSEN:', JSON.stringify(gestopt))
await db.$disconnect()
