// daily puzzle mode - one special validated puzzle per day

import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '../components/Board';
import { Timer } from '../components/Timer';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types';
import { getAllPuzzles, saveProgress } from '../services/localStore';
import { getUserProfile, updateUserProfile, savePuzzleScore } from '../services/profileService';
import { calculatePuzzleScore, calculateEloChange } from '../utils/scoring';
import { generateTacticalHint, getTacticName, enhancePuzzleWithEngine, generateInstructionalHint } from '../utils/puzzleValidator';
import type { Square } from 'chess.js';

interface DailyPuzzleProps {
  onExit: () => void;
}

export function DailyPuzzleMode({ onExit }: DailyPuzzleProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [encouragement, setEncouragement] = useState<string | null>(null);

  const puzzle = usePuzzle(currentPuzzle);

  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  const loadDailyPuzzle = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toDateString();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const allPuzzles = await getAllPuzzles();
      if (allPuzzles.length === 0) {
        console.error('no puzzles available');
        return;
      }

      // get used puzzle IDs to prevent repeats
      const usedPuzzlesStr = localStorage.getItem('daily-puzzles-used');
      const usedPuzzles: string[] = usedPuzzlesStr ? JSON.parse(usedPuzzlesStr) : [];
      const availablePuzzles = allPuzzles.filter(p => !usedPuzzles.includes(p.id));
      const puzzlePool = availablePuzzles.length > 0 ? availablePuzzles : allPuzzles;

      // prefer puzzles with 2-7 moves
      const validPuzzles = puzzlePool.filter(p =>
        p.solution.length >= 2 && p.solution.length <= 7
      );
      const finalPool = validPuzzles.length > 0 ? validPuzzles : puzzlePool;

      // select deterministically
      let dailyPuzzle = finalPool[seed % finalPool.length];

      // enhance with tactical info and validate with Stockfish
      dailyPuzzle = await enhancePuzzleWithEngine(dailyPuzzle);

      setCurrentPuzzle(dailyPuzzle);

      // check if completed today
      const storageKey = `daily-puzzle-${today}`;
      const completed = localStorage.getItem(storageKey);
      setAlreadyCompleted(completed === 'true');

      // mark as used
      if (!usedPuzzles.includes(dailyPuzzle.id)) {
        usedPuzzles.push(dailyPuzzle.id);
        localStorage.setItem('daily-puzzles-used', JSON.stringify(usedPuzzles));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('failed to load daily puzzle:', error);
      setIsLoading(false);
    }
  };

  const handleMove = useCallback((from: Square, to: Square) => {
    setAttempts(prev => prev + 1);
    const success = puzzle.makeMove(from, to);

    if (!success && !puzzle.isSolved) {
      // wrong move - show encouraging feedback
      const encouragingMessages = [
        "Not quite! Think it through 🤔",
        "Try a different approach! 💡",
        "Keep exploring! You're learning 🌟",
        "Almost there! Try again 💪",
      ];

      if (currentPuzzle?.mainTactic) {
        const tacticName = getTacticName(currentPuzzle.mainTactic);
        encouragingMessages.push(`Think about the ${tacticName}! 🎯`);
      }

      const msg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      setEncouragement(msg);
      setTimeout(() => setEncouragement(null), 3000);
    }
  }, [puzzle, currentPuzzle]);

  const handleSolved = useCallback(async () => {
    if (!currentPuzzle) return;

    const timeTaken = Date.now() - startTime;
    const score = calculatePuzzleScore(120000, timeTaken, attempts, currentPuzzle.difficulty);

    try {
      await saveProgress({
        puzzleId: currentPuzzle.id,
        solved: true,
        attempts,
        bestTime: timeTaken,
        lastAttempt: Date.now(),
      });

      await savePuzzleScore({ ...score, puzzleId: currentPuzzle.id });

      const profile = await getUserProfile();
      const eloChange = calculateEloChange(
        profile.elo,
        currentPuzzle.rating || 1200,
        true
      );
      await updateUserProfile({ elo: profile.elo + eloChange });

      const today = new Date().toDateString();
      localStorage.setItem(`daily-puzzle-${today}`, 'true');
      setAlreadyCompleted(true);
    } catch (error) {
      console.error('failed to save progress:', error);
    }
  }, [currentPuzzle, attempts, startTime]);

  useEffect(() => {
    if (puzzle.isSolved) {
      handleSolved();
    }
  }, [puzzle.isSolved, handleSolved]);

  if (isLoading || !currentPuzzle) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-lg">Loading daily puzzle...</div>
      </div>
    );
  }

  if (alreadyCompleted && puzzle.isSolved) {
    return (
      <div className="flex flex-col items-center gap-6 p-4 sm:p-6 min-h-screen justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Daily Puzzle Complete! 🎉</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            You've already completed today's puzzle.
            <br />
            Come back tomorrow for a new challenge!
          </p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6 min-h-screen">
      <div className="flex items-center justify-between w-full max-w-2xl flex-wrap gap-4">
        <button
          onClick={onExit}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm sm:text-base"
        >
          ← Exit
        </button>
        <div className="text-center flex-1">
          <div className="text-xl sm:text-2xl font-bold">Daily Puzzle 🌟</div>
          <div className="text-xs sm:text-sm text-gray-600">
            {currentPuzzle.difficulty} • {currentPuzzle.solution.length} moves
          </div>
        </div>
        <div className="w-16 sm:w-20" />
      </div>

      <Timer
        initialTime={120000}
        onTimeout={() => {}}
        onTick={() => {}}
        paused={puzzle.isSolved || puzzle.isFailed}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="text-base sm:text-lg font-bold bg-yellow-100 dark:bg-yellow-900 px-4 sm:px-6 py-2 rounded-full">
          You're playing as {puzzle.chess.turn() === 'w' ? 'White ♔' : 'Black ♚'}
        </div>
        <div className="text-sm sm:text-base font-bold text-purple-700 bg-purple-100 px-4 sm:px-6 py-3 rounded-lg">
          {generateInstructionalHint(currentPuzzle, puzzle.currentMove)}
        </div>
      </div>

      <div className="w-full max-w-md sm:max-w-lg">
        <ChessBoard
          fen={puzzle.chess.fen()}
          orientation={puzzle.chess.turn() === 'w' ? 'white' : 'black'}
          onMove={handleMove}
          legalMoves={puzzle.chess.moves({ verbose: true }).map(m => `${m.from}${m.to}`)}
          disabled={puzzle.isSolved || puzzle.isFailed}
        />
      </div>

      {puzzle.isSolved && (
        <div className="text-xl sm:text-2xl font-bold text-green-600 animate-puzzle-success text-center px-4">
          Excellent! Daily puzzle solved! 🌟
        </div>
      )}

      {encouragement && !puzzle.isSolved && (
        <div className="text-base sm:text-lg font-medium text-purple-600 animate-bounce-in p-3 sm:p-4 bg-purple-50 rounded-lg max-w-md text-center">
          {encouragement}
        </div>
      )}

      {puzzle.wrongMoveCount > 0 && !puzzle.isSolved && !puzzle.isFailed && (
        <div className="text-xs sm:text-sm text-gray-500 italic text-center px-4">
          Every attempt brings you closer to the solution! 🌱
        </div>
      )}

      {hintMessage && (
        <div className="text-sm sm:text-base text-blue-600 font-medium p-3 sm:p-4 bg-blue-50 rounded-lg max-w-md text-center">
          💡 {hintMessage}
        </div>
      )}

      {currentPuzzle.mainTactic && (
        <div className="text-xs sm:text-sm bg-gray-100 px-3 sm:px-4 py-2 rounded max-w-md text-center">
          <span className="font-medium">Tactic:</span> {getTacticName(currentPuzzle.mainTactic)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md px-4">
        <button
          onClick={() => {
            const hint = generateTacticalHint(currentPuzzle);
            setHintMessage(hint);
            setTimeout(() => setHintMessage(null), 10000);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base disabled:opacity-50"
          disabled={puzzle.isSolved}
        >
          💡 Get Hint
        </button>
        <button
          onClick={() => puzzle.reset()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm sm:text-base"
        >
          🔄 Reset
        </button>
      </div>

      <div className="text-xs sm:text-sm text-gray-600 text-center px-4">
        Attempts: {attempts}
      </div>
    </div>
  );
}
