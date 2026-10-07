import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const db = new PrismaClient({ datasourceUrl: prod })
const u = await db.$queryRawUnsafe(`SELECT id, email, role::text r, is_active FROM "User" WHERE email='robertdingenouts@gmail.com'`)
console.log('ADMIN:', JSON.stringify(u))
await db.$disconnect()
