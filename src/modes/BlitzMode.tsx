// blitz puzzle mode: continuous stream with time limit per puzzle

import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '../components/Board';
import { Timer } from '../components/Timer';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types';
import { getPuzzlesByDifficulty, getAllPuzzles } from '../services/localStore';
import { saveProgress, getStats, setStats } from '../services/localStore';
import type { Square } from 'chess.js';

interface BlitzModeProps {
  timeLimit: number; // milliseconds
  difficulty: 'simple' | 'medium' | 'hard' | 'ultra' | 'adaptive';
  onExit: () => void;
}

export function BlitzMode({ timeLimit, difficulty, onExit }: BlitzModeProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const puzzle = usePuzzle(currentPuzzle);

  // load initial puzzle
  useEffect(() => {
    loadNextPuzzle();
  }, []);

  const loadNextPuzzle = async () => {
    setIsLoading(true);
    setHintMessage(null);
    try {
      let puzzles: Puzzle[];
      if (difficulty === 'adaptive') {
        // adaptive: select based on current performance
        const allPuzzles = await getAllPuzzles();
        puzzles = allPuzzles;
      } else {
        puzzles = await getPuzzlesByDifficulty(difficulty, 100);
      }

      if (puzzles.length === 0) {
        console.error('no puzzles available');
        return;
      }

      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      setCurrentPuzzle(randomPuzzle);
      setTimeRemaining(timeLimit);
      setIsLoading(false);
    } catch (error) {
      console.error('failed to load puzzle:', error);
      setIsLoading(false);
    }
  };

  const handleMove = useCallback((from: Square, to: Square) => {
    puzzle.makeMove(from, to);
  }, [puzzle]);

  const handleTimeout = useCallback(async () => {
    if (currentPuzzle) {
      try {
        // save failed attempt
        await saveProgress({
          puzzleId: currentPuzzle.id,
          solved: false,
          attempts: 1,
        });

        // update stats for failed attempt
        const stats = await getStats();
        if (stats) {
          const newTotalPuzzles = stats.totalPuzzles + 1;
          const newAccuracy = stats.solvedPuzzles / newTotalPuzzles;
          const diffBreakdown = { ...stats.difficultyBreakdown };
          if (currentPuzzle.difficulty && diffBreakdown[currentPuzzle.difficulty]) {
            diffBreakdown[currentPuzzle.difficulty].attempted += 1;
          }

          await setStats({
            ...stats,
            totalPuzzles: newTotalPuzzles,
            currentStreak: 0,
            accuracy: newAccuracy,
            difficultyBreakdown: diffBreakdown,
          });
        }
      } catch (error) {
        console.error('failed to save progress or stats:', error);
      }

      setStreak(0);
      // show failure message briefly, then next puzzle
      setTimeout(() => {
        loadNextPuzzle();
      }, 2000);
    }
  }, [currentPuzzle]);

  const handleSolved = useCallback(async () => {
    if (currentPuzzle) {
      const solveTime = timeLimit - timeRemaining;

      try {
        // save progress
        await saveProgress({
          puzzleId: currentPuzzle.id,
          solved: true,
          attempts: 1,
          bestTime: solveTime,
          lastAttempt: Date.now(),
          streak: streak + 1,
        });

        // update stats
        const stats = await getStats();
        if (stats) {
          const newSolvedPuzzles = stats.solvedPuzzles + 1;
          const newTotalPuzzles = stats.totalPuzzles + 1;
          const newTotalTime = stats.totalTime + solveTime;
          const newAccuracy = newSolvedPuzzles / newTotalPuzzles;
          const diffBreakdown = { ...stats.difficultyBreakdown };
          if (currentPuzzle.difficulty && diffBreakdown[currentPuzzle.difficulty]) {
            diffBreakdown[currentPuzzle.difficulty].attempted += 1;
            diffBreakdown[currentPuzzle.difficulty].solved += 1;
          }

          await setStats({
            ...stats,
            totalPuzzles: newTotalPuzzles,
            solvedPuzzles: newSolvedPuzzles,
            currentStreak: streak + 1,
            bestStreak: Math.max(stats.bestStreak, streak + 1),
            totalTime: newTotalTime,
            averageTime: newTotalTime / newSolvedPuzzles,
            accuracy: newAccuracy,
            difficultyBreakdown: diffBreakdown,
          });
        }
      } catch (error) {
        console.error('failed to save progress or stats:', error);
      }

      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);

      // show success briefly, then next puzzle
      setTimeout(() => {
        loadNextPuzzle();
      }, 1500);
    }
  }, [currentPuzzle, timeRemaining, streak]);

  useEffect(() => {
    if (puzzle.isSolved) {
      handleSolved();
    }
  }, [puzzle.isSolved, handleSolved]);

  if (isLoading || !currentPuzzle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading puzzle...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={onExit}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Exit
        </button>
        <div className="text-center">
          <div className="text-2xl font-bold">Score: {score}</div>
          <div className="text-sm text-gray-600">Streak: {streak}</div>
        </div>
      </div>

      <Timer
        initialTime={timeLimit}
        onTimeout={handleTimeout}
        onTick={setTimeRemaining}
        paused={puzzle.isSolved || puzzle.isFailed}
      />

      <ChessBoard
        fen={puzzle.chess.fen()}
        onMove={handleMove}
        legalMoves={puzzle.chess.moves({ verbose: true }).map(m => `${m.from}${m.to}`)}
        disabled={puzzle.isSolved || puzzle.isFailed}
      />

      {puzzle.isSolved && (
        <div className="text-2xl font-bold text-green-600 animate-puzzle-success">
          Correct! Next puzzle...
        </div>
      )}

      {puzzle.isFailed && (
        <div className="text-2xl font-bold text-red-600">
          Wrong move. Time's up!
        </div>
      )}

      {hintMessage && (
        <div className="text-lg text-blue-600 font-medium animate-fade-in">
          {hintMessage}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={async () => {
            try {
              const hint = await puzzle.getHint();
              if (hint) {
                setHintMessage(`Hint: Try ${hint}`);
                setTimeout(() => setHintMessage(null), 5000);
              } else {
                setHintMessage('No hint available (engine not configured)');
                setTimeout(() => setHintMessage(null), 3000);
              }
            } catch (error) {
              console.error('failed to get hint:', error);
              setHintMessage('Failed to get hint');
              setTimeout(() => setHintMessage(null), 3000);
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={puzzle.isSolved || puzzle.isFailed}
        >
          Hint
        </button>
        <button
          onClick={() => {
            puzzle.reset();
            setTimeRemaining(timeLimit);
            setHintMessage(null);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

