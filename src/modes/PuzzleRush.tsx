// puzzle rush: solve as many puzzles as possible in 15 minutes

import { useState, useEffect, useCallback } from 'react';
import { ChessBoard } from '../components/Board';
import { Timer } from '../components/Timer';
import { usePuzzle } from '../hooks/usePuzzle';
import type { Puzzle } from '../types';
import { getPuzzlesByDifficulty } from '../services/localStore';
import { getUserProfile, savePuzzleScore } from '../services/profileService';
import { calculatePuzzleScore } from '../utils/scoring';
import type { Square } from 'chess.js';

interface PuzzleRushProps {
  onExit: () => void;
}

export function PuzzleRushMode({ onExit }: PuzzleRushProps) {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
   // 15 minutes
  const [isGameOver, setIsGameOver] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());

  const puzzle = usePuzzle(currentPuzzle);

  useEffect(() => {
    loadNextPuzzle();
  }, []);

  const loadNextPuzzle = async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      const difficulty = profile.elo < 800 ? 'simple' : profile.elo < 1200 ? 'medium' : 'hard';
      const puzzles = await getPuzzlesByDifficulty(difficulty, 100);

      if (puzzles.length === 0) {
        console.error('no puzzles available');
        return;
      }

      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      setCurrentPuzzle(randomPuzzle);
      setPuzzleStartTime(Date.now());
      setIsLoading(false);
    } catch (error) {
      console.error('failed to load puzzle:', error);
      setIsLoading(false);
    }
  };

  const handleMove = useCallback((from: Square, to: Square) => {
    puzzle.makeMove(from, to);
  }, [puzzle]);

  const handleSolved = useCallback(async () => {
    if (!currentPuzzle) return;

    const timeTaken = Date.now() - puzzleStartTime;
    const puzzleScore = calculatePuzzleScore(30000, timeTaken, 1, currentPuzzle.difficulty);

    // consecutive wins get multiplier
    const streakMultiplier = 1 + (streak * 0.1);
    const finalScore = Math.round(puzzleScore.score * streakMultiplier);

    setScore(prev => prev + finalScore);
    setSolved(prev => prev + 1);
    setStreak(prev => prev + 1);

    try {
      await savePuzzleScore({
        ...puzzleScore,
        puzzleId: currentPuzzle.id,
        score: finalScore,
      });
    } catch (error) {
      console.error('failed to save score:', error);
    }

    setTimeout(() => {
      loadNextPuzzle();
    }, 1000);
  }, [currentPuzzle, streak, puzzleStartTime]);

  const handleFailed = useCallback(() => {
    setStreak(0);
    setTimeout(() => {
      loadNextPuzzle();
    }, 1500);
  }, []);

  const handleTimeout = useCallback(() => {
    setIsGameOver(true);
  }, []);

  useEffect(() => {
    if (puzzle.isSolved) {
      handleSolved();
    } else if (puzzle.isFailed) {
      handleFailed();
    }
  }, [puzzle.isSolved, puzzle.isFailed, handleSolved, handleFailed]);

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Puzzle Rush Complete! 🎯</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">{score}</div>
          <p className="text-xl mb-2">Final Score</p>
          <p className="text-lg text-gray-600 mb-6">
            Puzzles Solved: {solved}
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
          <div className="text-sm text-gray-600">
            Solved: {solved} | Streak: {streak} 🔥
          </div>
        </div>
      </div>

      <Timer
        initialTime={15 * 60 * 1000}
        onTimeout={handleTimeout}
        onTick={() => {}}
        paused={false}
      />

      <ChessBoard
        fen={puzzle.chess.fen()}
        onMove={handleMove}
        legalMoves={puzzle.chess.moves({ verbose: true }).map(m => `${m.from}${m.to}`)}
        disabled={puzzle.isSolved || puzzle.isFailed}
      />

      {puzzle.isSolved && (
        <div className="text-2xl font-bold text-green-600 animate-pulse">
          Correct! +{Math.round((1 + streak * 0.1) * 100)}
        </div>
      )}

      {puzzle.isFailed && (
        <div className="text-2xl font-bold text-red-600">
          Streak broken!
        </div>
      )}
    </div>
  );
}
