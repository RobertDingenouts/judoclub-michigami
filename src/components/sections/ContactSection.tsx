'use client';

import { useState } from 'react';
import { GhostSpot } from '@/components/GhostSpot'
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { useT } from '@/i18n/LangContext';

// --- Form state ---
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const SUBJECTS = [
  'Algemene vraag',
  'Proefles / inschrijving',
  'Afmelden / opzeggen',
  'Training & agenda',
  'Toernooi / evenement',
  'Sponsoring / samenwerking',
  'Anders',
];

function getWhatsAppLink(data: ContactFormData) {
  const text = encodeURIComponent(
    `Hoi! (via contactformulier website)\n\n` +
    `Naam: ${data.name}\n` +
    `Onderwerp: ${data.subject}\n` +
    (data.email ? `Email: ${data.email}\n` : '') +
    (data.phone ? `Telefoon: ${data.phone}\n` : '') +
    `\n${data.message}`
  );
  return `https://wa.me/31${contactInfo.whatsapp.slice(1)}?text=${text}`;
}

function getMailtoLink(data: ContactFormData) {
  const subject = encodeURIComponent(`Website contact: ${data.subject} — ${data.name}`);
  const body = encodeURIComponent(
    `Beste Judoclub Michigami,\n\n` +
    `${data.message}\n\n` +
    `Groet,\n${data.name}\n` +
    (data.email ? `Email: ${data.email}\n` : '') +
    (data.phone ? `Telefoon: ${data.phone}` : '')
  );
  return `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
}

// --- Location card ---
function LocationCard({ loc }: { loc: (typeof contactInfo.locations)[number] }) {
  const { t } = useT();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-[#a90000] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800">{loc.name}</p>
            <p className="text-sm text-gray-600">{loc.address}</p>
            <p className="text-sm text-gray-600">{loc.postalCode} {loc.city}</p>
            <p className="text-xs text-[#a90000] font-semibold mt-1.5">
              {t(loc.trainingDay)} · {loc.trainingTime}
            </p>
          </div>
        </div>
        <a
          href={loc.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 bg-[#a90000] hover:bg-[#8c0000] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full justify-center"
        >
          <MapPin className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" />
          {t('Open in Google Maps')}
        </a>
      </div>
    </div>
  );
}

// --- Contact form (eigen beheer: WhatsApp of mail) ---
function ContactForm() {
  const { t } = useT();
  const [data, setData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [submitted, setSubmitted] = useState<null | 'whatsapp' | 'email'>(null);

  const canSubmit = data.name.trim().length > 0 && data.message.trim().length > 0;

  const handleWhatsApp = () => {
    if (!canSubmit) return;
    window.open(getWhatsAppLink(data), '_blank');
    setSubmitted('whatsapp');
  };

  const handleEmail = () => {
    if (!canSubmit) return;
    window.location.href = getMailtoLink(data);
    setSubmitted('email');
  };

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          {submitted === 'whatsapp' ? t('WhatsApp geopend') : t('E-mailprogramma geopend')}
        </h3>
        <p className="text-sm text-gray-600 mb-5">
          {submitted === 'whatsapp'
            ? t('Je bericht is klaar in WhatsApp — druk op verzenden!')
            : t('Je bericht is klaar in je e-mailprogramma — druk op verzenden!')}
        </p>
        <button
          onClick={() => {
            setSubmitted(null);
            setData({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
          }}
          className="text-sm text-[#a90000] font-semibold hover:text-[#8c0000]"
        >
          {t('Nog een bericht sturen')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Naam */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('Naam')} <span className="text-[#a90000]">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder={t('Je naam')}
          className="w-full px-3 py-2.5 rounded-lg border border-[#e9e0cf] bg-[#fdfcfa] text-sm focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000]"
        />
      </div>

      {/* Onderwerp */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('Onderwerp')}</label>
        <select
          value={data.subject}
          onChange={(e) => setData({ ...data, subject: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg border border-[#e9e0cf] bg-[#fdfcfa] text-sm focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000]"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{t(s)}</option>
          ))}
        </select>
      </div>

      {/* Email + telefoon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('Email')}</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="jij@voorbeeld.nl"
            className="w-full px-3 py-2.5 rounded-lg border border-[#e9e0cf] bg-[#fdfcfa] text-sm focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{t('Telefoon')}</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="06 12345678"
            className="w-full px-3 py-2.5 rounded-lg border border-[#e9e0cf] bg-[#fdfcfa] text-sm focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000]"
          />
        </div>
      </div>

      {/* Bericht */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {t('Bericht')} <span className="text-[#a90000]">*</span>
        </label>
        <textarea
          value={data.message}
          onChange={(e) => setData({ ...data, message: e.target.value })}
          placeholder={t('Waar kunnen we je mee helpen?')}
          rows={5}
          className="w-full px-3 py-2.5 rounded-lg border border-[#e9e0cf] bg-[#fdfcfa] text-sm focus:outline-none focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000] resize-none"
        />
      </div>

      {/* Verzendknoppen */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleWhatsApp}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb857] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
        >
          <Send className="w-4 h-4" />
          {t('Verstuur via WhatsApp')}
        </button>
        <button
          onClick={handleEmail}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#a90000] hover:bg-[#8c0000] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
        >
          <Mail className="w-4 h-4" />
          {t('Verstuur via email')}
        </button>
      </div>

      {/* Info: afmelden */}
      <p className="text-xs text-gray-500 border-t border-[#e9e0cf] pt-3">
        {t('Afmelden? Dat kan gewoon per e-mail, WhatsApp of mondeling tijdens de les. De opzegtermijn is 1 maand voor het einde van het kwartaal.')}
      </p>
    </div>
  );
}

// --- Main section ---
export function ContactSection() {
  const { t } = useT();
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
            <GhostSpot className="absolute bottom-1 right-1/2 w-5 text-white/25" />
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{t('Contact')}</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          {t('Neem contact op met Judoclub Michigami')}
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form (eigen beheer) */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#e9e0cf]">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] section-title">{t('Contactformulier')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('Verstuur je bericht via WhatsApp of je e-mailprogramma')}
            </p>
          </div>
          <ContactForm />
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          {/* Club Info */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] mb-4 section-title">
              {contactInfo.clubName}
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-600">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#a90000] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" />
                <a href={`tel:${contactInfo.whatsapp}`} className="text-[#a90000] hover:text-[#8c0000]">
                  WhatsApp {contactInfo.whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#a90000] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" />
                <a href={`mailto:${contactInfo.email}`} className="text-[#a90000] hover:text-[#8c0000]">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] mb-4 section-title">
              {t('Volg ons')}
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href={contactInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-opacity"
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
                className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#e60000] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.041 0 12 0 12s0 3.959.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.959 24 12 24 12s0-3.959-.502-5.814zM9.549 15.568V8.432L15.816 12l-6.267 3.568z" />
                </svg>
                YouTube
              </a>
            </div>
          </div>

          {/* Locations (beide) */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] section-title">Onze locaties</h2>
            {contactInfo.locations.map((loc) => (
              <LocationCard key={loc.name} loc={loc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
