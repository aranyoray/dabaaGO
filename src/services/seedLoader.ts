// load seed puzzle data on app initialization

import { importSeedData, getStoredPuzzleCount } from './puzzleImporter';
import { getAllPuzzles } from './localStore';
import type { Puzzle } from '../types';

// load seed data from json file
export async function loadSeedData(): Promise<void> {
  try {
    const count = await getStoredPuzzleCount();
    if (count > 0) {
      // puzzles already loaded
      return;
    }

    // load seed.json
    const response = await fetch('/data/seed.json');
    if (!response.ok) {
      console.warn('seed.json not found, app will work with empty puzzle set');
      return;
    }

    const seedData: Puzzle[] = await response.json();
    await importSeedData(seedData);
    console.log(`loaded ${seedData.length} seed puzzles`);
  } catch (error) {
    console.error('failed to load seed data:', error);
    // app continues without puzzles - user can import manually
  }
}

