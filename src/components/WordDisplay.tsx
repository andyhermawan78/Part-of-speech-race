import React from 'react';
import { WordItem, PosType } from '../types';
import { POS_DEFINITIONS } from '../data/words';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, ArrowRight, SkipForward } from 'lucide-react';

interface WordDisplayProps {
  wordItem: WordItem | null;
  showSentence: boolean;
  isAnswered: boolean;
  correctPos: PosType | null;
  lastScorer?: 1 | 2 | null;
  scorerName?: string;
  onSpeak?: (text: string) => void;
  onNextQuestion: () => void;
  hasWinner?: boolean;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  wordItem,
  showSentence,
  isAnswered,
  correctPos,
  lastScorer,
  scorerName,
  onSpeak,
  onNextQuestion,
  hasWinner,
}) => {
  if (!wordItem) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-[36px] md:rounded-[50px] p-8 text-center my-2 shadow-2xl">
        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading next sprint challenge...</span>
      </div>
    );
  }

  const posDef = correctPos ? POS_DEFINITIONS[correctPos] : null;

  return (
    <div
      id="word-display-card"
      className="relative w-full bg-slate-900/90 rounded-2xl md:rounded-[36px] 2xl:rounded-[48px] border border-slate-800 p-2.5 sm:p-3.5 md:p-4 2xl:p-6 flex flex-col items-center justify-center shadow-xl overflow-hidden text-center select-none shrink-0"
    >
      {/* Top ambient cyan accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent pointer-events-none" />

      {/* Meta Bar: Target pill tag, sound & skip */}
      <div className="w-full flex items-center justify-between gap-2 mb-1 px-1 z-10">
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] sm:text-[10px] 2xl:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              wordItem.difficulty === 'elementary'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : wordItem.difficulty === 'intermediate'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
            }`}
          >
            {wordItem.difficulty}
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Grammar Sprint
          </span>
        </div>

        <div className="bg-slate-800/60 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 border border-slate-700/50">
          Target Word
        </div>

        <div className="flex items-center gap-1">
          {onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(wordItem.word)}
              title="Pronounce word"
              className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            </button>
          )}
          {!isAnswered && !hasWinner && (
            <button
              type="button"
              onClick={onNextQuestion}
              title="Skip to next word"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer ml-1"
            >
              <SkipForward className="w-3 h-3" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Target Word with entrance animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wordItem.id}
          initial={{ opacity: 0, scale: 0.88, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.2 }}
          className="my-1 sm:my-1.5 md:my-2.5 2xl:my-4 z-10"
        >
          <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]">
            {wordItem.word}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Optional Context Sentence Clue */}
      {showSentence && wordItem.sentence && (
        <div className="mt-0.5 bg-cyan-500/10 px-3 sm:px-5 py-1 sm:py-1.5 rounded-xl border border-cyan-500/20 text-cyan-300 text-[11px] sm:text-xs 2xl:text-sm italic font-medium max-w-xl mx-auto shadow-inner z-10">
          "{wordItem.sentence.replace('__', wordItem.word)}"
        </div>
      )}

      {/* Explanation & Manual Next Question Bar when answered */}
      <AnimatePresence>
        {isAnswered && posDef && !hasWinner && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 pt-2 border-t border-slate-800/80 w-full flex flex-col items-center justify-center gap-2 z-10"
          >
            {/* Scorer and Grammar Explanation */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs 2xl:text-sm text-slate-300">
              {lastScorer ? (
                <span
                  className={`font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-slate-950 shadow-md ${
                    lastScorer === 1 ? 'bg-cyan-400' : 'bg-fuchsia-400'
                  }`}
                >
                  +{scorerName ? `${scorerName} Scored!` : lastScorer === 1 ? 'Team Alpha Scored!' : 'Team Omega Scored!'}
                </span>
              ) : (
                <span className="font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-rose-200 bg-rose-950/80 border border-rose-600 shadow-md">
                  Missed by Both (0 pts)
                </span>
              )}
              <span className="font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-white shadow-sm">
                <span>{posDef.emoji}</span>
                <span className={posDef.color}>{posDef.label}</span>
              </span>
              <span className="text-slate-300 font-medium">{posDef.description}</span>
            </div>

            {/* Prominent Next Question Proceed Button */}
            <motion.button
              type="button"
              id="btn-next-question"
              onClick={onNextQuestion}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="mt-0.5 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm 2xl:text-base uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] border-b-2 border-amber-600 active:border-b-0 active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
              <kbd className="hidden md:inline-block ml-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950 font-black">
                SPACE / ENTER
              </kbd>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

