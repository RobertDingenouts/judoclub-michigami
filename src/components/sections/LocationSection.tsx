'use client';

import { locationData } from '@/data/location';
import { GoogleMapEmbed } from './GoogleMapEmbed';

export function LocationSection() {
  return (
    <div className="space-y-6 pb-4 sm:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-none p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Locatie</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Waar je onze trainingen kunt vinden
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-none mt-2 sm:mt-3" />
      </div>

      {/* Location Cards */}
      <div className="space-y-8">
        {locationData.map((location, idx) => (
          <div key={idx} className="bg-white rounded-none shadow-sm border border-[#e8eaed] overflow-hidden">
            {/* Map */}
            <GoogleMapEmbed
              center={[location.coordinates.lat, location.coordinates.lng]}
              address={`${location.address}${location.postalCode ? `, ${location.postalCode} ` : ''}${location.city}`}
              name={location.name}
            />

            {/* Info */}
            <div className="p-4 sm:p-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#a90000]">{location.name}</h2>
                <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed">
                  {location.address}
                  {location.postalCode && (
                    <>
                      <br />
                      {location.postalCode} {location.city}
                    </>
                  )}
                </p>
              </div>

              {location.isPrimary && (
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#fdf6f6] text-[#a90000] text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hoofdlocatie
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
