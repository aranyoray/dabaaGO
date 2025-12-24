// core types for puzzle data and game state

export type TacticType =
  | 'pin'
  | 'skewer'
  | 'fork'
  | 'royal-fork'
  | 'discovered-attack'
  | 'discovered-check'
  | 'double-attack';

export type LearningTheme =
  | 'backrank-mate'
  | 'ladder-mate'
  | 'forced-mate'
  | 'anastasias-mate'
  | 'arabian-mate'
  | 'smothered-mate'
  | 'bodens-mate'
  | 'opera-mate'
  | 'damianos-mate'
  | 'drawing'
  | 'sacrifice'
  | 'opening'
  | 'king-rook-endgame'
  | 'king-pawn-endgame'
  | 'king-queen-endgame'
  | 'forced-stalemate'
  | 'gambit'
  | 'counter-gambit'
  | 'material-exchange'
  | 'open-files'
  | 'outpost'
  | 'development'
  | 'king-safety';

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[]; // array of moves in SAN format (2-7 moves)
  rating?: number;
  difficulty: 'simple' | 'medium' | 'hard' | 'ultra';
  theme?: string[];
  tactics?: TacticType[]; // main tactics (1-2 max)
  learningThemes?: LearningTheme[]; // what this puzzle teaches
  mainTactic?: TacticType; // primary tactic to learn
  hint?: string; // tactical hint without revealing solution
  validated?: boolean; // puzzle is solvable and tested
  moveCount?: number; // number of moves in solution (2-7)
  sourceUrl?: string;
  pieceCount?: number;
  thumbnailFen?: string;
  usedInDaily?: boolean; // prevent daily puzzle repeats
  lastUsedDate?: number; // when used in daily puzzle
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

export type PlayerLevel = 'beginner' | 'amateur';

export type League = 'stone' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: number;
  requirement: number; // streak required
}

export interface UserProfile {
  level: PlayerLevel;
  elo: number;
  league: League;
  streakCount: number;
  lastPlayedDate: number;
  badges: Badge[];
  totalPlayTime: number; // minutes
  hasCompletedTutorial: boolean;
}

export interface PuzzleScore {
  puzzleId: string;
  score: number; // 0-100
  timeBonus: number;
  accuracyBonus: number;
  attemptsDeduction: number;
  timestamp: number;
}

export type GameMode =
  | 'blitz'
  | 'timed-limited'
  | 'practice'
  | 'ultra'
  | 'progression'
  | 'daily'
  | 'puzzle-rush'
  | 'infinite-lives'
  | 'streak-freeze'
  | '1v1'
  | 'first-to-10'
  | 'five-to-victory';

export type GameModeCategory = 'casual' | 'ranked';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'score' | 'speed' | 'accuracy' | 'special';
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  target: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  elo: number;
  league: League;
  streakCount: number;
  rank: number;
}

export interface TimerState {
  remaining: number; // milliseconds
  isRunning: boolean;
  startTime?: number;
}

