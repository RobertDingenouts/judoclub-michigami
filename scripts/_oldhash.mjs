import bcrypt from 'bcryptjs'
import fs from 'fs'
import zlib from 'zlib'
const d = JSON.parse(zlib.gunzipSync(fs.readFileSync('/home/suffie/michigami-backups/backup-productie-oud-schema-2026-10-07.json.gz')).toString())
const u = d.User.find(x => x.email === 'robertdingenouts@gmail.com')
console.log('oude hash volledig:', u.passwordHash)
console.log('admin123 vs oude hash:', await bcrypt.compare('admin123', u.passwordHash))
