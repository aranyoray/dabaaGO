// practice mode: unlimited time, show solution on request

import { useState, useCallback } from 'react';
import { ChessBoard } from '../components/Board';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types';
import type { Square } from 'chess.js';
import { generateTacticalHint, generateInstructionalHint } from '../utils/puzzleValidator';

interface PracticeModeProps {
  puzzle: Puzzle;
  onNext: () => void;
  onExit: () => void;
}

export function PracticeMode({ puzzle: initialPuzzle, onNext, onExit }: PracticeModeProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const puzzle = usePuzzle(initialPuzzle);

  const handleMove = useCallback((from: Square, to: Square) => {
    const success = puzzle.makeMove(from, to);

    if (!success && !puzzle.isSolved) {
      // wrong move - show encouraging feedback
      const encouragingMessages = [
        "Keep exploring! 🤔",
        "Try another move! 💪",
        "What else could work? 🌟",
        "You're learning! Try again 🚀",
      ];

      if (initialPuzzle?.mainTactic) {
        const tacticalHint = generateTacticalHint(initialPuzzle);
        setEncouragement(tacticalHint);
      } else {
        const msg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        setEncouragement(msg);
      }
      setTimeout(() => setEncouragement(null), 3000);
    }
  }, [puzzle, initialPuzzle]);

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

      <div className="flex flex-col items-center gap-3">
        <div className="text-lg font-bold bg-green-100 dark:bg-green-900 px-6 py-2 rounded-full">
          You're playing as {puzzle.chess.turn() === 'w' ? 'White ♔' : 'Black ♚'}
        </div>
        <div className="text-base font-bold text-purple-700 bg-purple-100 px-6 py-3 rounded-lg">
          {generateInstructionalHint(initialPuzzle, puzzle.currentMove)}
        </div>
      </div>

      <ChessBoard
        fen={puzzle.chess.fen()}
        orientation={puzzle.chess.turn() === 'w' ? 'white' : 'black'}
        onMove={handleMove}
        legalMoves={puzzle.chess.moves({ verbose: true }).map(m => `${m.from}${m.to}`)}
        disabled={puzzle.isSolved || puzzle.isFailed || showSolution}
      />

      {puzzle.isSolved && (
        <div className="text-2xl font-bold text-green-600 animate-puzzle-success">
          Excellent! You solved it! 🎉
        </div>
      )}

      {encouragement && !puzzle.isSolved && (
        <div className="text-lg font-medium text-purple-600 animate-fade-in p-4 bg-purple-50 rounded-lg">
          {encouragement}
        </div>
      )}

      {puzzle.wrongMoveCount > 0 && !puzzle.isSolved && !showSolution && (
        <div className="text-sm text-gray-500 italic">
          Take your time - there's no rush! Every try helps you learn 🌱
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

