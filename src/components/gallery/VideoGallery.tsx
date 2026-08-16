'use client';

import { videoData, youtubeChannel } from '@/data/videos';

function VideoEmbed({ video }: { video: (typeof videoData)[number] }) {
  return (
    <div className="group relative rounded-none overflow-hidden shadow-lg bg-black aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${video.youtubeId}`}
        title={video.title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-white font-semibold text-sm sm:text-base">{video.title}</h3>
        {video.description && (
          <p className="text-white/70 text-xs mt-1">{video.description}</p>
        )}
      </div>
    </div>
  );
}

export function VideoGallery() {
  return (
    <div className="space-y-8">
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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Video&apos;s</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Beelden van onze judoclub en trainingen
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-none mt-2 sm:mt-3" />
      </div>

      {/* YouTube Channel Info */}
      <div className="bg-white rounded-none shadow-sm border border-[#e8eaed] p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#8c0000] mb-2">
          Ons YouTube-kanaal
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
          Judoclub Michigami heeft ook een eigen YouTube-kanaal! Hier kun je al onze video&apos;s bekijken.
          Je kunt je ook (gratis!) abonneren op het kanaal, zodat je meteen bericht krijgt als er een nieuwe video is geüpload.
        </p>
        <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          Heb jij een leuk filmpje wat je wil toevoegen aan ons kanaal? Bespreek dit dan even tijdens de les.
        </p>
        <a
          href={youtubeChannel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#a90000] hover:bg-[#8c0000] text-white px-5 py-2.5 rounded-none font-semibold text-sm transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.041 0 12 0 12s0 3.959.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.959 24 12 24 12s0-3.959-.502-5.814zM9.549 15.568V8.432L15.816 12l-6.267 3.568z" />
          </svg>
          Bekijk ons kanaal
        </a>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {videoData.map((video) => (
          <VideoEmbed key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
