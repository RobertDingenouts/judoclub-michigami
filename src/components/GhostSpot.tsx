'use client';

import { useEffect, useState } from 'react';
import { isHalloweenPeriod } from '@/lib/seasonal';

// Spookje-verstoopactie: 13 spookjes verdeeld over de site (okt '26).
// Alleen tijdens de Halloween-periode in het DOM; pointer-events uit,
// geen animatie — wie ze zoekt, vindt ze.
export function GhostSpot({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (isHalloweenPeriod()) setOn(true);
  }, []);
  if (!on) return null;
  return (
    <span aria-hidden="true" className={`pointer-events-none ${className ?? ''}`}>
      <svg viewBox="0 0 40 44" fill="currentColor" className="w-full h-auto">
        <path d="M20 3 C10.5 3 4 10.8 4 20.2 L4 40 L8.6 35.6 L13.2 40 L20 34.8 L26.8 40 L31.4 35.6 L36 40 L36 20.2 C36 10.8 29.5 3 20 3 Z" />
        <circle cx="14.5" cy="18" r="2.7" fill="rgba(20,20,20,.55)" />
        <circle cx="25.5" cy="18" r="2.7" fill="rgba(20,20,20,.55)" />
        <path d="M15 25 Q20 28.5 25 25 Q22.5 27.5 20 27.5 Q17.5 27.5 15 25 Z" fill="rgba(20,20,20,.45)" />
      </svg>
    </span>
  );
}
