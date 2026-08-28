import React, { useState } from 'react';
import { GameSettings, WordItem, PosType } from '../types';
import { X, Sliders, Volume2, VolumeX, Check, BookOpen, Clock, Trophy, Plus, Trash2 } from 'lucide-react';
import { ALL_POS } from '../data/words';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  customWords: WordItem[];
  onUpdateCustomWords: (words: WordItem[]) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  customWords,
  onUpdateCustomWords,
}) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [activeTab, setActiveTab] = useState<'match' | 'custom_words'>('match');

  // Custom word input states
  const [newWord, setNewWord] = useState('');
  const [newPos, setNewPos] = useState<PosType>('noun');
  const [newSentence, setNewSentence] = useState('');

  if (!isOpen) return null;

  const handleAddCustomWord = () => {
    if (!newWord.trim()) return;
    const item: WordItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      word: newWord.trim().toLowerCase(),
      pos: newPos,
      sentence: newSentence.trim() ? newSentence.trim() : undefined,
      difficulty: 'elementary',
    };
    onUpdateCustomWords([...customWords, item]);
    setNewWord('');
    setNewSentence('');
  };

  const handleDeleteCustomWord = (id: string) => {
    onUpdateCustomWords(customWords.filter((w) => w.id !== id));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        id="game-settings-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">Match & Grammar Rules</h2>
              <p className="text-xs text-slate-400">Configure target score, difficulty grade, and word lists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 my-4 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('match')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'match'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚙️ Match Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom_words')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'custom_words'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✏️ Teacher Word Bank ({customWords.length})
          </button>
        </div>

        {activeTab === 'match' ? (
          <div className="overflow-y-auto pr-1 my-2 flex-1 flex flex-col gap-4">
            {/* Target Score */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Goal / Winning Score:
                </span>
                <span className="text-xs font-extrabold text-amber-400 font-mono">
                  {localSettings.winScore} Points
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 7, 10, 15].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setLocalSettings((prev) => ({ ...prev, winScore: pts }))}
                    className={`py-2 rounded-xl text-xs font-black border transition-all ${
                      localSettings.winScore === pts
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {pts} pts
                  </button>
                ))}
              </div>
            </div>

            {/* Grammar Difficulty */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Grade / Difficulty Level:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'Mixed / All' },
                  { id: 'elementary', label: 'Elementary' },
                  { id: 'intermediate', label: 'Middle School' },
                  { id: 'advanced', label: 'Advanced' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        difficulty: diff.id as GameSettings['difficulty'],
                      }))
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                      localSettings.difficulty === diff.id
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Core vs 8 Extended POS */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">8 Parts of Speech Mode:</span>
                <span className="text-[11px] text-slate-400">
                  Adds Pronoun, Preposition, Conjunction, and Interjection alongside Noun, Verb, Adj, Adv
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({ ...prev, extendedPos: !prev.extendedPos }))
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  localSettings.extendedPos
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {localSettings.extendedPos ? '8 POS Enabled' : '4 Core POS'}
              </button>
            </div>

            {/* Sentence Context Toggle */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Show Sentence Context:</span>
                <span className="text-[11px] text-slate-400">
                  Provides an example sentence with the word in context for visual clues
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    showSentenceContext: !prev.showSentenceContext,
                  }))
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  localSettings.showSentenceContext
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {localSettings.showSentenceContext ? 'Visible' : 'Hidden'}
              </button>
            </div>

            {/* Sound FX Toggle */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {localSettings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <span className="text-xs font-bold text-white block">Classroom Sound FX:</span>
                  <span className="text-[11px] text-slate-400">
                    Play synthesized arcade sounds for correct chimes and rope pulls
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  localSettings.soundEnabled
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {localSettings.soundEnabled ? 'Sound ON' : 'Muted'}
              </button>
            </div>
          </div>
        ) : (
          /* Custom Words Tab */
          <div className="overflow-y-auto pr-1 my-2 flex-1 flex flex-col gap-4">
            {/* Add Custom Word Form */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Custom Vocabulary Word:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Word (e.g. telescope)"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <select
                  value={newPos}
                  onChange={(e) => setNewPos(e.target.value as PosType)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white capitalize focus:outline-none focus:border-amber-400"
                >
                  {ALL_POS.map((pos) => (
                    <option key={pos} value={pos} className="bg-slate-900 text-white">
                      {pos}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCustomWord}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Word
                </button>
              </div>
              <input
                type="text"
                placeholder="Optional sentence clue (use __ for blank)"
                value={newSentence}
                onChange={(e) => setNewSentence(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Custom Words List */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400">
                Custom Vocabulary Bank ({customWords.length} words):
              </span>
              {customWords.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl text-center">
                  No custom words added yet. Add your weekly spelling/vocabulary list above!
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
                  {customWords.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{w.word}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px]">
                          {w.pos}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomWord(w.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-md"
          >
            <Check className="w-4 h-4" />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
