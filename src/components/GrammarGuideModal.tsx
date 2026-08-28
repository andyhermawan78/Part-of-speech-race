import React from 'react';
import { X, BookOpen, Lightbulb } from 'lucide-react';
import { POS_DEFINITIONS, ALL_POS } from '../data/words';

interface GrammarGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarGuideModal: React.FC<GrammarGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div
        id="grammar-guide-modal"
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-7 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">Parts of Speech Field Guide</h2>
              <p className="text-xs text-slate-400">Grammar rules, definitions, and quick memory tricks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tip Banner */}
        <div className="my-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Pro-Tip:</strong> Ask yourself: <em>"What job is this word doing in the sentence?"</em> Is it naming something? Doing something? Or describing something?
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 my-2 flex-1">
          {ALL_POS.map((pos) => {
            const meta = POS_DEFINITIONS[pos];
            return (
              <div
                key={pos}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <span className={`font-black text-sm ${meta.color}`}>{meta.label}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    POS
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {meta.description}
                </p>
                <div className="text-[11px] text-slate-400 mt-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 font-bold block mb-0.5">Examples:</span>
                  <span className="italic text-slate-300">{meta.example}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-md"
          >
            Ready to Race!
          </button>
        </div>
      </div>
    </div>
  );
};
