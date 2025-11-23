// script to build compact seed from existing dataset

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Puzzle } from '../src/types';

const DATA_DIR = join(process.cwd(), 'data');
const SEED_COUNT = 2000;

async function main() {
  try {
    const fullPath = join(DATA_DIR, 'puzzles-full.json');
    const seedPath = join(DATA_DIR, 'seed.json');

    const fullData = await readFile(fullPath, 'utf-8');
    const allPuzzles: Puzzle[] = JSON.parse(fullData);

    // select diverse puzzles
    const byDifficulty = {
      simple: allPuzzles.filter(p => p.difficulty === 'simple'),
      medium: allPuzzles.filter(p => p.difficulty === 'medium'),
      hard: allPuzzles.filter(p => p.difficulty === 'hard'),
      ultra: allPuzzles.filter(p => p.difficulty === 'ultra'),
    };

    const seed: Puzzle[] = [];
    const perDifficulty = Math.floor(SEED_COUNT / 4);

    for (const [difficulty, pool] of Object.entries(byDifficulty)) {
      const selected = pool
        .sort(() => Math.random() - 0.5)
        .slice(0, perDifficulty);
      seed.push(...selected);
    }

    // fill remaining
    const remaining = SEED_COUNT - seed.length;
    if (remaining > 0) {
      const random = allPuzzles
        .filter(p => !seed.includes(p))
        .sort(() => Math.random() - 0.5)
        .slice(0, remaining);
      seed.push(...random);
    }

    await writeFile(seedPath, JSON.stringify(seed, null, 2));
    console.log(`built seed with ${seed.length} puzzles`);
  } catch (error) {
    console.error('seed build failed:', error);
    process.exit(1);
  }
}

main();

