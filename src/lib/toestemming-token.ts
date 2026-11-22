import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || 'michigami-admin-session-secret-change-in-production'

// Deterministische, verifieerbare link-token per lid (geen DB-veld nodig).
export function toestemmingToken(memberId: string): string {
  return crypto.createHmac('sha256', SECRET).update('toestemming:' + memberId).digest('base64url').slice(0, 16)
}

export function checkToestemmingToken(memberId: string, token: string): boolean {
  const expected = toestemmingToken(memberId)
  if (token.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}
