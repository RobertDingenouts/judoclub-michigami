// Eenvoudige in-memory rate-limiter (vast venster).
// Volstaat voor één Next.js-instantie op die ene VPS; bij meerdere instanties
// (of serverless) hier Redis/Upstash van maken.
const hits = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  if (hits.size > 10_000) {
    // af en toe opruimen zodat het geheugen niet volloopt
    for (const [k, h] of hits) if (h.reset <= now) hits.delete(k)
  }
  const h = hits.get(key)
  if (!h || h.reset <= now) {
    hits.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  h.count += 1
  return h.count <= limit
}

export function clientIp(request: Request): string {
  const xf = request.headers.get('x-forwarded-for')
  return xf?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}
