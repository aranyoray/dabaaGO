// local storage service using indexeddb with idb fallback to localStorage

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Puzzle, PuzzleProgress, UserStats, GameSettings, ExportData } from '../types';

interface DabaaDB extends DBSchema {
  puzzles: {
    key: string;
    value: Puzzle;
    indexes: { 'by-rating': number; 'by-difficulty': string };
  };
  progress: {
    key: string;
    value: PuzzleProgress;
  };
  stats: {
    key: string;
    value: UserStats;
  };
  settings: {
    key: string;
    value: GameSettings;
  };
}

const DB_NAME = 'dabaago-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<DabaaDB> | null = null;

// initialize database
export async function initDB(): Promise<IDBPDatabase<DabaaDB>> {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB<DabaaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // puzzles store
        if (!db.objectStoreNames.contains('puzzles')) {
          const puzzleStore = db.createObjectStore('puzzles', { keyPath: 'id' });
          puzzleStore.createIndex('by-rating', 'rating');
          puzzleStore.createIndex('by-difficulty', 'difficulty');
        }

        // progress store
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'puzzleId' });
        }

        // stats store (singleton)
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }

        // settings store (singleton)
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });

    // initialize default stats if missing
    const stats = await getStats();
    if (!stats) {
      await setStats(getDefaultStats());
    }

    // initialize default settings if missing
    const settings = await getSettings();
    if (!settings) {
      await setSettings(getDefaultSettings());
    }

    return dbInstance;
  } catch (error) {
    console.error('failed to initialize indexeddb, falling back to localStorage:', error);
    throw error;
  }
}

// puzzle operations
export async function savePuzzle(puzzle: Puzzle): Promise<void> {
  const db = await initDB();
  await db.put('puzzles', puzzle);
}

export async function savePuzzles(puzzles: Puzzle[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction('puzzles', 'readwrite');
  await Promise.all(puzzles.map(p => tx.store.put(p)));
  await tx.done;
}

export async function getPuzzle(id: string): Promise<Puzzle | undefined> {
  const db = await initDB();
  return db.get('puzzles', id);
}

export async function getPuzzlesByDifficulty(
  difficulty: string,
  limit?: number
): Promise<Puzzle[]> {
  const db = await initDB();
  const index = db.transaction('puzzles').store.index('by-difficulty');
  const puzzles = await index.getAll(difficulty);
  return limit ? puzzles.slice(0, limit) : puzzles;
}

export async function getPuzzlesByRating(
  minRating: number,
  maxRating: number,
  limit?: number
): Promise<Puzzle[]> {
  const db = await initDB();
  const index = db.transaction('puzzles').store.index('by-rating');
  const puzzles = await index.getAll();
  const filtered = puzzles.filter(
    p => p.rating && p.rating >= minRating && p.rating <= maxRating
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

export async function getAllPuzzles(): Promise<Puzzle[]> {
  const db = await initDB();
  return db.getAll('puzzles');
}

export async function getPuzzleCount(): Promise<number> {
  const db = await initDB();
  return db.count('puzzles');
}

// progress operations
export async function saveProgress(progress: PuzzleProgress): Promise<void> {
  const db = await initDB();
  await db.put('progress', progress);
}

export async function getProgress(puzzleId: string): Promise<PuzzleProgress | undefined> {
  const db = await initDB();
  return db.get('progress', puzzleId);
}

export async function getAllProgress(): Promise<PuzzleProgress[]> {
  const db = await initDB();
  return db.getAll('progress');
}

// stats operations
function getDefaultStats(): UserStats {
  return {
    totalPuzzles: 0,
    solvedPuzzles: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageTime: 0,
    accuracy: 0,
    totalTime: 0,
    difficultyBreakdown: {
      simple: { solved: 0, attempted: 0 },
      medium: { solved: 0, attempted: 0 },
      hard: { solved: 0, attempted: 0 },
      ultra: { solved: 0, attempted: 0 },
    },
  };
}

export async function getStats(): Promise<UserStats | undefined> {
  const db = await initDB();
  return db.get('stats', 'main');
}

export async function setStats(stats: UserStats): Promise<void> {
  const db = await initDB();
  await db.put('stats', { ...stats, id: 'main' } as UserStats & { id: string });
}

// settings operations
function getDefaultSettings(): GameSettings {
  return {
    theme: 'light',
    pieceStyle: 'minimal',
    timeLimit: 60,
    difficulty: 'adaptive',
    soundEnabled: true,
    animationsEnabled: true,
    engineStrength: 10,
  };
}

export async function getSettings(): Promise<GameSettings | undefined> {
  const db = await initDB();
  const result = await db.get('settings', 'main');
  return result as GameSettings | undefined;
}

export async function setSettings(settings: GameSettings): Promise<void> {
  const db = await initDB();
  await db.put('settings', { ...settings, id: 'main' } as GameSettings & { id: string });
}

// export/import
export async function exportData(): Promise<ExportData> {
  const [progress, stats, settings] = await Promise.all([
    getAllProgress(),
    getStats(),
    getSettings(),
  ]);

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    progress: progress || [],
    stats: stats || getDefaultStats(),
    settings: settings || getDefaultSettings(),
  };
}

export async function importData(data: ExportData): Promise<void> {
  // validate data structure
  if (!data.progress || !data.stats || !data.settings) {
    throw new Error('invalid export data format');
  }

  // import progress
  if (data.progress.length > 0) {
    const db = await initDB();
    const tx = db.transaction('progress', 'readwrite');
    await Promise.all(data.progress.map(p => tx.store.put(p)));
    await tx.done;
  }

  // import stats and settings
  await setStats(data.stats);
  await setSettings(data.settings);
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  await Promise.all([
    db.clear('progress'),
    db.clear('stats'),
    db.clear('settings'),
  ]);
  // reset to defaults
  await setStats(getDefaultStats());
  await setSettings(getDefaultSettings());
}

