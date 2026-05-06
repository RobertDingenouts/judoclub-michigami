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

// OpenFreeMap tile layer (gratis, geen API key nodig!)
const OPENFREE_MAP_TILES = 'https://openfreemap.org/tiles/bright/{z}/{x}/{y}.png';

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
      scrollWheelZoom: false,
    }).setView(center, 15);

    L.tileLayer(OPENFREE_MAP_TILES, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker(center).addTo(map).bindPopup(
      `<div style="font-family:sans-serif;padding:4px;">
        <strong>${name}</strong><br/>
        <span style="font-size:0.9em;color:#555;">${address}</span>
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
      className="w-full h-56 sm:h-72 md:h-80 rounded-t-2xl overflow-hidden z-[1]"
    />
  );
}
