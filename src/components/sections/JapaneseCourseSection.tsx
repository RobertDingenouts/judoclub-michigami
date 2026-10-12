'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getLevels, type JudoLevel, type JudoTerm, beltColors } from '@/data/japanese-course';
import { Lock, Unlock, Trophy, ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, Star, ImageOff, Play, X } from 'lucide-react';
import { techniqueCategories } from '@/data/techniques';
import { getTechniqueImage } from '@/data/technique-images';
import { useT } from '@/i18n/LangContext';
import { termMeaning, termMeaningByDutch } from '@/i18n/content';

/** Map een JudoTerm naar een techniek afbeelding */
function getTermImage(term: JudoTerm) {
  for (const cat of techniqueCategories) {
    const tech = cat.techniques.find(t => t.name === term.uitspraak);
    if (tech) {
      const img = getTechniqueImage(cat.key, tech.id);
      if (img?.available) return img;
    }
  }
  return null;
}

/** Haal YouTube ID op bij een JudoTerm */
function getTermYouTubeId(term: JudoTerm): string | null {
  for (const cat of techniqueCategories) {
    const tech = cat.techniques.find(t => t.name === term.uitspraak);
    if (tech?.youtubeId) return tech.youtubeId;
  }
  return null;
}

// ==========================================================================
// SOUND SYSTEM (Web Audio API)
// ==========================================================================
function useSounds() {
  const [enabled, setEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [enabled, getCtx]);

  const sounds = {
    flip: () => playTone(800, 0.1, 'sine', 0.08),
    correct: () => {
      playTone(523, 0.15, 'sine', 0.12);
      setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100);
      setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 200);
    },
    wrong: () => {
      // tweetoons-buzzer: duidelijk "fout"-gevoel
      playTone(220, 0.18, 'square', 0.09);
      setTimeout(() => playTone(165, 0.32, 'square', 0.09), 140);
    },
    pass: () => {
      // Victory fanfare
      const notes = [523, 659, 784, 1047];
      notes.forEach((n, i) => setTimeout(() => playTone(n, 0.3, 'sine', 0.15), i * 150));
    },
    fail: () => {
      playTone(300, 0.4, 'sawtooth', 0.08);
      setTimeout(() => playTone(250, 0.5, 'sawtooth', 0.08), 200);
    },
    unlock: () => {
      // Sparkle sound
      const notes = [1047, 1319, 1568, 2093];
      notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'sine', 0.1), i * 100));
    },
    click: () => playTone(600, 0.05, 'sine', 0.06),
  };

  return { sounds, enabled, setEnabled };
}

// ==========================================================================
// CONFETTI SYSTEM
// ==========================================================================
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;

  const particles = Array.from({ length: 50 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2 + Math.random() * 2;
    const color = ['#a90000', '#FFD700', '#FF6B35', '#4CAF50', '#2196F3', '#9C27B0'][Math.floor(Math.random() * 6)];
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;

    return (
      <div
        key={i}
        className="absolute pointer-events-none"
        style={{
          left: `${left}%`,
          top: '-10px',
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          transform: `rotate(${rotation}deg)`,
          animation: `confettiFall ${duration}s ease-in ${delay}s forwards`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles}
    </div>
  );
}

// ==========================================================================
// PROGRESS STORAGE
// ==========================================================================
interface ProgressData {
  passedLevels: Record<string | number, boolean>;
  bestScores: Record<string | number, number>;
  lastPlayed: Record<string | number, string>;
}

// Belt level ↔ number mapping
const BELT_TO_NUM: Record<string, number> = {
  WIT: 0, GEEL: 1, ORANJE: 2, GROEN: 3, BLAUW: 4, BRUIN: 5,
};

function loadProgress(userId?: string): ProgressData {
  if (typeof window === 'undefined') return { passedLevels: {}, bestScores: {}, lastPlayed: {} };
  const key = userId ? `michigami-japanese-progress-${userId}` : 'michigami-japanese-progress';
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : { passedLevels: {}, bestScores: {}, lastPlayed: {} };
  } catch {
    return { passedLevels: {}, bestScores: {}, lastPlayed: {} };
  }
}

function saveProgress(data: ProgressData, userId?: string) {
  if (typeof window === 'undefined') return;
  const key = userId ? `michigami-japanese-progress-${userId}` : 'michigami-japanese-progress';
  localStorage.setItem(key, JSON.stringify(data));
}

// ==========================================================================
// PRONUNCIATION AUDIO
// ==========================================================================
function getAudioPath(term: string): string {
  return `/data/audio/japanese/${term.toLowerCase().replace(/\s+/g, '-')}.wav`;
}

function PlayButton({ term, size = 'md' }: { term: string; size?: 'sm' | 'md' }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const btnPadding = size === 'sm' ? 'p-2' : 'p-2.5';

  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(getAudioPath(term));
    audioRef.current = audio;
    setPlaying(true);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
  };

  return (
    <button
      onClick={play}
      className={`${btnPadding} rounded-lg bg-[#fdf6f6] hover:bg-[#fce4e4] border border-[#eeddd6] hover:border-[#a90000] transition-all flex items-center justify-center ${playing ? 'text-[#a90000] scale-110' : 'text-gray-400 hover:text-[#a90000]'}`}
      title="Uitspraak horen"
    >
      {playing
        ? <Volume2 className={`${iconSize} animate-pulse`} />
        : <Volume2 className={iconSize} />
      }
    </button>
  );
}

