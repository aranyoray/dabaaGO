// script to download and preprocess puzzle datasets

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Puzzle } from '../src/types';

const DATA_DIR = join(process.cwd(), 'data');
const PUZZLE_SOURCES = {
  '432k-fen': 'https://raw.githubusercontent.com/rebeccaloran/432k-chess-puzzles/main/puzzles.txt',
};

// parse fen puzzle line
function parseFenPuzzleLine(line: string, index: number): Puzzle | null {
  try {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const fen = parts[0];
    const solution = parts[1].split(',').filter(Boolean);
    
    if (!fen || solution.length === 0) return null;

    // estimate difficulty
    let difficulty: 'simple' | 'medium' | 'hard' | 'ultra' = 'medium';
    if (solution.length <= 2) difficulty = 'simple';
    else if (solution.length <= 4) difficulty = 'medium';
    else if (solution.length <= 6) difficulty = 'hard';
    else difficulty = 'ultra';

    const rating = parts[2] ? parseInt(parts[2], 10) : undefined;
    const theme = parts[3] ? [parts[3]] : undefined;
    const pieceCount = fen.split(' ')[0].split('/').join('').replace(/\d/g, '').length;

    return {
      id: `fen-${index}`,
      fen,
      solution,
      rating: rating && !isNaN(rating) ? rating : undefined,
      difficulty,
      theme,
      pieceCount,
      thumbnailFen: fen,
    };
  } catch {
    return null;
  }
}

async function fetch432kDataset(): Promise<Puzzle[]> {
  console.log('fetching 432k fen dataset...');
  
  try {
    const response = await fetch(PUZZLE_SOURCES['432k-fen']);
    if (!response.ok) {
      throw new Error(`http ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    const puzzles: Puzzle[] = [];
    let validCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const puzzle = parseFenPuzzleLine(lines[i], i);
      if (puzzle) {
        puzzles.push(puzzle);
        validCount++;
      }

      if (i % 10000 === 0) {
        console.log(`processed ${i} lines, ${validCount} valid puzzles`);
      }
    }

    console.log(`fetched ${validCount} valid puzzles from 432k dataset`);
    return puzzles;
  } catch (error) {
    console.error('failed to fetch 432k dataset:', error);
    throw error;
  }
}

async function deduplicatePuzzles(puzzles: Puzzle[]): Promise<Puzzle[]> {
  console.log('deduplicating puzzles...');
  const seen = new Set<string>();
  const unique: Puzzle[] = [];

  for (const puzzle of puzzles) {
    const key = puzzle.fen.split(' ')[0];
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(puzzle);
    }
  }

  console.log(`deduplicated: ${puzzles.length} -> ${unique.length} puzzles`);
  return unique;
}

async function buildSeed(puzzles: Puzzle[], count: number = 2000): Promise<Puzzle[]> {
  // select diverse puzzles across difficulties
  const byDifficulty = {
    simple: puzzles.filter(p => p.difficulty === 'simple'),
    medium: puzzles.filter(p => p.difficulty === 'medium'),
    hard: puzzles.filter(p => p.difficulty === 'hard'),
    ultra: puzzles.filter(p => p.difficulty === 'ultra'),
  };

  const seed: Puzzle[] = [];
  const perDifficulty = Math.floor(count / 4);

  for (const [difficulty, pool] of Object.entries(byDifficulty)) {
    const selected = pool
      .sort(() => Math.random() - 0.5)
      .slice(0, perDifficulty);
    seed.push(...selected);
  }

  // fill remaining slots randomly
  const remaining = count - seed.length;
  if (remaining > 0) {
    const random = puzzles
      .filter(p => !seed.includes(p))
      .sort(() => Math.random() - 0.5)
      .slice(0, remaining);
    seed.push(...random);
  }

  return seed;
}

async function main() {
  try {
    // ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    // fetch datasets
    let allPuzzles: Puzzle[] = [];
    
    try {
      const puzzles432k = await fetch432kDataset();
      allPuzzles.push(...puzzles432k);
    } catch (error) {
      console.warn('432k dataset fetch failed, will use seed only:', error);
    }

    // deduplicate
    if (allPuzzles.length > 0) {
      allPuzzles = await deduplicatePuzzles(allPuzzles);
    }

    // save full dataset if we have it
    if (allPuzzles.length > 0) {
      const fullPath = join(DATA_DIR, 'puzzles-full.json');
      await writeFile(fullPath, JSON.stringify(allPuzzles, null, 2));
      console.log(`saved full dataset to ${fullPath} (${allPuzzles.length} puzzles)`);
    }

    // build and save seed
    const seedPuzzles = allPuzzles.length > 0
      ? await buildSeed(allPuzzles, 2000)
      : [];
    
    const seedPath = join(DATA_DIR, 'seed.json');
    await writeFile(seedPath, JSON.stringify(seedPuzzles, null, 2));
    console.log(`saved seed dataset to ${seedPath} (${seedPuzzles.length} puzzles)`);

    console.log('dataset fetch complete!');
  } catch (error) {
    console.error('dataset fetch failed:', error);
    process.exit(1);
  }
}

main();

