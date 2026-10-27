'use client';

import { useEffect, useState } from 'react';

// Eén gedeelde, module-cachede auth-status — components delen de enkele fetch.
let cached: any | null | undefined; // undefined = nog niet geladen
let inflight: Promise<any> | null = null;
const listeners = new Set<(u: any | null) => void>();

async function loadUser(): Promise<any | null> {
  if (cached !== undefined) return cached;
  if (!inflight) {
    inflight = fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        cached = d.authenticated && d.user ? d.user : null;
        listeners.forEach(fn => fn(cached));
        return cached;
      })
      .catch(() => {
        cached = null;
        return null;
      });
  }
  return inflight;
}

export function useAuthUser(): any | null {
  const [user, setUser] = useState<any | null>(cached ?? null);
  useEffect(() => {
    if (cached !== undefined) { setUser(cached); return; }
    let mounted = true;
    const fn = (u: any | null) => { if (mounted) setUser(u); };
    listeners.add(fn);
    loadUser();
    return () => { mounted = false; listeners.delete(fn); };
  }, []);
  return user;
}
