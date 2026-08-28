import React, { useState } from 'react';
import { Student } from '../types';
import { X, Users, RotateCcw, Check, Sparkles, Clipboard, Dices, Edit3, Trash2, Plus, UserPlus } from 'lucide-react';

interface StudentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  team1Name: string;
  team2Name: string;
  onUpdateTeamNames: (t1: string, t2: string) => void;
  rotationMode: 'free' | 'turn_based';
  onChangeRotationMode: (mode: 'free' | 'turn_based') => void;
  initialSelectedStudentId?: string | null;
}

const AVATAR_OPTIONS = [
  '🚀', '⚡', '🦁', '🌟', '🦅', '🤖', '🔥', '🦄', '🐯', '💎',
  '🦊', '🐼', '🐲', '🧙‍♂️', '👾', '🌈', '🎯', '🎸', '🛸', '🏆',
  '🐆', '🦖', '🐬', '🦸‍♀️', '🦸‍♂️', '🌪️', '⚔️', '🏎️', '🎮', '💡'
];

const RANDOM_NAME_PRESETS = [
  ['Alex', 'Maya', 'Liam', 'Zoe', 'Noah', 'Emma', 'Lucas', 'Sophia', 'Ethan', 'Ava'],
  ['Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Sam', 'Avery', 'Skyler', 'Cameron', 'Dakota'],
  ['Leo', 'Chloe', 'Max', 'Luna', 'Oscar', 'Ruby', 'Felix', 'Bella', 'Milo', 'Daisy'],
  ['Cyber Fox', 'Laser Eagle', 'Turbo Lion', 'Pixel Bot', 'Sonic Star', 'Hyper Tiger', 'Shadow Wolf', 'Nova Phoenix', 'Plasma Bear', 'Quantum Hawk']
];