// ==========================================================================
// FLASHCARD COMPONENT
// ==========================================================================
function Flashcard({ term, onFlip }: { term: JudoTerm; onFlip: () => void }) {
  const { t, lang } = useT();
  const meaning = termMeaning(term.uitspraak, term.nederlands, lang);
  const [flipped, setFlipped] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const youtubeId = getTermYouTubeId(term);

  return (
    <>
      <div
        className="cursor-pointer"
        onClick={() => { setFlipped(!flipped); onFlip(); }}
      >
        <div className={`relative w-full h-[340px] sm:h-[360px] transition-transform duration-500 ${flipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-lg shadow-lg border-2 border-[#e9e0cf] flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="inline-block px-3 py-1 bg-[#a90000] text-white text-xs font-bold rounded-lg mb-4">
              {t(term.categorie)}
            </span>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#a90000] text-center break-words">
                {term.uitspraak}
              </h3>
              <PlayButton term={term.uitspraak} />
            </div>
            <p className="text-gray-400 text-xs mt-4">{t('Klik om te draaien')}</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-[#fdf6f6] rounded-lg shadow-lg border-2 border-[#a90000] flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="inline-block px-3 py-1 bg-[#a90000] text-white text-xs font-bold rounded-lg mb-3">
              {t(term.categorie)}
            </span>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center break-words w-full">
              {meaning}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-[#a90000] font-semibold">{term.uitspraak}</span>
              <PlayButton term={term.uitspraak} size="sm" />
            </div>
            {/* Technique image */}
            {(() => {
              const img = getTermImage(term);
              if (img?.available && img.thumbnail) {
                return (
                  <div className="mt-2 w-full max-w-[180px] mx-auto rounded-lg border border-[#e9e0cf] bg-white">
                    <img src={img.thumbnail} alt={term.uitspraak} className="w-full h-auto rounded-lg" />
                  </div>
                );
              }
              return null;
            })()}
            {/* Video button */}
            {youtubeId && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#a90000] hover:bg-[#8c0000] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                Bekijk video
              </button>
            )}
            <p className="text-gray-400 text-xs mt-2">Klik om terug te gaan</p>
          </div>
        </div>
      </div>
      {/* Video modal */}
      {showVideo && youtubeId && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setShowVideo(false); }}
        >
          <div className="relative w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-100 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="aspect-video rounded-lg overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={term.uitspraak}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <p className="text-white text-center text-sm mt-3 font-medium">{term.uitspraak} — {meaning}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================================================
// QUIZ MODE COMPONENT
// ==========================================================================
/* Fisher-Yates shuffle — onbevooroordeeld, en IMPORTANT: alleen aanroepen
   in useMemo/startQuiz, NOOIT in de render-body (anders shopt de opties
   bij elke re-render en 'springen' de antwoorden weg). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Module-niveau: één keer opgebouwd, dus een stabiele array-referentie.
   Dit MOET buiten de component: getLevels() maakt anders per render een
   nieuwe array, welke dan als memo-dependency de opties alsnog per klik
   zou herschudden. */
const WRONG_ANSWER_POOL: string[] = Array.from(
  new Set(getLevels().flatMap((l) => l.terms).map((t) => t.nederlands)),
);

export function QuizMode({ level, onPass, onNext, onPrev }: { level: JudoLevel; onPass: (score: number, total: number) => void; onNext?: () => void; onPrev?: () => void }) {
  const { t, lang } = useT();
  const meaningOf = useCallback((term: JudoTerm) => termMeaning(term.uitspraak, term.nederlands, lang), [lang]);
  const wrongPool = useMemo(
    () => Array.from(new Set(WRONG_ANSWER_POOL.map((n) => (lang === 'en' ? (termMeaningByDutch(n, lang) ?? n) : n)))),
    [lang],
  );
  const [questions, setQuestions] = useState<JudoTerm[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wasWrong, setWasWrong] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { sounds } = useSounds();

  function startQuiz() {
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    // Use all terms or a random subset of up to 15 for shorter quizzes
    const quizTerms = shuffle(level.terms).slice(0, Math.min(15, level.terms.length));
    setQuestions(quizTerms);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowFeedback(false);
    setFinished(false);
    setWasWrong(false);
  }

  // Auto-start quiz on mount
  useEffect(() => {
    startQuiz();
    return () => {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    };
  }, []);

  /* Opties per vraag exact één keer genereren en onthouden — de volgorde
     blijft dus staan tijdens feedback én wisselt niet per toeval. */
  const optionsByQuestion = useMemo(() => {
    return questions.map((q) => {
      const correct = meaningOf(q);
      const wrong = shuffle(wrongPool.filter((n) => n !== correct)).slice(0, 3);
      return shuffle([correct, ...wrong]);
    });
  }, [questions, meaningOf, wrongPool]);

  function handleAnswer(option: string) {
    if (showFeedback || !questions.length) return;
    const correct = meaningOf(questions[currentIndex]);
    const isCorrect = option === correct;

    setSelected(option);
    setShowFeedback(true);
    setWasWrong(!isCorrect);
    sounds.click();

    if (isCorrect) {
      setScore((s) => s + 1);
      sounds.correct();
    } else {
      sounds.wrong();
      try { navigator.vibrate?.([60, 40, 90]); } catch {}
    }

    // Auto-advance: kort bij goed, iets langer bij fout zodat je het antwoord ziet
    const timer = setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const percentage = Math.round((finalScore / questions.length) * 100);
        const passed = percentage >= 80;
        setFinished(true);
        if (passed) {
          sounds.pass();
          onPass(finalScore, questions.length);
        } else {
          sounds.fail();
        }
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setShowFeedback(false);
        setWasWrong(false);
      }
    }, isCorrect ? 1100 : 2200);

    setAutoAdvanceTimer(timer);
  }

  if (level.terms.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-6 sm:p-8">
        <p className="text-gray-500 text-center">{t('Geen termen beschikbaar voor deze module.')}</p>
      </div>
    );
  }

  if (!questions.length) return null;

  // Results screen
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-6 sm:p-8 text-center relative overflow-hidden">
        {passed && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-green-50 to-transparent opacity-50" />
        )}
        <div className="relative z-10">
          <div className={`w-20 h-20 rounded-lg mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gray-200'}`}>
            {passed ? <Trophy className="w-10 h-10 text-white" /> : <RotateCcw className="w-10 h-10 text-gray-400" />}
          </div>
          <h3 className={`text-2xl sm:text-3xl font-bold mb-2 ${passed ? 'text-[#198754]' : 'text-[#dc3545]'}`}>
            {passed ? t('🎉 Gefeliciteerd!') : t('Blijf oefenen!')}
          </h3>
          <p className="text-5xl font-bold text-[#8c0000] my-4">{score} / {questions.length}</p>
          <div className="w-full h-4 bg-gray-100 rounded-lg mb-4 overflow-hidden">
            <div
              className={`h-full rounded-lg transition-all duration-1000 ${passed ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-red-400'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-gray-500 mb-2">{percentage}% {t('goed')} — {passed ? t('(≥80% geslaagd!)') : t('(min. 80% nodig)')}</p>
          {passed && (
            <div className="mt-3 space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-600 text-lg">🎓</span>
                <span className="text-sm font-bold text-yellow-700">{t('Diploma ontvangen!')}</span>
              </div>
              <p className="text-xs text-gray-500">{t('Je diploma staat in je dashboard onder')} "Mijn Diploma's"</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            {passed && onNext && (
              <button
                onClick={onNext}
                className="bg-gradient-to-r from-[#a90000] to-[#8c0000] hover:from-[#8c0000] hover:to-[#700000] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                {t('Volgende band')} →
              </button>
            )}
            {passed && onPrev && (
              <button
                onClick={onPrev}
                className="bg-white border-2 border-[#a90000] text-[#a90000] hover:bg-[#fdf6f6] px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                ← {t('Terug naar modules')}
              </button>
            )}
            <button
              onClick={startQuiz}
              className="bg-white border-2 border-gray-200 hover:border-[#a90000] text-gray-600 hover:text-[#a90000] px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {t('Opnieuw proberen')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const correctAnswer = meaningOf(question);

  /* options komen uit de memo: volgorde is stabiel per vraag */
  const options = optionsByQuestion[currentIndex] ?? [];

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-4 sm:p-6 ${wasWrong ? 'quiz-shake' : ''}`}>
      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">
          {t('Vraag')} {currentIndex + 1} {t('van')} {questions.length}
        </p>
        <p className="text-xs font-bold text-[#a90000]">Score: {score}</p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-[#8c0000] text-center break-words">
          {question.uitspraak}
        </h3>
        <PlayButton term={question.uitspraak} size="sm" />
      </div>

      <p className="text-center text-sm text-gray-500 mb-4">{t('Wat betekent dit?')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          let btnClass = 'bg-white border-[#e9e0cf] text-gray-700 hover:border-[#a90000] hover:text-[#a90000] hover:shadow-sm';
          let mark = '';
          if (showFeedback) {
            if (option === correctAnswer) {
              btnClass = 'quiz-pop bg-[#198754] border-[#198754] text-white shadow-lg shadow-green-200';
              mark = '✓';
            } else if (option === selected && option !== correctAnswer) {
              btnClass = 'quiz-wrong bg-[#dc3545] border-[#dc3545] text-white shadow-lg shadow-red-200';
              mark = '✗';
            } else {
              btnClass = 'bg-gray-50 border-[#e9e0cf] text-gray-300 opacity-60';
            }
          }

          return (
            <button
              key={`${currentIndex}-${idx}`}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
              className={`relative p-3 sm:p-4 rounded-lg border-2 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${btnClass} ${!showFeedback ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
            >
              {mark && <span className="text-lg font-black">{mark}</span>}
              {option}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <p className={`mt-4 text-center font-bold ${selected === correctAnswer ? 'text-[#198754]' : 'quiz-pop text-[#dc3545]'}`}>
          {selected === correctAnswer ? `✓ ${t('Correct!')}` : `✗ ${t('Jammer — juist antwoord')}: ${correctAnswer}`}
        </p>
      )}
    </div>
  );
}

// ==========================================================================
// MAIN COMPONENT
// ==========================================================================
export function JapaneseCourseSection() {
  const { t } = useT();
  const levels = getLevels();
  const [selectedLevel, setSelectedLevel] = useState<JudoLevel | null>(null);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [cardIndex, setCardIndex] = useState(0);
  const [progress, setProgressState] = useState<ProgressData>(loadProgress);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { sounds, enabled: soundEnabled, setEnabled: setSoundEnabled } = useSounds();

  // Fetch auth + DB progress on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const uid = data.user.id;
          setUserId(uid);
          // Fetch per-user progress from database
          fetch('/api/cursus-japans/sync')
            .then((r) => r.json())
            .then((progressData) => {
              if (progressData.success && progressData.progress) {
                const passedLevels: Record<number, boolean> = {};
                progressData.progress.forEach((cp: any) => {
                  const num = BELT_TO_NUM[cp.beltLevel];
                  if (num !== undefined && cp.isPassed) {
                    passedLevels[num] = true;
                  }
                });
                setProgressState({ passedLevels, bestScores: {}, lastPlayed: {} });
              }
            })
            .catch(() => {
              // Fallback to localStorage if API fails
              setProgressState(loadProgress(uid));
            });
        }
      })
      .catch(() => {});
  }, []);

  // Save progress on change (user-scoped)
  useEffect(() => {
    saveProgress(progress, userId ?? undefined);
  }, [progress, userId]);

  // Belt order for unlocking (only belt levels, not special modules)
  const beltOrder = [0, 1, 2, 3, 4, 5]; // Wit → Geel → Oranje → Groen → Blauw → Bruin

  function isLevelUnlocked(level: JudoLevel): boolean {
    // Special modules (algemeen, wedstrijd) are always unlocked
    if (typeof level.id === 'string') return true;

    // First belt (witte band = 0) is always unlocked
    if (level.id === 0) return true;

    // Check if previous belt was passed
    const prevBelt = beltOrder[beltOrder.indexOf(level.id) - 1];
    return !!progress.passedLevels[prevBelt];
  }

  function handlePass(quizScore: number, totalQuestions: number) {
    if (!selectedLevel || typeof selectedLevel.id !== 'number') return;

    const levelId = selectedLevel.id;

    // Save pass status locally
    setProgressState(prev => ({
      ...prev,
      passedLevels: { ...prev.passedLevels, [levelId]: true },
    }));

    // Sync to server (fire and forget — doesn't block UI)
    fetch('/api/cursus-japans/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beltLevel: levelId,
        score: quizScore,
        totalQuestions,
        wordsLearned: quizScore,
        wordsTotal: totalQuestions,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.diploma) {
          console.log(`Diploma aangemaakt: ${data.diploma.title} (${data.diploma.verificationCode})`);
        }
      })
      .catch((err) => console.error('Sync error:', err));

    // Check if this unlocks the next belt
    const nextBeltIdx = beltOrder.indexOf(selectedLevel.id) + 1;
    if (nextBeltIdx < beltOrder.length) {
      sounds.unlock();
    }

    // Show confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }

  function navigateCard(direction: 'prev' | 'next') {
    if (!selectedLevel) return;
    sounds.click();
    setCardIndex(prev => {
      if (direction === 'next') return Math.min(prev + 1, selectedLevel.terms.length - 1);
      return Math.max(prev - 1, 0);
    });
  }

  // Keyboard navigation for flashcards
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!selectedLevel || mode !== 'learn') return;
      if (e.key === 'ArrowRight') navigateCard('next');
      if (e.key === 'ArrowLeft') navigateCard('prev');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedLevel, mode, cardIndex]);

  // Level detail view
  if (selectedLevel) {
    const currentTerm = selectedLevel.terms[cardIndex];
    if (!currentTerm) return null;

    return (
      <div className="space-y-6">
        {/* Back button + sound toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedLevel(null); setCardIndex(0); setMode('learn'); }}
            className="inline-flex items-center gap-2 text-[#a90000] hover:text-[#8c0000] font-semibold text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Terug naar modules
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'text-[#a90000] bg-[#fdf6f6]' : 'text-gray-400'}`}
            title={soundEnabled ? t('Geluid uit') : t('Geluid aan')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Belt info header */}
        <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow"
              style={{ backgroundColor: selectedLevel.color }}
            >
              {typeof selectedLevel.id === 'number' ? `${selectedLevel.id + 1}` : '📚'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{t(selectedLevel.name)}</h2>
              <p className="text-white/70 text-xs sm:text-sm">{selectedLevel.terms.length} {t('termen')}</p>
            </div>
            {progress.passedLevels[selectedLevel.id] && (
              <div className="ml-auto flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-bold text-green-200">{t('Geslaagd!')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex bg-[#f5f5f0] rounded-lg p-1">
          <button
            onClick={() => { setMode('learn'); sounds.click(); }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${
              mode === 'learn'
                ? 'bg-[#a90000] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📖 {t('Leren')}
          </button>
          <button
            onClick={() => { setMode('quiz'); sounds.click(); }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${
              mode === 'quiz'
                ? 'bg-[#a90000] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎯 {t('Examen')}
          </button>
        </div>

        {mode === 'learn' ? (
          <div className="space-y-4 relative">
            <Flashcard
              key={cardIndex}
              term={currentTerm}
              onFlip={() => sounds.flip()}
            />

            {/* Card navigation */}
            <div className="flex items-center justify-center gap-4 relative z-10 pointer-events-auto">
              <button
                onClick={() => navigateCard('prev')}
                disabled={cardIndex === 0}
                className="p-2.5 rounded-lg bg-white border border-[#e9e0cf] hover:bg-[#fdf6f6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm pointer-events-auto"
              >
                <ChevronLeft className="w-5 h-5 text-[#a90000]" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-[#e9e0cf]">
                <span className="text-sm font-bold text-[#a90000]">{cardIndex + 1}</span>
                <div className="w-16 h-2 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-[#a90000] rounded-lg transition-all"
                    style={{ width: `${((cardIndex + 1) / selectedLevel.terms.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">/ {selectedLevel.terms.length}</span>
              </div>

              <button
                onClick={() => navigateCard('next')}
                disabled={cardIndex === selectedLevel.terms.length - 1}
                className="p-2.5 rounded-lg bg-white border border-[#e9e0cf] hover:bg-[#fdf6f6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm pointer-events-auto"
              >
                <ChevronRight className="w-5 h-5 text-[#a90000]" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              ← → pijltjes op toetsenbord om te navigeren
            </p>
          </div>
        ) : (
          <QuizMode
            level={selectedLevel}
            onPass={handlePass}
            onNext={() => {
              if (typeof selectedLevel.id === 'number') {
                const nextIdx = beltOrder.indexOf(selectedLevel.id) + 1;
                if (nextIdx < beltOrder.length) {
                  const nextLevel = levels.find(l => l.id === nextIdx);
                  if (nextLevel) {
                    setSelectedLevel(nextLevel);
                    setCardIndex(0);
                    setMode('learn');
                  }
                }
              }
            }}
            onPrev={() => {
              setSelectedLevel(null);
              setCardIndex(0);
              setMode('learn');
            }}
          />
        )}

        {/* Confetti */}
        <Confetti active={showConfetti} />
      </div>
    );
  }

  // Module grid view
  return (
    <div className="space-y-8">
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{t('Cursus Japans')}</h1>
            <p className="text-white/80 mt-1 text-xs sm:text-sm">
              {t('Examentrainer voor de Japanse judo-terminologie')}
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'text-white bg-white/20' : 'text-white/40'}`}
            title={soundEnabled ? t('Geluid uit') : t('Geluid aan')}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>

      {/* Progress overview */}
      {(() => {
        const passedCount = beltOrder.filter(b => progress.passedLevels[b]).length;
        const totalBelts = beltOrder.length;
        return (
          <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800 text-sm">{t('Jouw voortgang')}</h3>
              <span className="text-xs font-bold text-[#a90000]">{passedCount}/{totalBelts} {t('banden geslaagd')}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#a90000] to-yellow-500 rounded-lg transition-all duration-1000"
                style={{ width: `${(passedCount / totalBelts) * 100}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Module Grid */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#8c0000] mb-4">{t('Kies een module')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level);
            const passed = !!progress.passedLevels[level.id];

            return (
              <button
                key={level.id}
                onClick={() => { if (unlocked) { setSelectedLevel(level); sounds.click(); } }}
                disabled={!unlocked}
                className={`group rounded-lg shadow-sm border-b-4 transition-all text-left relative overflow-hidden ${
                  unlocked
                    ? 'bg-white hover:shadow-md cursor-pointer'
                    : 'bg-gray-50 opacity-60 cursor-not-allowed'
                }`}
                style={{ borderColor: unlocked ? level.borderColor : '#e0e0e0', borderWidth: '1px 1px 4px 1px' }}
              >
                {/* Locked overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-gray-100/60 flex items-center justify-center z-10">
                    <div className="bg-white rounded-lg p-3 shadow-lg">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Passed badge */}
                {passed && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-green-500 text-white rounded-lg p-1 shadow">
                      <Star className="w-3 h-3" />
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    {unlocked ? (
                      passed ? <Unlock className="w-4 h-4 text-green-500" /> : <Unlock className="w-4 h-4 text-[#a90000]" />
                    ) : null}
                    <h3 className={`text-lg sm:text-xl font-bold transition-colors ${
                      unlocked ? 'text-gray-800 group-hover:text-[#a90000]' : 'text-gray-400'
                    }`}>
                      {t(level.name)}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {level.terms.length} {t('termen')}
                  </p>
                  {!unlocked && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      📌 {t('Haal eerst de vorige band')}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#fdf6f6] rounded-lg p-4 sm:p-5 border border-[#e9e0cf]">
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-center">
          <strong>{t('Hoe werkt het?')}</strong> — {t('Leer de termen met flashcards, doe dan het examen (min. 80% nodig). Haal je een band? Dan ontgrendel je automatisch de volgende!')} 🥋
        </p>
      </div>

      {/* Confetti */}
      <Confetti active={showConfetti} />
    </div>
  );
}
