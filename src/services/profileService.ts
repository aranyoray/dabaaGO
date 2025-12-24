// user profile and progression management

import { openDB, type IDBPDatabase } from 'idb';
import type {
  UserProfile,
  Badge,
  Achievement,
  League,
  PuzzleScore,
} from '../types';
import { getLeagueFromElo } from '../utils/scoring';

const DB_NAME = 'dabaago-profile';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile');
        }
        if (!db.objectStoreNames.contains('scores')) {
          const scoresStore = db.createObjectStore('scores', { keyPath: 'puzzleId' });
          scoresStore.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Get or create user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const db = await getDB();
    let profile = await db.get('profile', 'current');

    if (!profile) {
      // create default profile
      profile = {
        level: 'beginner' as const,
        elo: 400,
        league: 'stone' as League,
        streakCount: 0,
        lastPlayedDate: Date.now(),
        badges: [],
        totalPlayTime: 0,
        hasCompletedTutorial: false,
      };
      await db.put('profile', profile, 'current');
    }

    return profile;
  } catch (error) {
    console.error('failed to get user profile:', error);
    // return default profile on error
    return {
      level: 'beginner',
      elo: 400,
      league: 'stone',
      streakCount: 0,
      lastPlayedDate: Date.now(),
      badges: [],
      totalPlayTime: 0,
      hasCompletedTutorial: false,
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  try {
    const db = await getDB();
    const current = await getUserProfile();
    const updated = { ...current, ...updates };

    // update league based on ELO if ELO changed
    if (updates.elo !== undefined) {
      updated.league = getLeagueFromElo(updated.elo);
    }

    await db.put('profile', updated, 'current');
  } catch (error) {
    console.error('failed to update user profile:', error);
    throw error;
  }
}

/**
 * Award badge for streak milestone
 */
export async function awardBadge(streakCount: number): Promise<Badge | null> {
  try {
    const badgeDefinitions: Record<number, Omit<Badge, 'earnedAt'>> = {
      10: {
        id: 'streak-10',
        name: 'Dedicated',
        description: 'Reached 10-day streak',
        icon: '🔥',
        requirement: 10,
      },
      20: {
        id: 'streak-20',
        name: 'Committed',
        description: 'Reached 20-day streak',
        icon: '⭐',
        requirement: 20,
      },
      30: {
        id: 'streak-30',
        name: 'Persistent',
        description: 'Reached 30-day streak',
        icon: '💎',
        requirement: 30,
      },
      50: {
        id: 'streak-50',
        name: 'Champion',
        description: 'Reached 50-day streak',
        icon: '👑',
        requirement: 50,
      },
      75: {
        id: 'streak-75',
        name: 'Master',
        description: 'Reached 75-day streak',
        icon: '🏆',
        requirement: 75,
      },
      100: {
        id: 'streak-100',
        name: 'Legend',
        description: 'Reached 100-day streak',
        icon: '🌟',
        requirement: 100,
      },
      150: {
        id: 'streak-150',
        name: 'Grandmaster',
        description: 'Reached 150-day streak',
        icon: '⚡',
        requirement: 150,
      },
      200: {
        id: 'streak-200',
        name: 'Immortal',
        description: 'Reached 200-day streak',
        icon: '🔱',
        requirement: 200,
      },
    };

    const badgeDefinition = badgeDefinitions[streakCount];
    if (!badgeDefinition) return null;

    const profile = await getUserProfile();

    // check if badge already earned
    const alreadyEarned = profile.badges.some(b => b.id === badgeDefinition.id);
    if (alreadyEarned) return null;

    // award badge
    const newBadge: Badge = {
      ...badgeDefinition,
      earnedAt: Date.now(),
    };

    profile.badges.push(newBadge);
    await updateUserProfile({ badges: profile.badges });

    return newBadge;
  } catch (error) {
    console.error('failed to award badge:', error);
    return null;
  }
}

/**
 * Save puzzle score
 */
export async function savePuzzleScore(score: PuzzleScore): Promise<void> {
  try {
    const db = await getDB();
    await db.put('scores', score);
  } catch (error) {
    console.error('failed to save puzzle score:', error);
    throw error;
  }
}

/**
 * Get recent puzzle scores
 */
export async function getRecentScores(limit: number = 10): Promise<PuzzleScore[]> {
  try {
    const db = await getDB();
    const tx = db.transaction('scores', 'readonly');
    const index = tx.store.index('timestamp');
    const scores = await index.getAll();

    return scores
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error('failed to get recent scores:', error);
    return [];
  }
}

/**
 * Initialize default achievements
 */
export async function getAchievements(): Promise<Achievement[]> {
  try {
    const db = await getDB();
    const achievements = await db.getAll('achievements');

    if (achievements.length === 0) {
      // create default achievements
      const defaultAchievements: Achievement[] = [
        {
          id: 'first-solve',
          name: 'First Steps',
          description: 'Solve your first puzzle',
          icon: '🎯',
          category: 'special',
          unlocked: false,
          progress: 0,
          target: 1,
        },
        {
          id: 'speed-demon',
          name: 'Speed Demon',
          description: 'Solve a puzzle in under 10 seconds',
          icon: '⚡',
          category: 'speed',
          unlocked: false,
          progress: 0,
          target: 1,
        },
        {
          id: 'perfect-score',
          name: 'Perfect!',
          description: 'Score 100 points on a puzzle',
          icon: '💯',
          category: 'score',
          unlocked: false,
          progress: 0,
          target: 1,
        },
        {
          id: 'streak-starter',
          name: 'Getting Started',
          description: 'Reach a 5-day streak',
          icon: '🔥',
          category: 'streak',
          unlocked: false,
          progress: 0,
          target: 5,
        },
        {
          id: 'accuracy-king',
          name: 'Accuracy King',
          description: 'Maintain 90% accuracy over 20 puzzles',
          icon: '🎖️',
          category: 'accuracy',
          unlocked: false,
          progress: 0,
          target: 20,
        },
      ];

      for (const achievement of defaultAchievements) {
        await db.put('achievements', achievement);
      }

      return defaultAchievements;
    }

    return achievements;
  } catch (error) {
    console.error('failed to get achievements:', error);
    return [];
  }
}

/**
 * Update achievement progress
 */
export async function updateAchievement(
  achievementId: string,
  progress: number
): Promise<Achievement | null> {
  try {
    const db = await getDB();
    const achievement = await db.get('achievements', achievementId);

    if (!achievement) return null;

    achievement.progress = Math.min(progress, achievement.target);

    if (achievement.progress >= achievement.target && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
    }

    await db.put('achievements', achievement);

    return achievement;
  } catch (error) {
    console.error('failed to update achievement:', error);
    return null;
  }
}

/**
 * Set player level (beginner/amateur)
 */
export async function setPlayerLevel(level: 'beginner' | 'amateur'): Promise<void> {
  try {
    await updateUserProfile({ level });
  } catch (error) {
    console.error('failed to set player level:', error);
    throw error;
  }
}

/**
 * Mark tutorial as completed
 */
export async function completeTutorial(): Promise<void> {
  try {
    await updateUserProfile({ hasCompletedTutorial: true });
  } catch (error) {
    console.error('failed to complete tutorial:', error);
    throw error;
  }
}
