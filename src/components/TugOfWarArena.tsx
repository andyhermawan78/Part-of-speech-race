import React from 'react';
import { Student } from '../types';
import { motion } from 'motion/react';
import { Edit2 } from 'lucide-react';

interface TugOfWarArenaProps {
  score1: number;
  score2: number;
  winScore: number;
  team1Students: Student[];
  team2Students: Student[];
  lastScorer: 1 | 2 | null;
  activeStudentIdx1: number;
  activeStudentIdx2: number;
  onStudentClick?: (student: Student) => void;
}

export const TugOfWarArena: React.FC<TugOfWarArenaProps> = ({
  score1,
  score2,
  winScore,
  team1Students,
  team2Students,
  lastScorer,
  activeStudentIdx1,
  activeStudentIdx2,
  onStudentClick,
}) => {
  // Calculate percentage along the track (50% is center)
  const scoreDiff = score1 - score2;
  const maxDiff = Math.max(1, winScore);
  const rawPct = 50 + (scoreDiff / maxDiff) * 44; // ranges from ~6% to 94%
  const progressPercent = Math.min(94, Math.max(6, Math.round(rawPct)));

  return (
    <div
      id="tug-of-war-arena"
      className="w-full bg-slate-900/80 rounded-2xl md:rounded-[32px] p-2 sm:p-2.5 md:p-3 2xl:p-4 border border-slate-800 flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4 shadow-xl select-none shrink-0"
    >
      {/* Team 1 Student Lineup */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
        <span className="text-lg sm:text-xl mr-0.5 hidden sm:inline">🚀</span>
        {team1Students.map((s, idx) => {
          const isActive = idx === activeStudentIdx1;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onStudentClick?.(s)}
              animate={{
                x: lastScorer === 1 ? [-2, 4, -1, 0] : 0,
                scale: isActive ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              title={`Click to rename ${s.name} (${s.correctAnswers} pts)`}
              className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer group hover:scale-105 ${
                isActive
                  ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <span className="text-base sm:text-lg 2xl:text-xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                {s.avatar}
              </span>
              <span className="text-[8px] sm:text-[9px] 2xl:text-[10px] font-bold text-cyan-200 truncate max-w-[26px] sm:max-w-[40px]">
                {s.name.split(' ')[0]}
              </span>
              {s.correctAnswers > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 text-[8px] 2xl:text-[9px] font-black rounded-full px-1 leading-none py-0.5 shadow-sm">
                  {s.correctAnswers}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Central High-Energy Sprint Progress Bar */}
      <div className="flex-grow h-8 sm:h-9 md:h-10 2xl:h-11 bg-slate-800 rounded-xl md:rounded-2xl relative overflow-hidden border border-slate-700/50 shadow-inner flex items-center min-w-[120px]">
        {/* Animated Gradient Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 via-cyan-400 to-fuchsia-400 transition-all duration-700 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Center Progress Text Overlay */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <span className="text-[9px] sm:text-[10px] 2xl:text-xs font-black uppercase tracking-[0.25em] text-white/80 mix-blend-overlay">
            Race Progress {progressPercent}%
          </span>
        </div>

        {/* Dynamic Center Bead Marker */}
        <motion.div
          animate={{
            left: `${progressPercent}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 20,
          }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 2xl:w-9 2xl:h-9 bg-white rounded-full flex items-center justify-center border-2 sm:border-3 border-slate-900 shadow-xl z-20"
        >
          <span className="text-xs sm:text-sm leading-none">
            {scoreDiff > 0 ? '🏁' : scoreDiff < 0 ? '🏁' : '⚡'}
          </span>
        </motion.div>
      </div>

      {/* Team 2 Student Lineup */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-10">
        {team2Students.map((s, idx) => {
          const isActive = idx === activeStudentIdx2;
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onStudentClick?.(s)}
              animate={{
                x: lastScorer === 2 ? [2, -4, 1, 0] : 0,
                scale: isActive ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              title={`Click to rename ${s.name} (${s.correctAnswers} pts)`}
              className={`relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer group hover:scale-105 ${
                isActive
                  ? 'bg-fuchsia-500/30 border-fuchsia-400 ring-2 ring-fuchsia-400/40 shadow-[0_0_10px_rgba(232,121,249,0.5)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-fuchsia-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <span className="text-base sm:text-lg 2xl:text-xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                {s.avatar}
              </span>
              <span className="text-[8px] sm:text-[9px] 2xl:text-[10px] font-bold text-fuchsia-200 truncate max-w-[26px] sm:max-w-[40px]">
                {s.name.split(' ')[0]}
              </span>
              {s.correctAnswers > 0 && (
                <span className="absolute -top-1 -right-1 bg-fuchsia-400 text-slate-950 text-[8px] 2xl:text-[9px] font-black rounded-full px-1 leading-none py-0.5 shadow-sm">
                  {s.correctAnswers}
                </span>
              )}
            </motion.button>
          );
        })}
        <span className="text-lg sm:text-xl ml-0.5 hidden sm:inline">🤖</span>
      </div>
    </div>
  );
};

