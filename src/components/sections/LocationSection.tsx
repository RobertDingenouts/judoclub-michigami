'use client';

import { locationData, directions } from '@/data/location';

function MapEmbed({ location }: { location: (typeof locationData)[number] }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#e8eaed]">
      <iframe
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDummy&q=${encodeURIComponent(location.address + ', ' + location.city)}`}
        className="w-full h-64 sm:h-80 bg-[#f5f5f0]"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function LocationSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <svg
          viewBox="0 0 100 80"
          className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 text-white opacity-[0.06]"
          fill="currentColor"
        >
          <rect x="5" y="8" width="90" height="6" rx="2" />
          <rect x="12" y="18" width="76" height="4" rx="1" />
          <rect x="20" y="18" width="6" height="58" rx="1" />
          <rect x="74" y="18" width="6" height="58" rx="1" />
        </svg>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Locatie</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Waar je onze trainingen kunt vinden
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {locationData.map((location, idx) => (
          <div key={idx} className="lg:col-span-2 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#8c0000]">{location.name}</h2>

            {location.image && (
              <div className="rounded-2xl overflow-hidden shadow-sm border border-[#e8eaed]">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-48 sm:h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <strong>{location.name}</strong>
                <br />
                {location.address}
                {location.postalCode && (
                  <>
                    <br />
                    {location.postalCode} {location.city}
                  </>
                )}
              </p>
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-[#a90000] hover:text-[#8c0000] font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Routebeschrijving
              </a>
            </div>

            <MapEmbed location={location} />
          </div>
        ))}

        {/* Directions sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#8c0000]">
            Routebeschrijving
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
            <ul className="space-y-3">
              {directions.map((dir, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-[#a90000] flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{dir}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
