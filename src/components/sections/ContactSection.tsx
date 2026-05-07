'use client';

import { contactInfo } from '@/data/contact';

export function ContactSection() {
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Contact</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Neem contact op met Judoclub Michigami
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e8eaed]">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000]">Contactformulier</h2>
          </div>
          <div className="p-2">
            <iframe
              id="JotFormIFrame-252603880994366"
              title="Contactformulier"
              src={contactInfo.jotformUrl}
              allow="geolocation; microphone; camera; fullscreen; payment"
              className="w-full border-0"
              style={{ minHeight: '539px' }}
              scrolling="no"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          {/* Club Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] mb-4">
              {contactInfo.clubName}
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#a90000] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">{contactInfo.location.name}</p>
                  <p>{contactInfo.location.address}</p>
                  <p>{contactInfo.location.postalCode} {contactInfo.location.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#a90000] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${contactInfo.whatsapp}`} className="text-[#a90000] hover:text-[#8c0000]">
                  WhatsApp {contactInfo.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#a90000] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${contactInfo.email}`} className="text-[#a90000] hover:text-[#8c0000]">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] mb-4">
              Volg ons
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href={contactInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
              <a
                href={contactInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-opacity"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
              <a
                href={contactInfo.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.041 0 12 0 12s0 3.959.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.959 24 12 24 12s0-3.959-.502-5.814zM9.549 15.568V8.432L15.816 12l-6.267 3.568z" />
                </svg>
                YouTube
              </a>
            </div>
          </div>

     {/* Location Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#e8eaed]">
              <h2 className="text-lg sm:text-xl font-bold text-[#8c0000]">Onze locatie</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#a90000] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">{contactInfo.location.name}</p>
                  <p className="text-sm text-gray-600">{contactInfo.location.address}</p>
                  <p className="text-sm text-gray-600">{contactInfo.location.postalCode} {contactInfo.location.city}</p>
                </div>
              </div>
              <a
                href={contactInfo.location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#a90000] hover:bg-[#8c0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors w-full justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
