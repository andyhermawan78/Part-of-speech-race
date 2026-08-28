import React from 'react';
import { PosType, TeamId } from '../types';
import { POS_DEFINITIONS, CORE_POS, ALL_POS } from '../data/words';
import { motion } from 'motion/react';

interface AnswerPadProps {
  extendedPos: boolean;
  disabledTeam1: boolean;
  disabledTeam2: boolean;
  isLocked: boolean;
  team1Name?: string;
  team2Name?: string;
  lastAttemptT1: { pos: PosType; correct: boolean } | null;
  lastAttemptT2: { pos: PosType; correct: boolean } | null;
  onAnswer: (pos: PosType, team: TeamId) => void;
}

export const AnswerPad: React.FC<AnswerPadProps> = ({
  extendedPos,
  disabledTeam1,
  disabledTeam2,
  isLocked,
  team1Name = 'Team Alpha',
  team2Name = 'Team Omega',
  lastAttemptT1,
  lastAttemptT2,
  onAnswer,
}) => {
  const activePosList = extendedPos ? ALL_POS : CORE_POS;

  return (
    <div id="dual-answer-pad" className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 shrink-0">
      {/* ================= TEAM 1 COLUMN ================= */}
      <section
        id="team1-answer-column"
        aria-label={`${team1Name} Answer Column`}
        className={`flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-2.5 md:p-3 2xl:p-4 rounded-2xl md:rounded-[28px] border-2 transition-all duration-200 ${
          disabledTeam1
            ? 'bg-slate-950/40 border-slate-800 opacity-60'
            : 'bg-cyan-950/15 border-cyan-500/30 shadow-md shadow-cyan-950/20'
        }`}
      >
        <div className="flex items-center justify-between px-1 pb-1 border-b border-cyan-500/20">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🟦</span>
            <span className="text-xs 2xl:text-sm font-black uppercase tracking-wider text-cyan-400">
              {team1Name} Buzzer
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {disabledTeam1 && !isLocked && (
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-600 text-rose-300 animate-pulse">
                Answer Used (1/1)
              </span>
            )}
            <span className="text-[9px] 2xl:text-[10px] text-cyan-300 font-mono hidden sm:inline font-bold">
              Keys: {extendedPos ? 'Q W E R A S D F' : 'Q · W · E · R'}
            </span>
          </div>
        </div>

        {/* Answer Buttons Grid */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 2xl:gap-2.5">
          {activePosList.map((pos) => {
            const meta = POS_DEFINITIONS[pos];
            const isThisAttempt = lastAttemptT1?.pos === pos;
            const isCorrect = isThisAttempt && lastAttemptT1?.correct;
            const isWrong = isThisAttempt && !lastAttemptT1?.correct;

            return (
              <motion.button
                key={`t1-${pos}`}
                type="button"
                id={`btn-t1-${pos}`}
                whileTap={{ scale: 0.95 }}
                animate={
                  isWrong
                    ? { x: [-4, 4, -4, 4, 0] }
                    : isCorrect
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                disabled={disabledTeam1 || isLocked}
                onClick={() => onAnswer(pos, 1)}
                className={`relative h-10 sm:h-12 md:h-12 2xl:h-14 flex items-center justify-between px-2.5 sm:px-3 2xl:px-4 rounded-xl md:rounded-2xl font-black text-xs sm:text-sm md:text-base 2xl:text-lg tracking-wider uppercase transition-all duration-100 select-none cursor-pointer disabled:cursor-not-allowed shadow-md ${
                  isCorrect
                    ? 'bg-cyan-500 text-slate-950 border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105'
                    : isWrong
                    ? 'bg-rose-900 text-rose-200 border-2 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-slate-900 text-white hover:bg-cyan-600 hover:text-white border-2 border-cyan-500/50'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base 2xl:text-lg">{meta.emoji}</span>
                  <span className="truncate">{meta.label}</span>
                </div>
                <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800/80 border border-cyan-500/40 text-cyan-300">
                  {meta.shortcutTeam1}
                </kbd>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ================= TEAM 2 COLUMN ================= */}
      <section
        id="team2-answer-column"
        aria-label={`${team2Name} Answer Column`}
        className={`flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-2.5 md:p-3 2xl:p-4 rounded-2xl md:rounded-[28px] border-2 transition-all duration-200 ${
          disabledTeam2
            ? 'bg-slate-950/40 border-slate-800 opacity-60'
            : 'bg-fuchsia-950/15 border-fuchsia-500/30 shadow-md shadow-fuchsia-950/20'
        }`}
      >
        <div className="flex items-center justify-between px-1 pb-1 border-b border-fuchsia-500/20">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🟪</span>
            <span className="text-xs 2xl:text-sm font-black uppercase tracking-wider text-fuchsia-400">
              {team2Name} Buzzer
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {disabledTeam2 && !isLocked && (
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-600 text-rose-300 animate-pulse">
                Answer Used (1/1)
              </span>
            )}
            <span className="text-[9px] 2xl:text-[10px] text-fuchsia-300 font-mono hidden sm:inline font-bold">
              Keys: {extendedPos ? 'U I O P J K L ;' : 'U · I · O · P'}
            </span>
          </div>
        </div>

        {/* Answer Buttons Grid */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 2xl:gap-2.5">
          {activePosList.map((pos) => {
            const meta = POS_DEFINITIONS[pos];
            const isThisAttempt = lastAttemptT2?.pos === pos;
            const isCorrect = isThisAttempt && lastAttemptT2?.correct;
            const isWrong = isThisAttempt && !lastAttemptT2?.correct;

            return (
              <motion.button
                key={`t2-${pos}`}
                type="button"
                id={`btn-t2-${pos}`}
                whileTap={{ scale: 0.95 }}
                animate={
                  isWrong
                    ? { x: [-4, 4, -4, 4, 0] }
                    : isCorrect
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                disabled={disabledTeam2 || isLocked}
                onClick={() => onAnswer(pos, 2)}
                className={`relative h-10 sm:h-12 md:h-12 2xl:h-14 flex items-center justify-between px-2.5 sm:px-3 2xl:px-4 rounded-xl md:rounded-2xl font-black text-xs sm:text-sm md:text-base 2xl:text-lg tracking-wider uppercase transition-all duration-100 select-none cursor-pointer disabled:cursor-not-allowed shadow-md ${
                  isCorrect
                    ? 'bg-fuchsia-500 text-slate-950 border-2 border-white shadow-[0_0_15px_rgba(217,70,239,0.5)] scale-105'
                    : isWrong
                    ? 'bg-rose-900 text-rose-200 border-2 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-slate-900 text-white hover:bg-fuchsia-600 hover:text-white border-2 border-fuchsia-500/50'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base 2xl:text-lg">{meta.emoji}</span>
                  <span className="truncate">{meta.label}</span>
                </div>
                <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800/80 border border-fuchsia-500/40 text-fuchsia-300">
                  {meta.shortcutTeam2}
                </kbd>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

