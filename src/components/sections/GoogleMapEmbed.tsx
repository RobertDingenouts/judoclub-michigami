'use client';

interface MapProps {
  center: [number, number];
  name: string;
  address: string;
}

export function GoogleMapEmbed({ center, name, address }: MapProps) {
  const query = encodeURIComponent(`${name}, ${address}`);
  // Google Maps embed zonder API key — werkt met watermark
  const src = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="w-full h-56 sm:h-72 md:h-80 rounded-none overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
        title={`${name} - Google Maps`}
      />
    </div>
  );
}
