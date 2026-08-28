import React from 'react';
import { Student, GameSettings } from '../types';
import { Flame, Edit2 } from 'lucide-react';

interface ScoreBoardProps {
  score1: number;
  score2: number;
  winScore: number;
  team1Name?: string;
  team2Name?: string;
  team1Count?: number;
  team2Count?: number;
  activeStudentT1?: Student;
  activeStudentT2?: Student;
  settings: GameSettings;
  streak1: number;
  streak2: number;
  onStudentClick?: (student: Student) => void;
  onOpenRoster?: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score1,
  score2,
  winScore,
  team1Name = 'Team Alpha',
  team2Name = 'Team Omega',
  team1Count = 5,
  team2Count = 5,
  activeStudentT1,
  activeStudentT2,
  settings,
  streak1,
  streak2,
  onStudentClick,
  onOpenRoster,
}) => {
  const pct1 = Math.min(100, Math.round((score1 / Math.max(1, winScore)) * 100));
  const pct2 = Math.min(100, Math.round((score2 / Math.max(1, winScore)) * 100));

  return (
    <section className="w-full grid grid-cols-12 gap-2 md:gap-4 select-none shrink-0" id="scoreboard-header">
      {/* Team 1 / Cyan Score Card */}
      <div
        id="team1-score-card"
        className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-between p-2.5 sm:p-3 md:p-4 2xl:p-5 bg-cyan-600/10 rounded-2xl md:rounded-[32px] border-2 border-cyan-500/30 relative overflow-hidden group shadow-md shadow-cyan-950/20"
      >
        <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <span className="text-5xl md:text-7xl 2xl:text-8xl font-black italic">01</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 md:gap-2.5">
              <span className="text-xl md:text-2xl">🟦</span>
              <button
                type="button"
                onClick={onOpenRoster}
                title="Click to edit team name or lineup"
                className="text-lg md:text-2xl 2xl:text-3xl font-black italic tracking-tighter text-cyan-400 uppercase hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <span>{team1Name}</span>
                <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
              </button>
            </div>
            {streak1 >= 2 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] 2xl:text-xs font-black border border-amber-400/40 animate-bounce">
                <Flame className="w-3 h-3 text-amber-400" /> {streak1}x STREAK
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenRoster}
              className="text-cyan-200/60 hover:text-cyan-300 text-[11px] md:text-xs 2xl:text-sm font-medium transition-colors cursor-pointer"
            >
              {team1Count} {team1Count === 1 ? 'Player' : 'Players'} Ready •
            </button>
            {settings.rotationMode === 'turn_based' && activeStudentT1 && (
              <button
                type="button"
                onClick={() => onStudentClick?.(activeStudentT1)}
                title={`Click to rename ${activeStudentT1.name}`}
                className="text-[10px] md:text-xs text-cyan-300 font-bold px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-full border border-cyan-400/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <span>{activeStudentT1.avatar}</span>
                <span className="truncate max-w-[80px] sm:max-w-[110px]">{activeStudentT1.name}</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-cyan-200 bg-cyan-400/20 px-1 rounded">Turn</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 sm:mt-3 relative z-10">
          <div className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black text-white tabular-nums mb-1.5 leading-none">
            {score1.toString().padStart(2, '0')}
          </div>
          <div className="h-2 sm:h-2.5 2xl:h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-cyan-900/50">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-500"
              style={{ width: `${pct1}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Target & VS on Large Screens */}
      <div
        id="scoreboard-center-badge"
        className="hidden lg:flex col-span-2 flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl md:rounded-[32px] p-2 sm:p-3 text-center shadow-lg"
      >
        <div className="bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-amber-400 font-black text-[10px] 2xl:text-xs uppercase tracking-widest mb-1 shadow-inner">
          Target Goal
        </div>
        <div className="text-2xl 2xl:text-3xl font-black text-amber-400 font-mono tracking-tight">
          {winScore} <span className="text-xs font-bold text-slate-400">pts</span>
        </div>
        <div className="mt-1 text-[9px] 2xl:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">
          <span className="text-cyan-400">⚡</span>
          <span>{team1Count}v{team2Count} MATCH</span>
          <span className="text-fuchsia-400">⚡</span>
        </div>
      </div>

      {/* Team 2 / Fuchsia Score Card */}
      <div
        id="team2-score-card"
        className="col-span-12 sm:col-span-6 lg:col-span-5 flex flex-col justify-between p-2.5 sm:p-3 md:p-4 2xl:p-5 bg-fuchsia-600/10 rounded-2xl md:rounded-[32px] border-2 border-fuchsia-500/30 text-right relative overflow-hidden group shadow-md shadow-fuchsia-950/20"
      >
        <div className="absolute top-0 left-0 p-2 md:p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <span className="text-5xl md:text-7xl 2xl:text-8xl font-black italic">02</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-1">
            {streak2 >= 2 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] 2xl:text-xs font-black border border-amber-400/40 animate-bounce">
                <Flame className="w-3 h-3 text-amber-400" /> {streak2}x STREAK
              </span>
            ) : <span />}
            <div className="flex items-center gap-1.5 md:gap-2.5 justify-end">
              <button
                type="button"
                onClick={onOpenRoster}
                title="Click to edit team name or lineup"
                className="text-lg md:text-2xl 2xl:text-3xl font-black italic tracking-tighter text-fuchsia-400 uppercase hover:text-fuchsia-300 transition-colors flex items-center gap-1.5 cursor-pointer text-right"
              >
                <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                <span>{team2Name}</span>
              </button>
              <span className="text-xl md:text-2xl">🟪</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {settings.rotationMode === 'turn_based' && activeStudentT2 && (
              <button
                type="button"
                onClick={() => onStudentClick?.(activeStudentT2)}
                title={`Click to rename ${activeStudentT2.name}`}
                className="text-[10px] md:text-xs text-fuchsia-300 font-bold px-2 py-0.5 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 rounded-full border border-fuchsia-400/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
              >
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-fuchsia-200 bg-fuchsia-400/20 px-1 rounded">Turn</span>
                <span className="truncate max-w-[80px] sm:max-w-[110px]">{activeStudentT2.name}</span>
                <span>{activeStudentT2.avatar}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenRoster}
              className="text-fuchsia-200/60 hover:text-fuchsia-300 text-[11px] md:text-xs 2xl:text-sm font-medium transition-colors cursor-pointer"
            >
              • {team2Count} {team2Count === 1 ? 'Player' : 'Players'} Ready
            </button>
          </div>
        </div>

        <div className="mt-2 sm:mt-3 relative z-10">
          <div className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-black text-white tabular-nums mb-1.5 leading-none">
            {score2.toString().padStart(2, '0')}
          </div>
          <div className="h-2 sm:h-2.5 2xl:h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-fuchsia-900/50">
            <div
              className="h-full ml-auto bg-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.5)] transition-all duration-500"
              style={{ width: `${pct2}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
