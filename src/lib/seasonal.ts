// Seizoensperiodes voor theming op de site.
// Halloween-variant van het logo draait van 20 t/m 2 november.
export const HALLOWEEN_LOGO = "/logo-halloween-sm.png";
export const HALLOWEEN_FAVICON = "/favicon-halloween.png";

export function isHalloweenPeriod(now: Date = new Date()): boolean {
  const m = now.getMonth(); // 0-indexed: 9 = okt, 10 = nov
  const d = now.getDate();
  return (m === 9 && d >= 20) || (m === 10 && d <= 2);
}
