import React, { useState } from 'react';
import { Student, GameSettings } from '../types';
import { motion } from 'motion/react';
import {
  Play,
  Users,
  Sliders,
  BookOpen,
  Sparkles,
  Trophy,
  Zap,
  Swords,
  Edit2,
  Volume2,
  VolumeX,
  Check,
  Plus,
} from 'lucide-react';

interface OpeningScreenProps {
  students: Student[];
  settings: GameSettings;
  team1Name: string;
  team2Name: string;
  onUpdateTeamNames: (t1: string, t2: string) => void;
  onSetQuickSize: (sizePerTeam: number) => void;
  onStartGame: () => void;
  onOpenRoster: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onQuickRenameStudent: (student: Student) => void;
  onToggleSound: () => void;
  totalWords: number;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  students,
  settings,
  team1Name,
  team2Name,
  onUpdateTeamNames,
  onSetQuickSize,
  onStartGame,
  onOpenRoster,
  onOpenSettings,
  onOpenGuide,
  onQuickRenameStudent,
  onToggleSound,
  totalWords,
}) => {
  const team1 = students.filter((s) => s.team === 1);
  const team2 = students.filter((s) => s.team === 2);

  const [editingTeam1, setEditingTeam1] = useState(false);
  const [editingTeam2, setEditingTeam2] = useState(false);
  const [t1Input, setT1Input] = useState(team1Name);
  const [t2Input, setT2Input] = useState(team2Name);

  React.useEffect(() => {
    setT1Input(team1Name);
    setT2Input(team2Name);
  }, [team1Name, team2Name]);

  const handleSaveTeam1 = () => {
    if (t1Input.trim()) {
      onUpdateTeamNames(t1Input.trim(), team2Name);
    }
    setEditingTeam1(false);
  };

  const handleSaveTeam2 = () => {
    if (t2Input.trim()) {
      onUpdateTeamNames(team1Name, t2Input.trim());
    }
    setEditingTeam2(false);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4 z-10">
      {/* Top Header bar with sound toggle */}
      <div className="w-full flex justify-between items-center mb-1">
        {/* Match size quick switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/90 rounded-full border border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 pl-2 pr-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" />
            Size:
          </span>
          {[
            { label: '1v1', size: 1 },
            { label: '2v2', size: 2 },
            { label: '3v3', size: 3 },
            { label: '4v4', size: 4 },
            { label: '5v5', size: 5 },
          ].map((preset) => {
            const isActive = team1.length === preset.size && team2.length === preset.size;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSetQuickSize(preset.size)}
                className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Sound toggle button */}
        <button
          type="button"
          onClick={onToggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          {settings.soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Sound OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Main Hero Title Box */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full text-center mb-3 sm:mb-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)] mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive {team1.length}v{team2.length} Classroom Tug-of-War Battle</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Parts of Speech Race
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto">
          Fast-paced grammar tug-of-war! Buzz in, classify nouns, verbs, adjectives & more, and pull the rope to victory.
        </p>
      </motion.div>

      {/* Primary Action Buttons Bar (Name Input & Settings & Start) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-5"
      >
        {/* START RACE / START GAME BUTTON */}
        <motion.button
          type="button"
          id="btn-start-game-lobby"
          onClick={onStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="w-full sm:w-auto px-10 py-3.5 sm:py-4 rounded-full font-black text-base sm:text-lg uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.5)] border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3 cursor-pointer transition-all"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
          <span>Start Race</span>
        </motion.button>

        {/* INPUT STUDENT NAMES BUTTON */}
        <motion.button
          type="button"
          id="btn-open-names-lobby"
          onClick={onOpenRoster}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto px-5 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-cyan-300 border-2 border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          <span>Lineup ({students.length} Players)</span>
        </motion.button>

        {/* GAME SETTINGS BUTTON */}
        <motion.button
          type="button"
          id="btn-open-settings-lobby"
          onClick={onOpenSettings}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto px-5 py-3.5 sm:py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-fuchsia-300 border-2 border-fuchsia-500/50 hover:border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
          <span>Settings</span>
        </motion.button>

        {/* GRAMMAR GUIDE BUTTON */}
        <motion.button
          type="button"
          id="btn-open-guide-lobby"
          onClick={onOpenGuide}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto px-4 py-3.5 sm:py-4 rounded-full font-bold text-xs uppercase tracking-wider bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>How to Play</span>
        </motion.button>
      </motion.div>

      {/* Team Roster Lineup Cards Preview with Editable Team Names */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
      >
        {/* TEAM 1 (CYAN) */}
        <div className="bg-slate-900/80 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-2xl shrink-0">🟦</span>
              {editingTeam1 ? (
                <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                  <input
                    type="text"
                    value={t1Input}
                    onChange={(e) => setT1Input(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTeam1()}
                    autoFocus
                    maxLength={20}
                    className="bg-slate-950 px-2 py-1 rounded-lg text-sm font-black text-cyan-300 uppercase border border-cyan-400 focus:outline-none w-full"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTeam1}
                    className="p-1 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setEditingTeam1(true)}>
                  <div>
                    <h2 className="text-base font-black text-cyan-300 uppercase tracking-tight flex items-center gap-1.5">
                      <span>{team1Name}</span>
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-300 transition-colors" />
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-cyan-200/70 font-semibold">
                      Keys: Q, W, E, R / A, S, D, F • {team1.length} {team1.length === 1 ? 'Player' : 'Players'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenRoster}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1 rounded-full border border-cyan-400/30 cursor-pointer transition-all shrink-0"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Lineup</span>
            </button>
          </div>

          <div
            className={`grid gap-2 ${
              team1.length === 1
                ? 'grid-cols-1 max-w-[140px] mx-auto'
                : team1.length === 2
                ? 'grid-cols-2'
                : team1.length === 3
                ? 'grid-cols-3'
                : team1.length === 4
                ? 'grid-cols-4'
                : 'grid-cols-5'
            }`}
          >
            {team1.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onQuickRenameStudent(s)}
                title={`Click to rename ${s.name}`}
                className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/60 hover:bg-cyan-950/30 transition-all cursor-pointer hover:scale-105"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{s.avatar}</span>
                <span className="text-[11px] font-bold text-cyan-100 truncate w-full text-center">
                  {s.name}
                </span>
                <span className="text-[9px] text-cyan-400/70 font-mono mt-0.5">#{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TEAM 2 (FUCHSIA) */}
        <div className="bg-slate-900/80 border-2 border-fuchsia-500/40 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-3 border-b border-fuchsia-500/20 mb-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-2xl shrink-0">🟪</span>
              {editingTeam2 ? (
                <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                  <input
                    type="text"
                    value={t2Input}
                    onChange={(e) => setT2Input(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTeam2()}
                    autoFocus
                    maxLength={20}
                    className="bg-slate-950 px-2 py-1 rounded-lg text-sm font-black text-fuchsia-300 uppercase border border-fuchsia-400 focus:outline-none w-full"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTeam2}
                    className="p-1 rounded-lg bg-fuchsia-400 text-slate-950 font-bold hover:bg-fuchsia-300 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setEditingTeam2(true)}>
                  <div>
                    <h2 className="text-base font-black text-fuchsia-300 uppercase tracking-tight flex items-center gap-1.5">
                      <span>{team2Name}</span>
                      <Edit2 className="w-3.5 h-3.5 text-fuchsia-400/60 group-hover:text-fuchsia-300 transition-colors" />
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-fuchsia-200/70 font-semibold">
                      Keys: U, I, O, P / J, K, L, ; • {team2.length} {team2.length === 1 ? 'Player' : 'Players'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onOpenRoster}
              className="text-xs font-bold text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-1 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 px-3 py-1 rounded-full border border-fuchsia-400/30 cursor-pointer transition-all shrink-0"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Lineup</span>
            </button>
          </div>

          <div
            className={`grid gap-2 ${
              team2.length === 1
                ? 'grid-cols-1 max-w-[140px] mx-auto'
                : team2.length === 2
                ? 'grid-cols-2'
                : team2.length === 3
                ? 'grid-cols-3'
                : team2.length === 4
                ? 'grid-cols-4'
                : 'grid-cols-5'
            }`}
          >
            {team2.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onQuickRenameStudent(s)}
                title={`Click to rename ${s.name}`}
                className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-fuchsia-400/60 hover:bg-fuchsia-950/30 transition-all cursor-pointer hover:scale-105"
              >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{s.avatar}</span>
                <span className="text-[11px] font-bold text-fuchsia-100 truncate w-full text-center">
                  {s.name}
                </span>
                <span className="text-[9px] text-fuchsia-400/70 font-mono mt-0.5">#{idx + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Match Config summary chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full flex flex-wrap items-center justify-center gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs text-slate-400 font-medium"
      >
        <span className="flex items-center gap-1.5 text-slate-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Goal: First to <strong>{settings.winScore} pts</strong></span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Difficulty: <strong className="capitalize">{settings.difficulty}</strong></span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <Swords className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>Categories: <strong>{settings.extendedPos ? '8 Parts of Speech' : '4 Core POS (Noun, Verb, Adj, Adv)'}</strong></span>
        </span>
        <span>•</span>
        <span className="text-slate-400">
          {totalWords} Words in Active Bank
        </span>
      </motion.div>
    </div>
  );
};
