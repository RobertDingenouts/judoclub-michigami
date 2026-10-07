import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const dev = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/dev_url.txt', 'utf8').trim()
const prod = fs.readFileSync('/home/suffie/.hermes/profiles/michigami/cache/scratch/prod_url.txt', 'utf8').trim()
const d = new PrismaClient({ datasourceUrl: dev })
const p = new PrismaClient({ datasourceUrl: prod })

const dUsers = new Set((await d.$queryRawUnsafe(`SELECT email FROM "User" WHERE email IS NOT NULL`)).map(r => r.email.toLowerCase()))
const pUsers = await p.$queryRawUnsafe(`SELECT email, role::text r FROM "User" WHERE email IS NOT NULL`)
const missieUsers = pUsers.filter(u => !dUsers.has(u.email.toLowerCase()))
console.log('PROD users:', pUsers.length, '| ontbreken in DEV:', missieUsers.length)
if (missieUsers.length) console.log(JSON.stringify(missieUsers))

const dMem = new Set((await d.$queryRawUnsafe(`SELECT lower("firstName")||' '||lower("lastName") n FROM "Member"`)).map(r => r.n))
const pMem = await p.$queryRawUnsafe(`SELECT lower("firstName")||' '||lower("lastName") n FROM "Member"`)
const missieMem = pMem.filter(m => !dMem.has(m.n))
console.log('PROD members:', pMem.length, '| ontbreken in DEV:', missieMem.length)
if (missieMem.length) console.log(JSON.stringify(missieMem))

const dApp = new Set((await d.$queryRawUnsafe(`SELECT lower("firstName")||' '||lower("lastName") n FROM "MembershipApplication"`)).map(r => r.n))
const pApp = await p.$queryRawUnsafe(`SELECT lower("firstName")||' '||lower("lastName") n, status::text s FROM "MembershipApplication"`)
const missieApp = pApp.filter(a => !dApp.has(a.n))
console.log('PROD apps:', pApp.length, '| ontbreken in DEV:', missieApp.length)
if (missieApp.length) console.log(JSON.stringify(missieApp))

const dDip = await d.diploma.count(); const pDip = await p.diploma.count()
console.log('Diplomas — DEV:', dDip, 'PROD:', pDip)
await d.$disconnect(); await p.$disconnect()
