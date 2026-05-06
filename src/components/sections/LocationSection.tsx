'use client';

import { locationData, directions } from '@/data/location';
import { GoogleMapEmbed } from './GoogleMapEmbed';

export function LocationSection() {
  return (
    <div className="space-y-6 pb-4 sm:pb-0">
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Locatie</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Waar je onze trainingen kunt vinden
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Location Cards */}
      <div className="space-y-8">
        {locationData.map((location, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] overflow-hidden">
            {/* Map */}
            <GoogleMapEmbed
              center={[location.coordinates.lat, location.coordinates.lng]}
              address={`${location.address}${location.postalCode ? `, ${location.postalCode} ` : ''}${location.city}`}
              name={location.name}
            />

            {/* Info */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#a90000] hover:text-[#8c0000] font-semibold text-sm transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Routebeschrijving
                </a>
              </div>

              {location.isPrimary && (
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf6f6] text-[#a90000] text-xs font-semibold">
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

      {/* Directions */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#a90000] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
          </svg>
          Routebeschrijving
        </h2>
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
  );
}
