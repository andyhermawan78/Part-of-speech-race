import React, { useEffect } from 'react';
import { TeamId, Student, RoundHistoryItem } from '../types';
import { Trophy, RotateCcw, Award, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { POS_DEFINITIONS } from '../data/words';

interface GameOverModalProps {
  isOpen: boolean;
  winner: TeamId | null;
  score1: number;
  score2: number;
  team1Name?: string;
  team2Name?: string;
  students: Student[];
  roundHistory: RoundHistoryItem[];
  onRematch: () => void;
  onBackToLobby?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  score1,
  score2,
  team1Name = 'Team Alpha',
  team2Name = 'Team Omega',
  students,
  roundHistory,
  onRematch,
  onBackToLobby,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger festive victory confetti cannons
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  const isTeam1Winner = winner === 1;
  const winnerName = isTeam1Winner ? team1Name : team2Name;

  // Find match MVP (student with highest score)
  const mvp = [...students].sort((a, b) => b.correctAnswers - a.correctAnswers)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div
        id="game-over-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-center"
      >
        {/* Victory Ribbon & Trophy */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative">
            <span className="text-5xl md:text-6xl animate-bounce filter drop-shadow-[0_0_20px_#f59e0b]">
              🏆
            </span>
          </div>
          <h2
            className={`text-2xl md:text-4xl font-black uppercase tracking-wide ${
              isTeam1Winner ? 'text-cyan-400' : 'text-fuchsia-400'
            }`}
          >
            {winnerName} Wins!
          </h2>
          <p className="text-xs md:text-sm text-slate-300">
            Tug-of-War victory achieved with decisive grammar precision!
          </p>
        </div>

        {/* Score Summary Banner */}
        <div className="my-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{team1Name}</span>
            <span className="text-3xl md:text-4xl font-black text-white font-mono">{score1}</span>
          </div>
          <div className="text-slate-500 font-bold text-sm">FINAL SCORE</div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">{team2Name}</span>
            <span className="text-3xl md:text-4xl font-black text-white font-mono">{score2}</span>
          </div>
        </div>

        {/* MVP Spotlight */}
        {mvp && mvp.correctAnswers > 0 && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Match MVP
                </span>
                <span className="text-xs md:text-sm font-bold text-white flex items-center gap-1">
                  <span>{mvp.avatar}</span> {mvp.name} ({mvp.team === 1 ? team1Name : team2Name})
                </span>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-400 text-slate-950">
              {mvp.correctAnswers} Correct Buzzes
            </span>
          </div>
        )}

        {/* Match Word Review */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 flex flex-col gap-1.5 text-left">
          <span className="text-xs font-bold text-slate-400 px-1">
            Words Mastered in This Match ({roundHistory.length}):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
            {roundHistory.map((item, idx) => {
              const meta = POS_DEFINITIONS[item.word.pos];
              const wasWon = item.winningTeam !== null;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {wasWon ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-white">{item.word.word}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.color} bg-slate-900 border border-slate-700`}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
          {onBackToLobby && (
            <button
              type="button"
              id="btn-gameover-back-main-screen"
              onClick={onBackToLobby}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>← Back to Main Screen</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRematch}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_0_24px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer border-b-4 border-orange-700 active:border-b-0 active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            Start Next Battle
          </button>
        </div>
      </div>
    </div>
  );
};
