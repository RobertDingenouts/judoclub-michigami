'use client';

import { useState } from 'react';
import { useT } from '@/i18n/LangContext';
import { legalDocuments, type LegalDocument } from '@/data/legal';
import { legalDocFor } from '@/i18n/content';

function LegalSectionItem({ section, index }: { section: { heading: string; content: string }; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="border border-[#e9e0cf] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[#fdf6f6] transition-colors"
      >
        <h4 className="font-semibold text-sm sm:text-base text-[#8c0000] pr-4">{section.heading}</h4>
        <svg
          className={`w-5 h-5 text-[#c00000] flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({
  doc,
  isActive,
  onClick,
}: {
  doc: LegalDocument;
  isActive: boolean;
  onClick: () => void;
}) {
  const { t } = useT();
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 sm:p-5 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-[#a90000] bg-gradient-to-r from-[#fdf6f6] to-white shadow-sm'
          : 'border-[#e9e0cf] bg-white hover:border-[#ddc0c0] hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-gradient-to-br from-[#a90000] to-[#c00000]' : 'bg-[#fdf6f6]'
          }`}
        >
          <svg
            className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#c00000]'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold text-sm sm:text-base truncate ${isActive ? 'text-[#8c0000]' : 'text-gray-800'}`}>
            {doc.title}
          </h3>
          {doc.version && (
            <p className="text-xs text-gray-400 mt-0.5">
              {t('Versie')} {doc.version}
              {doc.lastUpdated && ` · ${t('Bijgewerkt')} ${doc.lastUpdated}`}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function LegalSection() {
  const { t, lang } = useT();
  const [activeDocId, setActiveDocId] = useState(legalDocuments[0].id);
  const activeDoc = legalDocFor(legalDocuments.find((d) => d.id === activeDocId)!, lang);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{t('Juridisch')}</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">{t('Algemene voorwaarden, gedragscode en privacyverklaring')}</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Document List */}
        <div className="lg:col-span-1 space-y-3">
          {legalDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={legalDocFor(doc, lang)}
              isActive={doc.id === activeDocId}
              onClick={() => setActiveDocId(doc.id)}
            />
          ))}
        </div>

        {/* Document Content */}
        <div className="lg:col-span-2">
          {activeDoc && (
            <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-[#e9e0cf]">
                <h2 className="font-bold text-[#8c0000] text-base sm:text-lg">{activeDoc.title}</h2>
                {activeDoc.version && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t('Versie')} {activeDoc.version}
                    {activeDoc.lastUpdated && ` · ${t('Laatst bijgewerkt')} ${activeDoc.lastUpdated}`}
                  </p>
                )}
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {activeDoc.sections.map((section, idx) => (
                    <LegalSectionItem key={idx} section={section} index={idx} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
