"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("SW registered:", registration.scope);
            // Listen for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              newWorker?.addEventListener("statechange", () => {
                if (newWorker.state === "activated") {
                  console.log("SW updated — reload to get new content");
                }
              });
            });
          },
          (error) => {
            console.error("SW registration failed:", error);
          }
        );
      });
    }
  }, []);

  return null;
}
