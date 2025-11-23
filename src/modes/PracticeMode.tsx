// practice mode: unlimited time, show solution on request

import { useState, useCallback } from 'react';
import { ChessBoard } from '../components/Board';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types';
import type { Square } from 'chess.js';

interface PracticeModeProps {
  puzzle: Puzzle;
  onNext: () => void;
  onExit: () => void;
}

export function PracticeMode({ puzzle: initialPuzzle, onNext, onExit }: PracticeModeProps) {
  const [showSolution, setShowSolution] = useState(false);
  const puzzle = usePuzzle(initialPuzzle);

  const handleMove = useCallback((from: Square, to: Square) => {
    puzzle.makeMove(from, to);
  }, [puzzle]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={onExit}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Exit
        </button>
        <div className="text-sm text-gray-600">
          Practice Mode - No time limit
        </div>
      </div>

      <ChessBoard
        fen={puzzle.chess.fen()}
        onMove={handleMove}
        legalMoves={puzzle.chess.moves({ verbose: true }).map(m => `${m.from}${m.to}`)}
        disabled={puzzle.isSolved || puzzle.isFailed || showSolution}
      />

      {puzzle.isSolved && (
        <div className="text-2xl font-bold text-green-600">
          Correct! Well done.
        </div>
      )}

      {puzzle.isFailed && (
        <div className="text-2xl font-bold text-red-600">
          That's not the right move. Try again.
        </div>
      )}

      {showSolution && (
        <div className="bg-gray-100 p-4 rounded">
          <div className="font-bold mb-2">Solution:</div>
          <div className="font-mono">
            {initialPuzzle.solution.join(' ')}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showSolution ? 'Hide' : 'Show'} Solution
        </button>
        <button
          onClick={puzzle.reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Next Puzzle
        </button>
      </div>
    </div>
  );
}

