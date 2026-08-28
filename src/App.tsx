/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PosType,
  TeamId,
  WordItem,
  Student,
  GameSettings,
  RoundHistoryItem,
} from './types';
import {
  INITIAL_WORD_BANK,
  DEFAULT_STUDENTS,
  CORE_POS,
  ALL_POS,
  POS_DEFINITIONS,
} from './data/words';
import { playSound } from './utils/audio';
import { ScoreBoard } from './components/ScoreBoard';
import { TugOfWarArena } from './components/TugOfWarArena';
import { WordDisplay } from './components/WordDisplay';
import { AnswerPad } from './components/AnswerPad';
import { StudentRosterModal } from './components/StudentRosterModal';
import { QuickRenameModal } from './components/QuickRenameModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { GrammarGuideModal } from './components/GrammarGuideModal';
import { GameOverModal } from './components/GameOverModal';
import { OpeningScreen } from './components/OpeningScreen';
import {
  Users,
  Sliders,
  BookOpen,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  UserCheck,
  Home,
} from 'lucide-react';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Game Settings State
  const [settings, setSettings] = useState<GameSettings>({
    winScore: 5,
    winMode: 'first_to_score',
    difficulty: 'all',
    extendedPos: false,
    showSentenceContext: true,
    soundEnabled: true,
    timeLimitPerWord: 0,
    rotationMode: 'turn_based',
  });

  // Custom words managed by teacher
  const [customWords, setCustomWords] = useState<WordItem[]>([]);

  // Team names state with localStorage persistence
  const [team1Name, setTeam1Name] = useState<string>(() => {
    try {
      return localStorage.getItem('grammar_sprint_team1_name') || 'Team Alpha';
    } catch {
      return 'Team Alpha';
    }
  });

  const [team2Name, setTeam2Name] = useState<string>(() => {
    try {
      return localStorage.getItem('grammar_sprint_team2_name') || 'Team Omega';
    } catch {
      return 'Team Omega';
    }
  });

  // Students roster with localStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('grammar_sprint_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDENTS;
  });

  // Game Screen State: 'lobby' (Opening screen) vs 'playing' (Battle Arena)
  const [gameState, setGameState] = useState<'lobby' | 'playing'>('lobby');

  const [activeStudentIdx1, setActiveStudentIdx1] = useState(0);
  const [activeStudentIdx2, setActiveStudentIdx2] = useState(0);

  // Quick rename selected student
  const [quickRenameStudent, setQuickRenameStudent] = useState<Student | null>(null);

  // Match State
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [streak1, setStreak1] = useState(0);
  const [streak2, setStreak2] = useState(0);
  const [lastScorer, setLastScorer] = useState<1 | 2 | null>(null);
  const [winner, setWinner] = useState<TeamId | null>(null);

  // Round / Word Pool State
  const [wordPool, setWordPool] = useState<WordItem[]>([]);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isRoundAnswered, setIsRoundAnswered] = useState(false);
  const [correctPosShown, setCorrectPosShown] = useState<PosType | null>(null);

  // Anti-spam / Cooldown locks per team
  const [disabledTeam1, setDisabledTeam1] = useState(false);
  const [disabledTeam2, setDisabledTeam2] = useState(false);
  const [lastAttemptT1, setLastAttemptT1] = useState<{ pos: PosType; correct: boolean } | null>(null);
  const [lastAttemptT2, setLastAttemptT2] = useState<{ pos: PosType; correct: boolean } | null>(null);

  // Feedback status banner
  const [statusMessage, setStatusMessage] = useState('🏁 Race to identify the correct part of speech!');

  // Match History
  const [roundHistory, setRoundHistory] = useState<RoundHistoryItem[]>([]);

  // Modals state
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Save team name changes
  const handleUpdateTeamNames = useCallback((t1: string, t2: string) => {
    const cleanT1 = t1.trim() || 'Team Alpha';
    const cleanT2 = t2.trim() || 'Team Omega';
    setTeam1Name(cleanT1);
    setTeam2Name(cleanT2);
    try {
      localStorage.setItem('grammar_sprint_team1_name', cleanT1);
      localStorage.setItem('grammar_sprint_team2_name', cleanT2);
    } catch {
      // ignore
    }
  }, []);

  // Save student roster changes
  const handleUpdateStudents = useCallback((updated: Student[]) => {
    setStudents(updated);
    try {
      localStorage.setItem('grammar_sprint_students', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // Set quick team size (e.g. 1v1 up to 5v5)
  const handleSetQuickSize = useCallback(
    (sizePerTeam: number) => {
      const t1 = students.filter((s) => s.team === 1);
      const t2 = students.filter((s) => s.team === 2);

      const sampleAvatarsT1 = ['🚀', '⚡', '🦁', '🌟', '🦅', '🤖', '🔥', '🦄'];
      const sampleAvatarsT2 = ['💎', '🦊', '🐼', '🐲', '🎯', '🎸', '🛸', '🏆'];
      const defaultNamesT1 = ['Alex', 'Maya', 'Liam', 'Zoe', 'Noah', 'Lucas', 'Ethan', 'Oliver'];
      const defaultNamesT2 = ['Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Sam', 'Avery', 'Skyler'];

      const newT1: Student[] = [];
      for (let i = 0; i < sizePerTeam; i++) {
        if (t1[i]) {
          newT1.push(t1[i]);
        } else {
          newT1.push({
            id: `t1-${Date.now()}-${i}`,
            name: defaultNamesT1[i] || `${team1Name} P${i + 1}`,
            avatar: sampleAvatarsT1[i % sampleAvatarsT1.length],
            team: 1,
            correctAnswers: 0,
          });
        }
      }

      const newT2: Student[] = [];
      for (let i = 0; i < sizePerTeam; i++) {
        if (t2[i]) {
          newT2.push(t2[i]);
        } else {
          newT2.push({
            id: `t2-${Date.now()}-${i}`,
            name: defaultNamesT2[i] || `${team2Name} P${i + 1}`,
            avatar: sampleAvatarsT2[i % sampleAvatarsT2.length],
            team: 2,
            correctAnswers: 0,
          });
        }
      }

      const combined = [...newT1, ...newT2];
      setStudents(combined);
      try {
        localStorage.setItem('grammar_sprint_students', JSON.stringify(combined));
      } catch {
        // ignore
      }
    },
    [students, team1Name, team2Name]
  );

  const handleQuickRenameSave = useCallback((studentId: string, newName: string, newAvatar: string) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === studentId ? { ...s, name: newName, avatar: newAvatar } : s));
      try {
        localStorage.setItem('grammar_sprint_students', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Audio helper ref
  const soundEnabledRef = useRef(settings.soundEnabled);
  soundEnabledRef.current = settings.soundEnabled;

  const team1Students = students.filter((s) => s.team === 1);
  const team2Students = students.filter((s) => s.team === 2);

  // Filter word bank based on settings
  const getFilteredWordBank = useCallback(() => {
    let pool = [...INITIAL_WORD_BANK, ...customWords];

    // Filter by difficulty
    if (settings.difficulty !== 'all' && settings.difficulty !== 'custom') {
      pool = pool.filter((w) => w.difficulty === settings.difficulty);
    } else if (settings.difficulty === 'custom') {
      pool = customWords.length > 0 ? [...customWords] : pool;
    }

    // Filter by allowed POS (4 core vs 8 extended)
    const allowedPos = settings.extendedPos ? ALL_POS : CORE_POS;
    pool = pool.filter((w) => allowedPos.includes(w.pos));

    if (pool.length === 0) {
      pool = INITIAL_WORD_BANK.filter((w) => allowedPos.includes(w.pos));
    }

    return pool;
  }, [settings.difficulty, settings.extendedPos, customWords]);

  // Load next word
  const nextWord = useCallback(() => {
    setWordPool((prevPool) => {
      let pool = [...prevPool];
      if (pool.length === 0) {
        pool = shuffle(getFilteredWordBank());
      }
      const item = pool.pop() || null;
      setCurrentWord(item);
      return pool;
    });

    setIsLocked(false);
    setIsRoundAnswered(false);
    setCorrectPosShown(null);
    setDisabledTeam1(false);
    setDisabledTeam2(false);
    setLastAttemptT1(null);
    setLastAttemptT2(null);
    setStatusMessage('🏁 Race to identify the correct part of speech!');
  }, [getFilteredWordBank]);

  // Proceed to next question manually
  const handleProceedNext = useCallback(() => {
    if (winner) return;

    // Rotate student turns if turn-based and this round was answered
    if (settings.rotationMode === 'turn_based' && isRoundAnswered) {
      setActiveStudentIdx1((prev) => (prev + 1) % team1Students.length);
      setActiveStudentIdx2((prev) => (prev + 1) % team2Students.length);
    }

    playSound('tug', soundEnabledRef.current);
    nextWord();
  }, [
    winner,
    settings.rotationMode,
    isRoundAnswered,
    team1Students.length,
    team2Students.length,
    nextWord,
  ]);

  // Start new match
  const startNewMatch = useCallback(() => {
    setScore1(0);
    setScore2(0);
    setStreak1(0);
    setStreak2(0);
    setLastScorer(null);
    setWinner(null);
    setRoundHistory([]);
    setActiveStudentIdx1(0);
    setActiveStudentIdx2(0);

    const freshPool = shuffle(getFilteredWordBank());
    const firstWord = freshPool.pop() || null;
    setWordPool(freshPool);
    setCurrentWord(firstWord);

    setIsLocked(false);
    setIsRoundAnswered(false);
    setCorrectPosShown(null);
    setDisabledTeam1(false);
    setDisabledTeam2(false);
    setLastAttemptT1(null);
    setLastAttemptT2(null);
    setStatusMessage('⚡ New match started! Both teams ready!');

    playSound('whistle', soundEnabledRef.current);
  }, [getFilteredWordBank]);

  // Start race from opening screen
  const handleStartRace = useCallback(() => {
    setGameState('playing');
    startNewMatch();
  }, [startNewMatch]);

  // Return to opening screen / lobby
  const handleBackToLobby = useCallback(() => {
    setGameState('lobby');
    setWinner(null);
  }, []);

  // Initialize game on load if in playing state
  useEffect(() => {
    if (gameState === 'playing') {
      startNewMatch();
    }
  }, [settings.difficulty, settings.extendedPos, gameState, startNewMatch]);

  // Speech pronunciation
  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Handle student answering
  const handleAnswer = useCallback(
    (pos: PosType, team: TeamId) => {
      if (winner || isLocked || !currentWord) return;
      if (team === 1 && disabledTeam1) return;
      if (team === 2 && disabledTeam2) return;

      const isCorrect = currentWord.pos === pos;

      if (team === 1) {
        setLastAttemptT1({ pos, correct: isCorrect });
      } else {
        setLastAttemptT2({ pos, correct: isCorrect });
      }

      if (isCorrect) {
        // Correct answer! Lock round immediately
        setIsLocked(true);
        setIsRoundAnswered(true);
        setCorrectPosShown(pos);
        setLastScorer(team);
        setDisabledTeam1(true);
        setDisabledTeam2(true);

        playSound('correct', soundEnabledRef.current);
        playSound('tug', soundEnabledRef.current);

        const currentActiveStudent =
          team === 1 ? team1Students[activeStudentIdx1] : team2Students[activeStudentIdx2];

        // Award student individual point
        if (currentActiveStudent) {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === currentActiveStudent.id
                ? { ...s, correctAnswers: s.correctAnswers + 1 }
                : s
            )
          );
        }

        // Add to history
        setRoundHistory((prev) => [
          ...prev,
          {
            word: currentWord,
            winningTeam: team,
            responseTimeMs: 0,
            studentId: currentActiveStudent?.id,
          },
        ]);

        let newScore1 = score1;
        let newScore2 = score2;

        if (team === 1) {
          newScore1 += 1;
          setScore1(newScore1);
          setStreak1((prev) => prev + 1);
          setStreak2(0);
          setStatusMessage(
            `✅ ${team1Name} scores! (+1 pt by ${currentActiveStudent?.name || team1Name}) — Click "Next Question" to proceed`
          );
        } else {
          newScore2 += 1;
          setScore2(newScore2);
          setStreak2((prev) => prev + 1);
          setStreak1(0);
          setStatusMessage(
            `✅ ${team2Name} scores! (+1 pt by ${currentActiveStudent?.name || team2Name}) — Click "Next Question" to proceed`
          );
        }

        // Check winning condition
        if (newScore1 >= settings.winScore) {
          setWinner(1);
          playSound('win', soundEnabledRef.current);
          setStatusMessage(`🎉🎉 ${team1Name.toUpperCase()} WINS THE TUG OF WAR! 🎉🎉`);
          return;
        } else if (newScore2 >= settings.winScore) {
          setWinner(2);
          playSound('win', soundEnabledRef.current);
          setStatusMessage(`🎉🎉 ${team2Name.toUpperCase()} WINS THE TUG OF WAR! 🎉🎉`);
          return;
        }

        // We do NOT auto transition: waiting for user to click "Next Question" or press Space/Enter
      } else {
        // Wrong answer: this player/team has used their single answer for this round
        playSound('wrong', soundEnabledRef.current);

        const answeringTeamName = team === 1 ? team1Name : team2Name;
        const opposingTeamName = team === 1 ? team2Name : team1Name;
        const opposingAlreadyAnswered = team === 1 ? disabledTeam2 : disabledTeam1;

        if (team === 1) {
          setDisabledTeam1(true);
        } else {
          setDisabledTeam2(true);
        }

        if (opposingAlreadyAnswered) {
          // Both teams have now used their 1 attempt and both missed
          setIsLocked(true);
          setIsRoundAnswered(true);
          setCorrectPosShown(currentWord.pos);
          setLastScorer(null);

          setRoundHistory((prev) => [
            ...prev,
            {
              word: currentWord,
              winningTeam: null,
              responseTimeMs: 0,
            },
          ]);

          setStatusMessage(
            `❌ Both teams guessed wrong! The correct answer was ${POS_DEFINITIONS[currentWord.pos].label}. Click "Next Question" to proceed.`
          );
        } else {
          // Opposing team still has their 1 chance to steal
          setStatusMessage(
            `❌ ${answeringTeamName} guessed wrong (1 attempt used)! ${opposingTeamName} can steal!`
          );
        }
      }
    },
    [
      winner,
      isLocked,
      currentWord,
      disabledTeam1,
      disabledTeam2,
      team1Students,
      team2Students,
      team1Name,
      team2Name,
      activeStudentIdx1,
      activeStudentIdx2,
      score1,
      score2,
      settings.winScore,
    ]
  );

  // Keyboard Shortcuts for 2-player classroom / arcade play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Lobby state shortcuts
      if (gameState === 'lobby') {
        if (e.code === 'Space' || e.key === 'Enter') {
          if (!isRosterModalOpen && !isSettingsModalOpen && !isGuideModalOpen && !quickRenameStudent) {
            e.preventDefault();
            handleStartRace();
          }
        }
        return;
      }

      // Space or Enter to proceed to next question in active game
      if (e.code === 'Space' || e.key === 'Enter') {
        if (isRoundAnswered || (!winner && isLocked)) {
          e.preventDefault();
          handleProceedNext();
          return;
        }
      }

      const key = e.key.toUpperCase();

      // Team 1 Shortcuts: Q, W, E, R (or A, S, D, F)
      if (key === 'Q' || key === '1') handleAnswer('noun', 1);
      if (key === 'W' || key === '2') handleAnswer('verb', 1);
      if (key === 'E' || key === '3') handleAnswer('adjective', 1);
      if (key === 'R' || key === '4') handleAnswer('adverb', 1);
      if (settings.extendedPos) {
        if (key === 'A') handleAnswer('pronoun', 1);
        if (key === 'S') handleAnswer('preposition', 1);
        if (key === 'D') handleAnswer('conjunction', 1);
        if (key === 'F') handleAnswer('interjection', 1);
      }

      // Team 2 Shortcuts: U, I, O, P (or J, K, L, ;)
      if (key === 'U' || key === '7') handleAnswer('noun', 2);
      if (key === 'I' || key === '8') handleAnswer('verb', 2);
      if (key === 'O' || key === '9') handleAnswer('adjective', 2);
      if (key === 'P' || key === '0') handleAnswer('adverb', 2);
      if (settings.extendedPos) {
        if (key === 'J') handleAnswer('pronoun', 2);
        if (key === 'K') handleAnswer('preposition', 2);
        if (key === 'L') handleAnswer('conjunction', 2);
        if (key === ';' || key === ':') handleAnswer('interjection', 2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    handleStartRace,
    handleAnswer,
    handleProceedNext,
    isRoundAnswered,
    isLocked,
    winner,
    settings.extendedPos,
    isRosterModalOpen,
    isSettingsModalOpen,
    isGuideModalOpen,
    quickRenameStudent,
  ]);

  return (
    <main
      id="app-root"
      className="h-screen max-h-screen w-full max-w-[3840px] mx-auto bg-slate-950 text-white font-sans selection:bg-cyan-500/30 flex flex-col justify-between p-2 sm:p-3 md:p-4 2xl:p-6 overflow-hidden antialiased select-none"
    >
      {/* 3840x2160 / 16:9 Cinema Classroom Canvas Wrapper */}
      <div className="w-full h-full flex flex-col justify-between overflow-hidden relative">
      {gameState === 'lobby' ? (
        /* ================= OPENING SCREEN / LOBBY ================= */
        <div className="w-full h-full max-w-7xl 2xl:max-w-[2800px] mx-auto flex flex-col items-center justify-between flex-grow overflow-hidden">
          <OpeningScreen
            students={students}
            settings={settings}
            team1Name={team1Name}
            team2Name={team2Name}
            onUpdateTeamNames={handleUpdateTeamNames}
            onSetQuickSize={handleSetQuickSize}
            onStartGame={handleStartRace}
            onOpenRoster={() => setIsRosterModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            onQuickRenameStudent={(s) => setQuickRenameStudent(s)}
            onToggleSound={() =>
              setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            totalWords={getFilteredWordBank().length}
          />
        </div>
      ) : (
        /* ================= ACTIVE GAME BATTLE ARENA ================= */
        <div className="w-full h-full max-w-7xl 2xl:max-w-[3200px] mx-auto flex flex-col justify-between gap-1.5 sm:gap-2 md:gap-2.5 2xl:gap-3.5 flex-grow overflow-hidden">
          {/* ================= TOP HEADER / TOOLBAR ================= */}
          <header
            id="classroom-header"
            className="flex flex-col md:flex-row justify-between items-center gap-2 bg-slate-900/60 p-2 sm:p-2.5 md:p-3 2xl:p-4 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md shrink-0"
          >
            {/* Logo & Sprint Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBackToLobby}
                  title="Return to Main Menu / Lobby"
                  className="bg-gradient-to-br from-amber-400 to-orange-600 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-orange-500/20 shrink-0 text-white hover:scale-105 transition-transform cursor-pointer"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl 2xl:text-2xl font-black tracking-tighter uppercase leading-none text-white">
                    Grammar Sprint
                  </h1>
                  <p className="text-slate-400 text-[9px] sm:text-[10px] 2xl:text-xs font-bold tracking-widest uppercase mt-0.5">
                    3840×2160 4K 16:9 • {team1Students.length}v{team2Students.length} Match
                  </p>
                </div>
              </div>

              {/* Target Score Pill on Mobile */}
              <div className="flex md:hidden bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 items-center gap-1.5 shadow-inner">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</span>
                <span className="text-xs font-black text-amber-400">{settings.winScore} pts</span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end w-full md:w-auto">
              {/* Target Score Pill on Desktop */}
              <div className="hidden md:flex bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700 items-center gap-2 shadow-inner">
                <span className="text-[11px] 2xl:text-xs font-black text-slate-400 uppercase tracking-widest">Target</span>
                <span className="text-sm 2xl:text-base font-black text-amber-400">{settings.winScore} pts</span>
              </div>

              {/* Back to Main Screen Button */}
              <button
                type="button"
                id="btn-back-to-main-screen"
                onClick={handleBackToLobby}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl 2xl:rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-[11px] 2xl:text-xs font-black uppercase tracking-wider text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-md shadow-amber-950/40"
                title="Return to Main Screen / Title Lobby"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span>Main Screen</span>
              </button>

              {/* Lineup Manager */}
              <button
                type="button"
                id="btn-roster"
                onClick={() => setIsRosterModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl 2xl:rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 text-[11px] 2xl:text-xs font-black uppercase tracking-wider text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
                title={`Input & Manage Student Names (${students.length} Players)`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lineup ({students.length})</span>
              </button>

              {/* Grammar Guide */}
              <button
                type="button"
                id="btn-guide"
                onClick={() => setIsGuideModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl 2xl:rounded-2xl bg-slate-800 hover:bg-slate-700 text-[11px] 2xl:text-xs font-black uppercase tracking-wider text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Parts of Speech Rules Guide"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Rules</span>
              </button>

              {/* Match Settings */}
              <button
                type="button"
                id="btn-settings"
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl 2xl:rounded-2xl bg-slate-800 hover:bg-slate-700 text-[11px] 2xl:text-xs font-black uppercase tracking-wider text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Match Settings & Word Lists"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {/* Sound Mute Toggle */}
              <button
                type="button"
                id="btn-toggle-sound"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                }
                className="p-1.5 2xl:p-2 rounded-xl 2xl:rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                id="btn-toggle-fullscreen"
                onClick={toggleFullscreen}
                className="p-1.5 2xl:p-2 rounded-xl 2xl:rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors hidden sm:flex cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-slate-300" />
                ) : (
                  <Maximize className="w-4 h-4 text-slate-300" />
                )}
              </button>

              {/* End / Reset Race Button */}
              <button
                type="button"
                id="btn-reset-match"
                onClick={startNewMatch}
                className="bg-rose-600 hover:bg-rose-500 px-3 sm:px-4 py-1.5 rounded-full font-black text-[11px] 2xl:text-xs uppercase tracking-wider transition-all border-b-2 border-rose-800 active:border-b-0 active:translate-y-0.5 text-white shadow-lg cursor-pointer flex items-center gap-1.5"
                title="Reset and start new race"
              >
                <RotateCcw className="w-3 h-3" />
                <span>End Race</span>
              </button>
            </div>
          </header>

          {/* ================= SCOREBOARD ================= */}
          <ScoreBoard
            score1={score1}
            score2={score2}
            winScore={settings.winScore}
            team1Name={team1Name}
            team2Name={team2Name}
            team1Count={team1Students.length}
            team2Count={team2Students.length}
            activeStudentT1={team1Students[activeStudentIdx1 % Math.max(1, team1Students.length)]}
            activeStudentT2={team2Students[activeStudentIdx2 % Math.max(1, team2Students.length)]}
            settings={settings}
            streak1={streak1}
            streak2={streak2}
            onStudentClick={(s) => setQuickRenameStudent(s)}
            onOpenRoster={() => setIsRosterModalOpen(true)}
          />

          {/* ================= WORD DISPLAY ================= */}
          <WordDisplay
            wordItem={currentWord}
            showSentence={settings.showSentenceContext}
            isAnswered={isRoundAnswered}
            correctPos={correctPosShown}
            lastScorer={lastScorer}
            scorerName={
              lastScorer === 1
                ? team1Students[activeStudentIdx1 % Math.max(1, team1Students.length)]?.name
                : lastScorer === 2
                ? team2Students[activeStudentIdx2 % Math.max(1, team2Students.length)]?.name
                : undefined
            }
            onSpeak={handleSpeak}
            onNextQuestion={handleProceedNext}
            hasWinner={winner !== null}
          />

          {/* ================= SPRINT / TUG OF WAR PROGRESS ================= */}
          <TugOfWarArena
            score1={score1}
            score2={score2}
            winScore={settings.winScore}
            team1Students={team1Students}
            team2Students={team2Students}
            lastScorer={lastScorer}
            activeStudentIdx1={activeStudentIdx1 % Math.max(1, team1Students.length)}
            activeStudentIdx2={activeStudentIdx2 % Math.max(1, team2Students.length)}
            onStudentClick={(s) => setQuickRenameStudent(s)}
          />

          {/* ================= DUAL BUZZER ANSWER PADS ================= */}
          <AnswerPad
            extendedPos={settings.extendedPos}
            disabledTeam1={disabledTeam1}
            disabledTeam2={disabledTeam2}
            isLocked={isLocked}
            team1Name={team1Name}
            team2Name={team2Name}
            lastAttemptT1={lastAttemptT1}
            lastAttemptT2={lastAttemptT2}
            onAnswer={handleAnswer}
          />

          {/* ================= STATUS BANNER ================= */}
          <div
            id="game-status-banner"
            className="w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl 2xl:rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center text-xs sm:text-sm font-bold text-slate-300 flex flex-wrap items-center justify-between gap-2 shrink-0"
          >
            <div className="flex items-center gap-2 mx-auto sm:mx-0 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </div>
            <button
              type="button"
              id="btn-status-back-main"
              onClick={handleBackToLobby}
              className="text-[11px] font-bold text-amber-400/80 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 cursor-pointer transition-all mx-auto sm:mx-0 shrink-0"
            >
              <Home className="w-3 h-3" />
              <span>Main Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer
        id="app-footer"
        className="w-full max-w-6xl mx-auto mt-4 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 border-t border-slate-800/50 text-slate-400 select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Multiplayer Arena Ready • {team1Name} vs {team2Name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {students.slice(0, 4).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setQuickRenameStudent(s)}
                title={`Rename ${s.name}`}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-cyan-500/40 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black italic text-slate-200 transition-transform hover:scale-110 cursor-pointer"
              >
                {s.avatar}
              </button>
            ))}
            {students.length > 4 && (
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black italic text-slate-300 cursor-pointer"
              >
                +{students.length - 4}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsRosterModalOpen(true)}
            className="text-[10px] font-bold text-cyan-400/80 hover:text-cyan-300 uppercase tracking-widest cursor-pointer transition-colors"
          >
            {students.length} Students Lineup (Click to Edit)
          </button>
        </div>
      </footer>

      {/* ================= MODALS ================= */}
      <QuickRenameModal
        student={quickRenameStudent}
        isOpen={quickRenameStudent !== null}
        team1Name={team1Name}
        team2Name={team2Name}
        onClose={() => setQuickRenameStudent(null)}
        onSave={handleQuickRenameSave}
        onOpenFullRoster={() => setIsRosterModalOpen(true)}
      />

      <StudentRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        students={students}
        onUpdateStudents={handleUpdateStudents}
        team1Name={team1Name}
        team2Name={team2Name}
        onUpdateTeamNames={handleUpdateTeamNames}
        rotationMode={settings.rotationMode}
        onChangeRotationMode={(mode) =>
          setSettings((prev) => ({ ...prev, rotationMode: mode }))
        }
      />

      <GameSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        customWords={customWords}
        onUpdateCustomWords={setCustomWords}
      />

      <GrammarGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <GameOverModal
        isOpen={winner !== null}
        winner={winner}
        score1={score1}
        score2={score2}
        team1Name={team1Name}
        team2Name={team2Name}
        students={students}
        roundHistory={roundHistory}
        onRematch={startNewMatch}
        onBackToLobby={handleBackToLobby}
      />
      </div>
    </main>
  );
}
