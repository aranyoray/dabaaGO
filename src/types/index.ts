// core types for puzzle data and game state

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[]; // array of moves in SAN format
  rating?: number;
  difficulty: 'simple' | 'medium' | 'hard' | 'ultra';
  theme?: string[];
  sourceUrl?: string;
  pieceCount?: number;
  thumbnailFen?: string;
}

export interface PuzzleProgress {
  puzzleId: string;
  solved: boolean;
  attempts: number;
  bestTime?: number;
  lastAttempt?: number;
  streak?: number;
}

export interface UserStats {
  totalPuzzles: number;
  solvedPuzzles: number;
  currentStreak: number;
  bestStreak: number;
  averageTime: number;
  accuracy: number;
  totalTime: number;
  difficultyBreakdown: {
    simple: { solved: number; attempted: number };
    medium: { solved: number; attempted: number };
    hard: { solved: number; attempted: number };
    ultra: { solved: number; attempted: number };
  };
}

export interface GameSettings {
  theme: 'light' | 'dark';
  pieceStyle: 'minimal' | 'rounded' | 'geometric';
  timeLimit: 30 | 60 | 90 | 120 | 0; // 0 = unlimited
  difficulty: 'simple' | 'medium' | 'hard' | 'ultra' | 'adaptive';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  engineStrength: number; // 1-20 for stockfish
}

export interface ExportData {
  version: string;
  exportDate: string;
  progress: PuzzleProgress[];
  stats: UserStats;
  settings: GameSettings;
}

export type GameMode = 
  | 'blitz'
  | 'timed-limited'
  | 'practice'
  | 'ultra'
  | 'progression'
  | 'daily';

export interface TimerState {
  remaining: number; // milliseconds
  isRunning: boolean;
  startTime?: number;
}

