'use client';

import { useState } from 'react';
import { beltKnotVideos, beltKnotInfo } from '@/data/belt-knots';

export function BeltKnotsSection() {
  const [activeVideo, setActiveVideo] = useState(0);

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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Band Knopen</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Leer je judo-band netjes knopen</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>

      {/* Video Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] overflow-hidden">
        <div className="flex border-b border-[#e9e0cf]">
          {beltKnotVideos.map((video, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVideo(idx)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeVideo === idx
                  ? 'bg-gradient-to-r from-[#fdf6f6] to-white text-[#a90000] border-b-2 border-[#a90000]'
                  : 'text-gray-500 hover:text-[#a90000] hover:bg-[#fdf6f6]'
              }`}
            >
              {video.title}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {/* Video Embed */}
          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4 sm:mb-6">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${beltKnotVideos[activeVideo].youtubeId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Tips */}
          <div className="mt-4 sm:mt-6">
            <h3 className="font-bold text-[#8c0000] text-base sm:text-lg mb-3">Tips</h3>
            <ul className="space-y-2">
              {beltKnotInfo.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 text-[#a90000] mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
