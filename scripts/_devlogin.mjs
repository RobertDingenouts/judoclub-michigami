import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const db = new PrismaClient({ datasourceUrl: dev })
const user = await db.user.findUnique({ where: { email: 'robertdingenouts@gmail.com' } })
console.log('gevonden:', !!user, '| rol:', user?.role, '| is_active:', user?.is_active)
console.log('hash prefix:', user?.passwordHash?.slice(0, 10))
console.log('bcrypt admin123:', user?.passwordHash ? await bcrypt.compare('admin123', user.passwordHash) : 'GEEN HASH')
await db.$disconnect()
