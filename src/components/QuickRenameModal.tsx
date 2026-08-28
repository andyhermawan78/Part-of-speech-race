import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { X, Check, Sparkles, Users } from 'lucide-react';

interface QuickRenameModalProps {
  student: Student | null;
  isOpen: boolean;
  team1Name?: string;
  team2Name?: string;
  onClose: () => void;
  onSave: (studentId: string, newName: string, newAvatar: string) => void;
  onOpenFullRoster: () => void;
}

const AVATAR_OPTIONS = [
  '🚀', '⚡', '🦁', '🌟', '🦅', '🤖', '🔥', '🦄', '🐯', '💎',
  '🦊', '🐼', '🐲', '🧙‍♂️', '👾', '🌈', '🎯', '🎸', '🛸', '🏆',
  '🐆', '🦖', '🐬', '🦸‍♀️', '🦸‍♂️', '🌪️', '⚔️', '🏎️', '🎮', '💡'
];

export const QuickRenameModal: React.FC<QuickRenameModalProps> = ({
  student,
  isOpen,
  team1Name = 'Team Alpha',
  team2Name = 'Team Omega',
  onClose,
  onSave,
  onOpenFullRoster,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🚀');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student && isOpen) {
      setName(student.name);
      setAvatar(student.avatar);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const isTeam1 = student.team === 1;
  const teamLabel = isTeam1 ? team1Name : team2Name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(student.id, name.trim(), avatar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div
        id="quick-rename-modal"
        className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-[32px] p-6 shadow-2xl overflow-hidden flex flex-col text-white animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isTeam1 ? '🟦' : '🟪'}</span>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                {teamLabel} Player
              </h3>
              <p className="text-xs text-slate-400">Enter your name to join the race</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Avatar selector row */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Choose Player Avatar
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-950/70 rounded-2xl border border-slate-800 max-h-24 overflow-y-auto">
              {AVATAR_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setAvatar(em)}
                  className={`text-2xl p-1.5 rounded-xl border transition-all cursor-pointer ${
                    avatar === em
                      ? isTeam1
                        ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400/50 scale-110'
                        : 'bg-fuchsia-500/30 border-fuchsia-400 ring-2 ring-fuchsia-400/50 scale-110'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Player Name
            </label>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                {avatar}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name here..."
                maxLength={20}
                className={`w-full h-12 bg-slate-950 px-4 rounded-2xl text-base font-bold text-white focus:outline-none border-2 transition-all ${
                  isTeam1
                    ? 'focus:border-cyan-400 border-slate-800'
                    : 'focus:border-fuchsia-400 border-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 mt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullRoster();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Open All 10 Players</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-md cursor-pointer ${
                  isTeam1
                    ? 'bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.4)]'
                    : 'bg-fuchsia-400 hover:bg-fuchsia-300 shadow-[0_0_16px_rgba(232,121,249,0.4)]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
