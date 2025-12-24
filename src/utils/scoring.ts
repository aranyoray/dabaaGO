// scoring and rating utilities

import type { League, PuzzleScore, PlayerLevel } from '../types';

/**
 * Calculate puzzle score (kid-friendly 1-10 points) based on time, accuracy, and attempts
 */
export function calculatePuzzleScore(
  timeLimit: number,
  timeTaken: number,
  attempts: number,
  difficulty: string
): PuzzleScore {
  const baseScore = 5; // base 5 points for solving

  // time bonus: faster = more points (max 3 points)
  const timeRatio = timeTaken / timeLimit;
  const timeBonus = Math.max(0, Math.min(3, 3 * (1 - timeRatio)));

  // accuracy bonus: solved on first try = more points (max 2 points)
  const accuracyBonus = attempts === 1 ? 2 : Math.max(0, 2 - (attempts - 1) * 0.5);

  // difficulty bonus
  const difficultyBonus = {
    simple: 0,
    medium: 1,
    hard: 2,
    ultra: 3,
  }[difficulty] || 0;

  const rawScore = baseScore + timeBonus + accuracyBonus + difficultyBonus;
  const score = Math.max(1, Math.min(10, Math.round(rawScore)));

  return {
    puzzleId: '',
    score,
    timeBonus: Math.round(timeBonus * 10) / 10,
    accuracyBonus: Math.round(accuracyBonus * 10) / 10,
    attemptsDeduction: 0,
    timestamp: Date.now(),
  };
}

/**
 * Calculate ELO rating change based on expected vs actual performance
 */
export function calculateEloChange(
  currentElo: number,
  puzzleRating: number,
  solved: boolean,
  kFactor: number = 32
): number {
  // expected score (0-1)
  const expectedScore = 1 / (1 + Math.pow(10, (puzzleRating - currentElo) / 400));

  // actual score: 1 if solved, 0 if failed
  const actualScore = solved ? 1 : 0;

  // elo change
  const eloChange = Math.round(kFactor * (actualScore - expectedScore));

  return eloChange;
}

/**
 * Get league based on ELO rating
 */
export function getLeagueFromElo(elo: number): League {
  if (elo < 800) return 'stone';
  if (elo < 1000) return 'bronze';
  if (elo < 1200) return 'silver';
  if (elo < 1400) return 'gold';
  if (elo < 1600) return 'platinum';
  if (elo < 1800) return 'diamond';
  return 'master';
}

/**
 * Calculate streak count and check if it should reset
 */
export function calculateStreak(
  currentStreak: number,
  lastPlayedDate: number,
  sessionDuration: number // minutes
): { newStreak: number; isReset: boolean; earnedStreak: boolean } {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysSinceLastPlayed = (now - lastPlayedDate) / oneDayMs;

  // reset if more than 2 days without playing
  if (daysSinceLastPlayed > 2) {
    // find last permanent badge
    const permanentStreakValues = [10, 20, 30, 50, 75, 100, 150, 200];
    let permanentStreak = 0;
    for (const val of permanentStreakValues) {
      if (currentStreak >= val) {
        permanentStreak = val;
      }
    }
    return {
      newStreak: permanentStreak,
      isReset: true,
      earnedStreak: false,
    };
  }

  // check if session counts as a streak (10+ minutes)
  const earnedStreak = sessionDuration >= 10;

  // check if already played today
  const today = new Date(now).toDateString();
  const lastPlayed = new Date(lastPlayedDate).toDateString();
  const alreadyPlayedToday = today === lastPlayed;

  if (earnedStreak && !alreadyPlayedToday) {
    return {
      newStreak: currentStreak + 1,
      isReset: false,
      earnedStreak: true,
    };
  }

  return {
    newStreak: currentStreak,
    isReset: false,
    earnedStreak: false,
  };
}

/**
 * Get recommended difficulty based on player performance
 */
export function getRecommendedDifficulty(
  playerLevel: PlayerLevel,
  elo: number,
  recentAccuracy: number
): 'simple' | 'medium' | 'hard' | 'ultra' {
  if (playerLevel === 'beginner') {
    if (elo < 600) return 'simple';
    if (elo < 800) return recentAccuracy > 0.7 ? 'medium' : 'simple';
    return 'medium';
  }

  // amateur
  if (elo < 1000) return recentAccuracy > 0.75 ? 'medium' : 'simple';
  if (elo < 1200) return recentAccuracy > 0.75 ? 'hard' : 'medium';
  if (elo < 1500) return recentAccuracy > 0.75 ? 'ultra' : 'hard';
  return 'ultra';
}

/**
 * Check if player qualifies for hint based on play time
 */
export function canUseHint(totalPlayTime: number, playerLevel: PlayerLevel): boolean {
  // beginners with less than 60 minutes get unrestricted hints
  if (playerLevel === 'beginner' && totalPlayTime < 60) {
    return true;
  }

  // amateurs always have access to hints (but indirect)
  return true;
}

/**
 * Generate indirect hint (piece type only)
 */
export function generateIndirectHint(fullHint: string | null): string | null {
  if (!fullHint) return null;

  // extract piece type from SAN notation
  const pieceMap: Record<string, string> = {
    N: 'Knight',
    B: 'Bishop',
    R: 'Rook',
    Q: 'Queen',
    K: 'King',
  };

  const firstChar = fullHint[0];
  if (pieceMap[firstChar]) {
    return `Try moving your ${pieceMap[firstChar]}`;
  }

  // pawn move (no prefix)
  return 'Try moving a Pawn';
}
