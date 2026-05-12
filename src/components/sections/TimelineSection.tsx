'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { timelineEvents, type TimelineEvent } from '@/data/timeline-data';
import { Trophy, Award, MapPin, Star, Users, Swords } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  judo: <Swords className="w-5 h-5" />,
  club: <Users className="w-5 h-5" />,
  person: <Star className="w-5 h-5" />,
  award: <Award className="w-5 h-5" />,
  location: <MapPin className="w-5 h-5" />,
  star: <Trophy className="w-5 h-5" />,
};

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className={`relative flex items-center w-full mb-8 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Dot on the line */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
            event.isMilestone
              ? 'bg-gradient-to-br from-[#a90000] to-[#c00000] text-white ring-4 ring-red-100'
              : 'bg-white border-2 border-[#a90000] text-[#a90000]'
          }`}
        >
          {iconMap[event.icon || 'club'] || <Users className="w-4 h-4" />}
        </motion.div>
      </div>

      {/* Card content */}
      <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.1 + 0.15, duration: 0.5 }}
        >
          <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
            event.isMilestone ? 'ring-2 ring-red-100' : ''
          }`}>
            {/* Year badge */}
            <div className="bg-gradient-to-r from-[#a90000] to-[#c00000] text-white px-4 py-2 flex items-center gap-2">
              {event.isMilestone && <Trophy className="w-4 h-4" />}
              <span className="font-bold text-lg">{event.year}</span>
            </div>

            <CardContent className="p-4 space-y-2">
              <h3 className="font-bold text-gray-800 text-base leading-tight">{event.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>

              {event.photoUrl && (
                <div className="mt-3 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={event.photoUrl}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-auto max-h-48 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Spacer for the other side */}
      <div className="hidden md:block md:w-[calc(50%-2rem)]" />
    </motion.div>
  );
}

export function TimelineSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 30 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="relative bg-gradient-to-br from-[#a90000] via-[#8c0000] to-[#7a0000] text-white p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-8 text-8xl font-bold">武道</div>
            </div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Onze Geschiedenis</h1>
              <p className="text-white/80 mt-2 text-sm sm:text-base">
                Van Jigoro Kano tot vandaag — de reis van judo en Judoclub Michigami
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Timeline */}
      <div className="relative pl-10 md:pl-0">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#a90000] via-[#c00000] to-[#a90000] opacity-30" />

        {/* Timeline items */}
        {timelineEvents.map((event, index) => (
          <TimelineItem key={event.year + index} event={event} index={index} />
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center pt-4"
      >
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#fdf6f6] to-white">
          <CardContent className="p-6 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center">
              <Swords className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              <span className="font-semibold text-[#c00000]">Judoclub Michigami</span> — meer dan 30 jaar judo in Steenbergen en omgeving.{' '}
              Respect, discipline en passie voor de zachte weg.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
