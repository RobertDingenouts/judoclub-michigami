'use client';

import { membershipInfo } from '@/data/membership';
import { Calendar } from 'lucide-react';
import { openProeflesForm } from '@/lib/form-events';

export function MembershipSection() {
  return (
    <div className="space-y-6">
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{membershipInfo.title}</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">{membershipInfo.subtitle}</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Trial Lessons Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center text-xl flex-shrink-0">
            🎁
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#8c0000] text-base sm:text-lg">Proeflessen</h3>
            <p className="text-sm sm:text-base text-gray-700 mt-1">
              Wil je graag op judo, kom dan eerst een keer kijken! Je kunt{' '}
              <span className="font-bold text-[#a90000]">{membershipInfo.trialLessons}</span> volgen.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Bevalt het en wil je graag lid worden, schrijf je dan in via ons online inschrijfformulier.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {membershipInfo.tiers.map((tier, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{tier.icon}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#8c0000] text-sm sm:text-base truncate">{tier.name}</h3>
                <p className="text-xs text-gray-500">{tier.targetAudience}</p>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-xl sm:text-2xl font-bold text-[#a90000]">{tier.price}</span>
              <span className="text-xs text-gray-500 ml-1">{tier.pricePeriod}</span>
            </div>

            <ul className="space-y-1.5">
              {tier.benefits.map((benefit, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <span className="flex-shrink-0 text-[#a90000] mt-0.5">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Signup Button */}
      <div className="text-center space-y-3">
        <button
          onClick={() => openProeflesForm()}
          className="inline-flex items-center gap-2 bg-white border-2 border-[#a90000] text-[#a90000] px-6 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-[#fdf6f6] transition-all"
        >
          <Calendar className="w-4 h-4" /> Proefles Aanvragen
        </button>
        <div className="text-xs text-gray-500">of</div>
        <a
          href={membershipInfo.signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#a90000] to-[#c00000] text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base hover:from-[#8c0000] hover:to-[#a00000] transition-all shadow-md hover:shadow-lg"
        >
          {membershipInfo.signupText}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
