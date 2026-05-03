'use client';

import { useState } from 'react';
import { getLevels, type JudoLevel, type JudoTerm, beltColors } from '@/data/japanese-course';

function Flashcard({ term, onFlip }: { term: JudoTerm; onFlip: () => void }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer"
      onClick={() => { setFlipped(!flipped); onFlip(); }}
    >
      <div className={`relative w-full h-64 sm:h-72 transition-transform duration-500 ${flipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-[#e8eaed] flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="inline-block px-3 py-1 bg-[#a90000] text-white text-xs font-bold rounded-full mb-4">
            {term.categorie}
          </span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#a90000] text-center">
            {term.uitspraak}
          </h3>
          <p className="text-gray-400 text-xs mt-4">Klik om te draaien</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 bg-[#fdf6f6] rounded-2xl shadow-lg border-2 border-[#a90000] flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="inline-block px-3 py-1 bg-[#a90000] text-white text-xs font-bold rounded-full mb-4">
            {term.categorie}
          </span>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
            {term.nederlands}
          </p>
          <p className="text-gray-400 text-xs mt-4">Klik om terug te gaan</p>
        </div>
      </div>
    </div>
  );
}

function QuizMode({ level }: { level: JudoLevel }) {
  const [questions, setQuestions] = useState<JudoTerm[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);

  function startQuiz() {
    const shuffled = [...level.terms].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowFeedback(false);
    setFinished(false);
  }

  if (level.terms.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-6 sm:p-8">
        <p className="text-gray-500 text-center">Geen termen beschikbaar voor deze module.</p>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-6 sm:p-8 text-center">
        <h3 className={`text-2xl sm:text-3xl font-bold mb-2 ${passed ? 'text-[#198754]' : 'text-[#dc3545]'}`}>
          {passed ? 'Gefeliciteerd!' : 'Blijf oefenen!'}
        </h3>
        <p className="text-3xl font-bold text-[#8c0000] mb-2">{score} / {questions.length}</p>
        <p className="text-gray-500 mb-4">{percentage}% goed</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={startQuiz}
            className="bg-[#a90000] hover:bg-[#8c0000] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Opnieuw
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const correctAnswer = question.nederlands;

  // Generate wrong answers from all terms
  const allTerms = getLevels().flatMap((l) => l.terms);
  const wrongAnswers = allTerms
    .filter((t) => t.nederlands !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((t) => t.nederlands);

  const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8eaed] p-4 sm:p-6">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mb-2">
        Vraag {currentIndex + 1} van {questions.length}
      </p>

      <h3 className="text-2xl sm:text-3xl font-bold text-[#8c0000] text-center mb-6">
        {question.uitspraak}
      </h3>

      <p className="text-center text-sm text-gray-500 mb-4">Wat betekent dit?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          let btnClass = 'bg-white border-[#e8eaed] text-gray-700 hover:border-[#a90000] hover:text-[#a90000]';
          if (showFeedback) {
            if (option === correctAnswer) {
              btnClass = 'bg-[#198754] border-[#198754] text-white';
            } else if (option === selected && option !== correctAnswer) {
              btnClass = 'bg-[#dc3545] border-[#dc3545] text-white';
            } else {
              btnClass = 'bg-white border-[#e8eaed] text-gray-400';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (showFeedback) return;
                setSelected(option);
                setShowFeedback(true);
                if (option === correctAnswer) setScore((s) => s + 1);
              }}
              disabled={showFeedback}
              className={`p-3 sm:p-4 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all ${btnClass} ${!showFeedback ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <p className={`mt-4 text-center font-bold ${selected === correctAnswer ? 'text-[#198754]' : 'text-[#dc3545]'}`}>
          {selected === correctAnswer ? 'Correct!' : `Juist antwoord: ${correctAnswer}`}
        </p>
      )}
    </div>
  );
}

export function JapaneseCourseSection() {
  const levels = getLevels();
  const [selectedLevel, setSelectedLevel] = useState<JudoLevel | null>(null);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');

  if (selectedLevel) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedLevel(null)}
          className="inline-flex items-center gap-2 text-[#a90000] hover:text-[#8c0000] font-semibold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug naar modules
        </button>

        {/* Mode selector */}
        <div className="flex bg-[#f5f5f0] rounded-xl p-1">
          <button
            onClick={() => setMode('learn')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${
              mode === 'learn'
                ? 'bg-[#a90000] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Leren
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${
              mode === 'quiz'
                ? 'bg-[#a90000] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Quiz
          </button>
        </div>

        {mode === 'learn' ? (
          <div className="space-y-4">
            <Flashcard
              term={selectedLevel.terms[0]}
              onFlip={() => {}}
            />
            <p className="text-center text-xs text-gray-400">
              1 / {selectedLevel.terms.length}
            </p>
          </div>
        ) : (
          <QuizMode level={selectedLevel} />
        )}
      </div>
    );
  }

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
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Cursus Japans</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">
          Examentrainer voor de Japanse judo-terminologie
        </p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Module Grid */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#8c0000] mb-4">Kies een module</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level)}
              className="group bg-white rounded-2xl shadow-sm border-b-4 hover:shadow-md transition-all hover:-translate-y-1 text-left"
              style={{ borderColor: level.borderColor, borderWidth: '1px 1px 4px 1px' }}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-[#a90000] transition-colors">
                  {level.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {level.terms.length} termen
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#fdf6f6] rounded-2xl p-4 sm:p-5 border border-[#e8eaed]">
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-center">
          <strong>Ontwikkeld door AI Report</strong> — Een interactieve examentrainer voor de Japanse judo-terminologie.
          Leer de termen voor elke band en test je kennis met de quiz-modus.
        </p>
      </div>
    </div>
  );
}
