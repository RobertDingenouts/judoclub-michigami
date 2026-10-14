"use client";

import { useEffect } from "react";

// Herkentbare fouten die wijzen op stale SW/cache: de HTML verwijst naar
// chunks die na een deploy niet meer bestaan.
const CHUNK_ERROR_RE =
  /ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export function PWARegister() {
  useEffect(() => {
    // Service worker alleen op de echte productie-URL.
    // Op dev/Tailscale-IP's zou een oude SW stale chunks serveren ->
    // pagina rendert maar knoppen doen niets (hydration faalt).
    const host = window.location.hostname;
    const isProd =
      host === "judoclubmichigami.nl" ||
      host === "www.judoclubmichigami.nl" ||
      host === "judoclub-michigami.vercel.app";
    if (!isProd) return;
    if (!("serviceWorker" in navigator)) return;

    const HEAL_KEY = "sw-selfheal-reload";
    const alreadyHealed = sessionStorage.getItem(HEAL_KEY) === "1";

    // Zelfheling: chunk-loadfout = oude SW/cache serveert kapotte mix.
    // Dan: alle service workers afmelden, alle caches leegmaken, één keer reloaden.
    const heal = async () => {
      if (alreadyHealed) return;
      sessionStorage.setItem(HEAL_KEY, "1");
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* best effort */
      }
      window.location.reload();
    };

    const onError = (e: Event) => {
      const msg =
        (e as ErrorEvent).message ||
        (e as PromiseRejectionEvent).reason?.message ||
        "";
      if (CHUNK_ERROR_RE.test(String(msg))) void heal();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);

    // Schone load = heling niet meer nodig (guard resetten voor volgende keer)
    window.addEventListener(
      "load",
      () => sessionStorage.removeItem(HEAL_KEY),
      { once: true }
    );

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
          // Nieuwe SW neemt controle over (skipWaiting+claim) -> één keer
          // reloaden zodat verse chunks worden gebruikt. Nooit een lus:
          // maximaal één reload per tab-sessie.
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            const CTRL_KEY = "sw-controller-reload";
            if (sessionStorage.getItem(CTRL_KEY) === "1") return;
            sessionStorage.setItem(CTRL_KEY, "1");
            window.location.reload();
          });

          // Lang-open tabs: periodiek + bij terugkeer naar voorgrond
          // op de nieuwste sw.js checken.
          setInterval(() => void registration.update(), 30 * 60 * 1000);
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible")
              void registration.update();
          });
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    });
  }, []);

  return null;
}
