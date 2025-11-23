import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import type { Puzzle } from '../src/types';

describe('Puzzle validation', () => {
  it('should validate puzzle fen', () => {
    const puzzle: Puzzle = {
      id: 'test-1',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      solution: ['e4'],
      difficulty: 'simple',
    };

    const chess = new Chess(puzzle.fen);
    expect(chess.fen()).toBe(puzzle.fen);
  });

  it('should validate solution moves', () => {
    const puzzle: Puzzle = {
      id: 'test-2',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      solution: ['e4', 'e5'],
      difficulty: 'medium',
    };

    const chess = new Chess(puzzle.fen);
    const move1 = chess.move(puzzle.solution[0]);
    expect(move1).toBeTruthy();
    
    const move2 = chess.move(puzzle.solution[1]);
    expect(move2).toBeTruthy();
  });
});

describe('Move validation', () => {
  it('should reject illegal moves', () => {
    const chess = new Chess();
    const move = chess.move({ from: 'e2', to: 'e5' });
    expect(move).toBeNull();
  });

  it('should accept legal moves', () => {
    const chess = new Chess();
    const move = chess.move({ from: 'e2', to: 'e4' });
    expect(move).toBeTruthy();
  });
});

