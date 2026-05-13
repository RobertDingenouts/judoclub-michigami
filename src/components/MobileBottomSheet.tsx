'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Mail, Phone, MapPin, Send, Navigation } from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { locationData } from '@/data/location';
import { TrialLessonForm } from './sections/TrialLessonForm';

// --- Contact Bottom Sheet ---
export function ContactBottomSheet({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg font-bold" style={{ color: '#8c0000' }}>
            Contact
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${contactInfo.whatsapp}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-[#fdf6f6] to-white border border-[#c00000]/10 active:scale-[0.97] transition-transform"
            >
              <Phone className="w-6 h-6" style={{ color: '#c00000' }} />
              <span className="text-xs font-semibold text-gray-700">Bellen</span>
            </a>
            <a
              href={`https://wa.me/31${contactInfo.whatsapp.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 active:scale-[0.97] transition-transform"
            >
              <Send className="w-6 h-6 text-[#25D366]" />
              <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
            </a>
          </div>

          {/* Email */}
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#e8eaed] active:scale-[0.97] transition-transform"
          >
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#c00000' }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{contactInfo.email}</p>
              <p className="text-xs text-gray-500">Stuur een e-mail</p>
            </div>
          </a>

          {/* Address */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#e8eaed]">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#c00000' }} />
            <div>
              <p className="text-sm font-semibold text-gray-800">{contactInfo.location.name}</p>
              <p className="text-xs text-gray-500">{contactInfo.location.address}</p>
              <p className="text-xs text-gray-500">{contactInfo.location.postalCode} {contactInfo.location.city}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={contactInfo.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-semibold active:scale-[0.97] transition-transform"
            >
              Facebook
            </a>
            <a
              href={contactInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-semibold active:scale-[0.97] transition-transform"
            >
              Instagram
            </a>
            <a
              href={contactInfo.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF0000] text-white text-xs font-semibold active:scale-[0.97] transition-transform"
            >
              YouTube
            </a>
          </div>

          <DrawerClose asChild>
            <button className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm active:scale-[0.97] transition-transform">
              Sluiten
            </button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- Location Bottom Sheet ---
export function LocationBottomSheet({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg font-bold" style={{ color: '#8c0000' }}>
            Locaties
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          {locationData.map((loc, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden">
              {/* Map preview */}
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(loc.address + ' ' + loc.postalCode + ' ' + loc.city)}&output=embed`}
                width="100%"
                height="140"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#c00000' }} />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{loc.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>
                    <p className="text-xs text-gray-500">{loc.postalCode} {loc.city}</p>
                  </div>
                </div>
                {loc.isPrimary && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-[#fdf6f6] text-[#a90000] text-[10px] font-semibold">
                    Hoofdlocatie
                  </span>
                )}
                <a
                  href={loc.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#a90000] text-white text-xs font-semibold active:scale-[0.97] transition-transform w-full justify-center"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          ))}

          <DrawerClose asChild>
            <button className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm active:scale-[0.97] transition-transform">
              Sluiten
            </button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- Proefles Bottom Sheet ---
export function ProeflesBottomSheet({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild onClick={(e) => { e.preventDefault(); setOpen(true); }}>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg font-bold" style={{ color: '#8c0000' }}>
            Gratis Proefles
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <TrialLessonForm onClose={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
