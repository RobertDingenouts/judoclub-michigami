'use client';

import { useState } from 'react';
import { newsArchive, socialLinks } from '@/data/news-archive';
import Image from 'next/image';
import { AnimatedCard, AnimatedButton } from '@/components/ui/animated-card';

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function NewsCard({ article }: { article: (typeof newsArchive)[number]['articles'][number] }) {
  return (
    <AnimatedCard>
      <article className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] overflow-hidden hover:shadow-md transition-shadow">
        {article.imageUrl && (
          <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#a90000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time className="text-xs text-gray-400">{formatDate(article.date)}</time>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#8c0000] mb-3">{article.title}</h3>
          <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {article.content}
          </div>
        </div>
      </article>
    </AnimatedCard>
  );
}

function YearSection({ yearData, autoOpen = false }: { yearData: (typeof newsArchive)[number], autoOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(autoOpen);

  return (
    <AnimatedCard>
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] overflow-hidden">
        {/* Year Header - Clickable */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a90000] to-[#8c0000] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {yearData.year}
            </div>
            <div>
              <h2 className="font-bold text-[#8c0000] text-base sm:text-lg">{yearData.year}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {yearData.articles.length} artikel{yearData.articles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Articles - Collapsible */}
        {isOpen && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 border-t border-gray-100 pt-4">
            {yearData.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

export function NewsSection() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedCard>
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
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Nieuwsarchief</h1>
          <p className="text-white/80 mt-1 text-xs sm:text-sm">
            Historisch nieuws van Judoclub Michigami (2013-heden)
          </p>
          <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
        </div>
      </AnimatedCard>

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
        <p className="text-sm sm:text-base text-gray-700 mb-4">
          Kijk voor het laatste nieuws over judoclub Michigami op onze sociale media:
        </p>
        <div className="flex flex-wrap gap-3">
          <AnimatedButton as="a" href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
            <div className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </div>
          </AnimatedButton>
          <AnimatedButton as="a" href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-opacity">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Instagram
            </div>
          </AnimatedButton>
          <AnimatedButton as="a" href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
            <div className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </div>
          </AnimatedButton>
        </div>
      </div>

      {/* News Archive by Year — nieuwste jaar automatisch open */}
      <div className="space-y-4">
        {newsArchive.map((yearData, idx) => (
          <YearSection key={yearData.year} yearData={yearData} autoOpen={idx === 0} />
        ))}
      </div>

      {/* Empty state if no articles */}
      {newsArchive.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-8 text-center">
          <p className="text-gray-500">Er is nog geen nieuws beschikbaar.</p>
        </div>
      )}
    </div>
  );
}
