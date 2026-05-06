'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  address: string;
  name: string;
}

export function InteractiveMap({ center, address, name }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(center, 15);

    // OpenStreetMap tiles (gratis, geen API key nodig)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom red marker style
    const redIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:#a90000;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
        <div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);"></div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });

    L.marker(center, { icon: redIcon }).addTo(map).bindPopup(
      `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:6px 10px;min-width:150px;">
        <strong style="font-size:14px;color:#a90000;">${name}</strong><br/>
        <span style="font-size:12px;color:#555;line-height:1.4;">${address.replace(/,/g, '<br/>')}</span>
      </div>`
    );

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, name, address]);

  return (
    <div
      ref={mapRef}
      className="w-full h-56 sm:h-72 md:h-80 rounded-t-2xl overflow-hidden"
    />
  );
}
