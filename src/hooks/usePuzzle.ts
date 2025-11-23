// hook for managing puzzle game state

import { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import type { Puzzle } from '../types';
import { getPuzzle, saveProgress, getProgress } from '../services/localStore';
import { getHint, verifySolution } from '../services/engine';

interface UsePuzzleResult {
  chess: Chess;
  currentMove: number;
  userMoves: string[];
  isSolved: boolean;
  isFailed: boolean;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  getHint: () => Promise<string | null>;
  reset: () => void;
  checkSolution: () => Promise<boolean>;
}

export function usePuzzle(puzzle: Puzzle | null): UsePuzzleResult {
  const [chess, setChess] = useState<Chess>(new Chess());
  const [currentMove, setCurrentMove] = useState(0);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  // initialize puzzle
  useEffect(() => {
    if (puzzle) {
      const newChess = new Chess(puzzle.fen);
      setChess(newChess);
      setCurrentMove(0);
      setUserMoves([]);
      setIsSolved(false);
      setIsFailed(false);
    }
  }, [puzzle]);

  const makeMove = useCallback((from: Square, to: Square, promotion?: string): boolean => {
    if (isSolved || isFailed || !puzzle) return false;

    try {
      const move = chess.move({ from, to, promotion });
      if (!move) return false;

      const moveSan = move.san;
      setUserMoves(prev => [...prev, moveSan]);
      setCurrentMove(prev => prev + 1);

      // check if this matches the expected solution move
      const expectedMove = puzzle.solution[currentMove];
      if (moveSan === expectedMove) {
        // correct move
        if (currentMove + 1 >= puzzle.solution.length) {
          // puzzle solved
          setIsSolved(true);
        }
        return true;
      } else {
        // wrong move
        setIsFailed(true);
        return false;
      }
    } catch {
      return false;
    }
  }, [chess, puzzle, currentMove, isSolved, isFailed]);

  const getHintMove = useCallback(async (): Promise<string | null> => {
    if (!puzzle || isSolved || isFailed) return null;
    
    const expectedMove = puzzle.solution[currentMove];
    if (expectedMove) {
      // convert san to uci for hint
      const tempChess = new Chess(chess.fen());
      const move = tempChess.move(expectedMove);
      if (move) {
        return `${move.from}${move.to}`;
      }
    }
    
    // fallback to engine
    return getHint(chess.fen());
  }, [chess, puzzle, currentMove, isSolved, isFailed]);

  const checkSolution = useCallback(async (): Promise<boolean> => {
    if (!puzzle) return false;
    
    if (userMoves.length === puzzle.solution.length) {
      const matches = userMoves.every((move, i) => move === puzzle.solution[i]);
      if (matches) {
        // verify with engine if available
        await verifySolution(puzzle.fen, userMoves);
        return true;
      }
    }
    return false;
  }, [puzzle, userMoves]);

  const reset = useCallback(() => {
    if (puzzle) {
      const newChess = new Chess(puzzle.fen);
      setChess(newChess);
      setCurrentMove(0);
      setUserMoves([]);
      setIsSolved(false);
      setIsFailed(false);
    }
  }, [puzzle]);

  return {
    chess,
    currentMove,
    userMoves,
    isSolved,
    isFailed,
    makeMove,
    getHint: getHintMove,
    reset,
    checkSolution,
  };
}

