// daily puzzle mode - one special puzzle per day

import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '../components/Board';
import { Timer } from '../components/Timer';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types';
import { getAllPuzzles, saveProgress } from '../services/localStore';
import { getUserProfile, updateUserProfile, savePuzzleScore } from '../services/profileService';
import { calculatePuzzleScore, calculateEloChange } from '../utils/scoring';
import type { Square } from 'chess.js';

interface DailyPuzzleProps {
  onExit: () => void;
}

export function DailyPuzzleMode({ onExit }: DailyPuzzleProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
   // 2 minutes
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const puzzle = usePuzzle(currentPuzzle);

  // load today's puzzle
  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  const loadDailyPuzzle = async () => {
    setIsLoading(true);
    try {
      // get today's date as seed
      const today = new Date().toDateString();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      const allPuzzles = await getAllPuzzles();
      if (allPuzzles.length === 0) {
        console.error('no puzzles available');
        return;
      }

      // select puzzle deterministically based on today's date
      const dailyPuzzle = allPuzzles[seed % allPuzzles.length];
      setCurrentPuzzle(dailyPuzzle);

      // check if already completed today
      const storageKey = `daily-puzzle-${today}`;
      const completed = localStorage.getItem(storageKey);
      setAlreadyCompleted(completed === 'true');

      setIsLoading(false);
    } catch (error) {
      console.error('failed to load daily puzzle:', error);
      setIsLoading(false);
    }
  };

  const handleMove = useCallback((from: Square, to: Square) => {
    setAttempts(prev => prev + 1);
    puzzle.makeMove(from, to);
  }, [puzzle]);

  const handleSolved = useCallback(async () => {
    if (!currentPuzzle) return;

    const timeTaken = Date.now() - startTime;
    const score = calculatePuzzleScore(120000, timeTaken, attempts, currentPuzzle.difficulty);

    try {
      // save progress
      await saveProgress({
        puzzleId: currentPuzzle.id,
        solved: true,
        attempts,
        bestTime: timeTaken,
        lastAttempt: Date.now(),
      });

      // save score
      await savePuzzleScore({ ...score, puzzleId: currentPuzzle.id });

      // update ELO
      const profile = await getUserProfile();
      const eloChange = calculateEloChange(
        profile.elo,
        currentPuzzle.rating || 1200,
        true
      );
      await updateUserProfile({ elo: profile.elo + eloChange });

      // mark as completed for today
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading daily puzzle...</div>
      </div>
    );
  }

  if (alreadyCompleted && puzzle.isSolved) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Daily Puzzle Complete! 🎉</h2>
          <p className="text-lg text-gray-600 mb-6">
            You've already completed today's puzzle.
            <br />
            Come back tomorrow for a new challenge!
          </p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Menu
          </button>
        </div>
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
          <div className="text-2xl font-bold">Daily Puzzle</div>
          <div className="text-sm text-gray-600">
            Difficulty: {currentPuzzle.difficulty}
          </div>
        </div>
        <div className="w-20" /> {/* spacer */}
      </div>

      <Timer
        initialTime={120000}
        onTimeout={() => {}}
        onTick={() => {}}
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
          Excellent! Daily puzzle solved! 🌟
        </div>
      )}

      {puzzle.isFailed && (
        <div className="text-2xl font-bold text-red-600">
          Not quite right. Try again!
        </div>
      )}

      <div className="text-sm text-gray-600">
        Attempts: {attempts}
      </div>
    </div>
  );
}
