export type PosType = 
  | 'noun' 
  | 'verb' 
  | 'adjective' 
  | 'adverb' 
  | 'pronoun' 
  | 'preposition' 
  | 'conjunction' 
  | 'interjection';

export interface WordItem {
  id: string;
  word: string;
  pos: PosType;
  sentence?: string;
  definition?: string;
  difficulty: 'elementary' | 'intermediate' | 'advanced';
}

export type TeamId = 1 | 2;

export interface Student {
  id: string;
  name: string;
  team: TeamId;
  avatar: string;
  correctAnswers: number;
}

export type WinMode = 'first_to_score' | 'tug_lead';

export interface GameSettings {
  winScore: number;
  winMode: WinMode;
  difficulty: 'all' | 'elementary' | 'intermediate' | 'advanced' | 'custom';
  extendedPos: boolean; // 8 parts of speech vs 4 core
  showSentenceContext: boolean;
  soundEnabled: boolean;
  timeLimitPerWord: number; // 0 for unlimited, or e.g. 10s
  rotationMode: 'free' | 'turn_based'; // individual students take turns vs whole team buzz
}

export interface RoundHistoryItem {
  word: WordItem;
  winningTeam: TeamId | null;
  responseTimeMs: number;
  studentId?: string;
}