export const StudentRosterModal: React.FC<StudentRosterModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  team1Name,
  team2Name,
  onUpdateTeamNames,
  rotationMode,
  onChangeRotationMode,
}) => {
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [localTeam1Name, setLocalTeam1Name] = useState(team1Name);
  const [localTeam2Name, setLocalTeam2Name] = useState(team2Name);
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalStudents(students);
      setLocalTeam1Name(team1Name);
      setLocalTeam2Name(team2Name);
    }
  }, [isOpen, students, team1Name, team2Name]);

  if (!isOpen) return null;

  const team1 = localStudents.filter((s) => s.team === 1);
  const team2 = localStudents.filter((s) => s.team === 2);
  const totalPlayers = localStudents.length;

  const handleNameChange = (id: string, newName: string) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleAvatarSelect = (id: string, newAvatar: string) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, avatar: newAvatar } : s))
    );
    setEditingAvatarId(null);
  };

  const handleAddPlayer = (teamId: 1 | 2) => {
    const currentTeamStudents = localStudents.filter((s) => s.team === teamId);
    if (currentTeamStudents.length >= 8) return; // reasonable cap
    const newIdx = currentTeamStudents.length + 1;
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    const newStudent: Student = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `Player ${newIdx}`,
      team: teamId,
      avatar: randomAvatar,
      correctAnswers: 0,
    };
    setLocalStudents((prev) => [...prev, newStudent]);
  };

  const handleRemovePlayer = (id: string, teamId: 1 | 2) => {
    const currentTeamStudents = localStudents.filter((s) => s.team === teamId);
    if (currentTeamStudents.length <= 1) {
      // Keep at least 1 player per team
      return;
    }
    setLocalStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSetPresetSize = (countPerTeam: number) => {
    const defaultAvatarsT1 = ['🚀', '⚡', '🦁', '🌟', '🦅', '🔥', '🦊', '💎'];
    const defaultAvatarsT2 = ['🤖', '🔥', '🦄', '🐯', '💎', '🐲', '👾', '🌈'];
    const presetNames = RANDOM_NAME_PRESETS[0];

    const newT1: Student[] = [];
    const newT2: Student[] = [];

    for (let i = 0; i < countPerTeam; i++) {
      const existingT1 = team1[i];
      newT1.push(
        existingT1 || {
          id: `t1_${i + 1}`,
          name: presetNames[i] || `Player ${i + 1}`,
          team: 1,
          avatar: defaultAvatarsT1[i % defaultAvatarsT1.length],
          correctAnswers: 0,
        }
      );

      const existingT2 = team2[i];
      newT2.push(
        existingT2 || {
          id: `t2_${i + 1}`,
          name: presetNames[i + 5] || `Player ${i + 1 + countPerTeam}`,
          team: 2,
          avatar: defaultAvatarsT2[i % defaultAvatarsT2.length],
          correctAnswers: 0,
        }
      );
    }

    setLocalStudents([...newT1, ...newT2]);
  };

  const handleSave = () => {
    onUpdateStudents(localStudents);
    onUpdateTeamNames(
      localTeam1Name.trim() || 'Team Alpha',
      localTeam2Name.trim() || 'Team Omega'
    );
    onClose();
  };

  const handleApplyBulkNames = () => {
    const rawLines = bulkText
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (rawLines.length === 0) return;

    if (rawLines.length === 2) {
      // 1v1
      handleSetPresetSize(1);
      setTimeout(() => {
        setLocalStudents([
          { id: 't1_1', name: rawLines[0], team: 1, avatar: '🚀', correctAnswers: 0 },
          { id: 't2_1', name: rawLines[1], team: 2, avatar: '🤖', correctAnswers: 0 },
        ]);
      }, 10);
    } else {
      // Distribute evenly between Team 1 and Team 2
      const half = Math.ceil(rawLines.length / 2);
      const newT1Names = rawLines.slice(0, half);
      const newT2Names = rawLines.slice(half);

      const updatedT1: Student[] = newT1Names.map((name, idx) => ({
        id: team1[idx]?.id || `t1_${idx + 1}`,
        name,
        team: 1 as const,
        avatar: team1[idx]?.avatar || AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length],
        correctAnswers: team1[idx]?.correctAnswers || 0,
      }));

      const updatedT2: Student[] = newT2Names.map((name, idx) => ({
        id: team2[idx]?.id || `t2_${idx + 1}`,
        name,
        team: 2 as const,
        avatar: team2[idx]?.avatar || AVATAR_OPTIONS[(idx + 10) % AVATAR_OPTIONS.length],
        correctAnswers: team2[idx]?.correctAnswers || 0,
      }));

      setLocalStudents([...updatedT1, ...updatedT2]);
    }

    setIsBulkPasteOpen(false);
    setBulkText('');
  };

  const handleRandomizeNames = () => {
    const preset = RANDOM_NAME_PRESETS[Math.floor(Math.random() * RANDOM_NAME_PRESETS.length)];
    const half = Math.ceil(preset.length / 2);
    setLocalStudents((prev) => {
      let t1Count = 0;
      let t2Count = 0;
      return prev.map((s) => {
        if (s.team === 1) {
          const name = preset[t1Count % half] || `Student ${t1Count + 1}`;
          t1Count++;
          return { ...s, name };
        } else {
          const name = preset[half + (t2Count % (preset.length - half))] || `Student ${t2Count + 1}`;
          t2Count++;
          return { ...s, name };
        }
      });
    });
  };

  const handleClearAllNames = () => {
    setLocalStudents((prev) => {
      let t1Count = 0;
      let t2Count = 0;
      return prev.map((s) => {
        if (s.team === 1) {
          t1Count++;
          return { ...s, name: `Player ${t1Count}` };
        } else {
          t2Count++;
          return { ...s, name: `Player ${t2Count}` };
        }
      });
    });
  };

  const handleResetScores = () => {
    setLocalStudents((prev) => prev.map((s) => ({ ...s, correctAnswers: 0 })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div
        id="student-roster-modal"
        className="w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl md:rounded-[36px] p-3 sm:p-5 md:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>Team & Player Lineup ({totalPlayers} Players)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold normal-case">
                  {team1.length}v{team2.length} Match
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Customize team names, add or remove players (1v1, 2v2, 5v5), and edit avatars
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Size Presets Bar */}
        <div className="my-2.5 flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 bg-slate-950/70 rounded-2xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Match Size:
            </span>
            {[
              { label: '1v1 (2p)', size: 1 },
              { label: '2v2 (4p)', size: 2 },
              { label: '3v3 (6p)', size: 3 },
              { label: '4v4 (8p)', size: 4 },
              { label: '5v5 (10p)', size: 5 },
            ].map((p) => {
              const isActive = team1.length === p.size && team2.length === p.size;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSetPresetSize(p.size)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Turn-taking mode selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onChangeRotationMode('turn_based')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                rotationMode === 'turn_based'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1v1 Rotation
            </button>
            <button
              type="button"
              onClick={() => onChangeRotationMode('free')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                rotationMode === 'free'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Free Buzz
            </button>
          </div>
        </div>

        {/* Quick Tools Toolbar: Paste List, Randomize Names, Clear */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBulkPasteOpen(!isBulkPasteOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste Name List</span>
            </button>
            <button
              type="button"
              onClick={handleRandomizeNames}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Dices className="w-3 h-3" />
              <span>Randomize Names</span>
            </button>
            <button
              type="button"
              onClick={handleClearAllNames}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Default Names</span>
            </button>
          </div>
        </div>

        {/* Bulk Paste Box (Collapsible) */}
        {isBulkPasteOpen && (
          <div className="mb-2 p-3 bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-xl shrink-0">
            <label className="block text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
              Paste Student Names (one per line or comma-separated):
            </label>
            <textarea
              rows={2}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Emma, Liam, Noah, Olivia (will create 2v2 match)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
            <div className="flex items-center justify-end gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setIsBulkPasteOpen(false)}
                className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkNames}
                className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors shadow-md cursor-pointer"
              >
                Apply Names
              </button>
            </div>
          </div>
        )}

        {/* 2 Team Columns with Editable Team Names & Dynamic Player Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 my-1 flex-1">
          {/* Team 1 (Cyan / Left) Column */}
          <div className="p-3 sm:p-4 rounded-2xl md:rounded-3xl bg-cyan-950/20 border-2 border-cyan-500/30 flex flex-col gap-2 shadow-lg">
            {/* Team 1 Header with Editable Name */}
            <div className="flex flex-col gap-1.5 pb-2 border-b border-cyan-500/20">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl">🟦</span>
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-0.5">
                    Team 1 Name (Editable):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={localTeam1Name}
                      onChange={(e) => setLocalTeam1Name(e.target.value)}
                      placeholder="Team Alpha"
                      maxLength={24}
                      className="w-full bg-slate-900/90 border border-cyan-500/50 rounded-xl px-2.5 py-1 text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </div>
                </div>
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider bg-cyan-500/20 px-2 py-0.5 rounded-full shrink-0">
                  {team1.length} {team1.length === 1 ? 'Player' : 'Players'}
                </span>
              </div>
            </div>

            {/* Players List for Team 1 */}
            <div className="flex flex-col gap-1.5 flex-1">
              {team1.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => setEditingAvatarId(editingAvatarId === s.id ? null : s.id)}
                    title="Click to change avatar icon"
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg sm:text-xl bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 rounded-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    {s.avatar}
                  </button>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleNameChange(s.id, e.target.value)}
                      className="w-full bg-slate-800/80 px-2 py-0.5 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 border border-slate-700/60"
                      placeholder={`Player ${idx + 1}`}
                      maxLength={18}
                    />
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 px-0.5">
                      <span>Spot #{idx + 1}</span>
                      <span className="font-mono text-cyan-300">{s.correctAnswers} pts</span>
                    </div>
                  </div>
                  {team1.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(s.id, 1)}
                      title="Remove this player"
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-50 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Player button */}
            <button
              type="button"
              onClick={() => handleAddPlayer(1)}
              disabled={team1.length >= 8}
              className="mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Player to {localTeam1Name || 'Team 1'}</span>
            </button>
          </div>

          {/* Team 2 (Fuchsia / Right) Column */}
          <div className="p-3 sm:p-4 rounded-2xl md:rounded-3xl bg-fuchsia-950/20 border-2 border-fuchsia-500/30 flex flex-col gap-2 shadow-lg">
            {/* Team 2 Header with Editable Name */}
            <div className="flex flex-col gap-1.5 pb-2 border-b border-fuchsia-500/20">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl">🟪</span>
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-fuchsia-400 block mb-0.5">
                    Team 2 Name (Editable):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={localTeam2Name}
                      onChange={(e) => setLocalTeam2Name(e.target.value)}
                      placeholder="Team Omega"
                      maxLength={24}
                      className="w-full bg-slate-900/90 border border-fuchsia-500/50 rounded-xl px-2.5 py-1 text-xs sm:text-sm font-black text-fuchsia-300 uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    />
                    <Edit3 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                  </div>
                </div>
                <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider bg-fuchsia-500/20 px-2 py-0.5 rounded-full shrink-0">
                  {team2.length} {team2.length === 1 ? 'Player' : 'Players'}
                </span>
              </div>
            </div>

            {/* Players List for Team 2 */}
            <div className="flex flex-col gap-1.5 flex-1">
              {team2.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-fuchsia-500/50 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => setEditingAvatarId(editingAvatarId === s.id ? null : s.id)}
                    title="Click to change avatar icon"
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg sm:text-xl bg-slate-800 hover:bg-fuchsia-500/20 border border-slate-700 rounded-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    {s.avatar}
                  </button>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleNameChange(s.id, e.target.value)}
                      className="w-full bg-slate-800/80 px-2 py-0.5 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-400 border border-slate-700/60"
                      placeholder={`Player ${idx + 1}`}
                      maxLength={18}
                    />
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5 px-0.5">
                      <span>Spot #{idx + 1}</span>
                      <span className="font-mono text-fuchsia-300">{s.correctAnswers} pts</span>
                    </div>
                  </div>
                  {team2.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(s.id, 2)}
                      title="Remove this player"
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-50 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Player button */}
            <button
              type="button"
              onClick={() => handleAddPlayer(2)}
              disabled={team2.length >= 8}
              className="mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-500/15 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Player to {localTeam2Name || 'Team 2'}</span>
            </button>
          </div>
        </div>

        {/* Avatar Picker popover */}
        {editingAvatarId && (
          <div className="p-3 bg-slate-950 border-2 border-cyan-500/40 rounded-2xl my-1 shadow-2xl shrink-0">
            <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Choose an Avatar:
              </span>
              <button
                type="button"
                onClick={() => setEditingAvatarId(null)}
                className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleAvatarSelect(editingAvatarId, em)}
                  className="text-xl p-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500/30 border border-slate-800 hover:border-cyan-400 transition-transform active:scale-95 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-1 shrink-0">
          <button
            type="button"
            onClick={handleResetScores}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Individual Scores</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 hover:from-cyan-400 hover:to-cyan-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


