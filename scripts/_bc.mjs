import bcrypt from 'bcryptjs'
const HASH = '$2b$10$Jru.YEJXiQScRxhdIF5TTO' // + rest uit DB
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const db = new PrismaClient({ datasourceUrl: prod })
const r = await db.$queryRawUnsafe(`SELECT "passwordHash" h FROM "User" WHERE email='robertdingenouts@gmail.com'`)
console.log('bcrypt admin123 vs PROD-hash:', await bcrypt.compare('admin123', r[0].h))
await db.$disconnect()
