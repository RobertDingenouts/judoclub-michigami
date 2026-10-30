'use client';

import { useEffect, useState } from 'react';
import { isHalloweenPeriod, HALLOWEEN_LOGO, HALLOWEEN_FAVICON } from '@/lib/seasonal';

// <img> die tijdens de Halloween-periode automatisch de pompoen-badge toont.
// Start altijd met het normale logo (server-render) en wisselt client-side —
// voorkomt hydration-mismatch op de grensdagen.
export function SeasonalLogo({
  base = '/logo-hd.png',
  alt = 'Michigami',
  className,
}: {
  base?: string;
  alt?: string;
  className?: string;
}) {
  const [src, setSrc] = useState(base);
  useEffect(() => {
    if (isHalloweenPeriod()) setSrc(HALLOWEEN_LOGO);
  }, []);
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} alt={alt} className={className} />;
}

// Vervangt favicon + PWA-theme-icon tijdelijk tijdens de periode.
export function SeasonalFavicon() {
  useEffect(() => {
    if (!isHalloweenPeriod()) return;
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
    if (links.length) {
      links.forEach((l) => l.setAttribute('href', HALLOWEEN_FAVICON));
    } else {
      const l = document.createElement('link');
      l.rel = 'icon';
      l.href = HALLOWEEN_FAVICON;
      document.head.appendChild(l);
    }
  }, []);
  return null;
}
