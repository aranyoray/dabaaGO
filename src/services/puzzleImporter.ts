// puzzle import service: downloads and preprocesses puzzle datasets

import { Chess } from 'chess.js';
import type { Puzzle } from '../types';
import { savePuzzles, getPuzzleCount } from './localStore';

const PUZZLE_SOURCES = {
  '432k-fen': 'https://raw.githubusercontent.com/rebeccaloran/432k-chess-puzzles/main/puzzles.txt',
  'lichess-puzzles': 'https://database.lichess.org/standard/lichess_db_puzzle.csv.zst',
  'chess-puzzles-api': 'https://chess-puzzles-api.vercel.app/api/puzzles',
};

// parse fen puzzle line (format: fen solution_moves rating theme)
export function parseFenPuzzleLine(line: string, index: number): Puzzle | null {
  try {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const fen = parts[0];
    const solution = parts[1].split(',').filter(Boolean);
    
    if (!fen || solution.length === 0) return null;

    // validate fen with chess.js
    try {
      const chess = new Chess(fen);
      if (!chess) return null;
    } catch {
      return null;
    }

    // estimate difficulty from solution length and piece count
    const pieceCount = fen.split(' ')[0].split('/').join('').replace(/\d/g, '').length;
    let difficulty: 'simple' | 'medium' | 'hard' | 'ultra' = 'medium';
    if (solution.length <= 2) difficulty = 'simple';
    else if (solution.length <= 4) difficulty = 'medium';
    else if (solution.length <= 6) difficulty = 'hard';
    else difficulty = 'ultra';

    const rating = parts[2] ? parseInt(parts[2], 10) : undefined;
    const theme = parts[3] ? [parts[3]] : undefined;

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
  } catch (error) {
    console.warn(`failed to parse puzzle line ${index}:`, error);
    return null;
  }
}

// download and parse 432k fen dataset
export async function import432kFenDataset(): Promise<number> {
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

        // batch save every 1000 puzzles
        if (puzzles.length >= 1000) {
          await savePuzzles(puzzles);
          puzzles.length = 0;
        }
      }
    }

    // save remaining puzzles
    if (puzzles.length > 0) {
      await savePuzzles(puzzles);
    }

    return validCount;
  } catch (error) {
    console.error('failed to import 432k fen dataset:', error);
    throw error;
  }
}

// import from local seed file
export async function importSeedData(seedData: Puzzle[]): Promise<number> {
  try {
    await savePuzzles(seedData);
    return seedData.length;
  } catch (error) {
    console.error('failed to import seed data:', error);
    throw error;
  }
}

// deduplicate puzzles by fen
export function deduplicatePuzzles(puzzles: Puzzle[]): Puzzle[] {
  const seen = new Set<string>();
  const unique: Puzzle[] = [];

  for (const puzzle of puzzles) {
    const key = puzzle.fen.split(' ')[0]; // just position part of fen
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(puzzle);
    }
  }

  return unique;
}

// normalize fen (remove move counters, ensure standard format)
export function normalizeFen(fen: string): string {
  try {
    const chess = new Chess(fen);
    return chess.fen();
  } catch {
    return fen;
  }
}

// get puzzle count from storage
export async function getStoredPuzzleCount(): Promise<number> {
  return getPuzzleCount();
}

