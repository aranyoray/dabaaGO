// main app component with routing and mode selection

import { useState, useEffect } from 'react';
import { initDB } from './services/localStore';
import { initEngine } from './services/engine';
import { loadSeedData } from './services/seedLoader';
import { BlitzMode } from './modes/BlitzMode';
import { PracticeMode } from './modes/PracticeMode';
import { Settings } from './components/Settings';
import { Stats } from './components/Stats';
import { ExportImport } from './components/ExportImport';
import { getSettings, getPuzzlesByDifficulty, getAllPuzzles } from './services/localStore';
import type { GameMode, Puzzle, GameSettings } from './types';

// wrapper component to load puzzle for practice mode
function PracticeModeWrapper({ onExit }: { onExit: () => void }) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const puzzles = await getAllPuzzles();
        if (puzzles.length > 0) {
          const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
          setPuzzle(randomPuzzle);
        } else {
          // fallback demo puzzle
          setPuzzle({
            id: 'demo',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            solution: ['e4'],
            difficulty: 'simple',
          });
        }
      } catch (error) {
        console.error('failed to load puzzle:', error);
        setPuzzle({
          id: 'demo',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          solution: ['e4'],
          difficulty: 'simple',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadPuzzle();
  }, []);

  const loadNext = async () => {
    setIsLoading(true);
    try {
      const puzzles = await getAllPuzzles();
      if (puzzles.length > 0) {
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        setPuzzle(randomPuzzle);
      }
    } catch (error) {
      console.error('failed to load next puzzle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading puzzle...</div>
      </div>
    );
  }

  return <PracticeMode puzzle={puzzle} onNext={loadNext} onExit={onExit} />;
}

function ModePicker({ 
  onSelectMode,
  onShowSettings,
  onShowStats,
  onShowExportImport,
}: { 
  onSelectMode: (mode: GameMode) => void;
  onShowSettings: () => void;
  onShowStats: () => void;
  onShowExportImport: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl w-full p-8">
        <h1 className="text-5xl font-bold text-center mb-4">DabaaGO</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Premium minimalist chess puzzles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => onSelectMode('blitz')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <h2 className="text-2xl font-bold mb-2">Blitz Puzzles</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fast-paced puzzles with time limits. Test your speed and accuracy.
            </p>
          </button>

          <button
            onClick={() => onSelectMode('practice')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <h2 className="text-2xl font-bold mb-2">Practice</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Unlimited time to learn. Study solutions and improve your technique.
            </p>
          </button>

          <button
            onClick={() => onSelectMode('timed-limited')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <h2 className="text-2xl font-bold mb-2">Timed Limited-Piece</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Endgame puzzles with reduced pieces and short timers.
            </p>
          </button>

          <button
            onClick={() => onSelectMode('ultra')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <h2 className="text-2xl font-bold mb-2">Ultra Mode</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-move forced mate puzzles with strict timers.
            </p>
          </button>

          <button
            onClick={() => onSelectMode('progression')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <h2 className="text-2xl font-bold mb-2">Rated Progression</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Adaptive difficulty based on your performance.
            </p>
          </button>

          <button
            onClick={() => onSelectMode('daily')}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
          >
            <h2 className="text-2xl font-bold mb-2">Daily Puzzle</h2>
            <p className="text-gray-600 dark:text-gray-400">
              One special puzzle per day. Challenge yourself.
            </p>
          </button>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={onShowSettings}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Settings
          </button>
          <button
            onClick={onShowStats}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Statistics
          </button>
          <button
            onClick={onShowExportImport}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Export / Import
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);

  useEffect(() => {
    // initialize database and engine
    const init = async () => {
      try {
        await initDB();
        await loadSeedData(); // load seed puzzles
        await initEngine();
        const loadedSettings = await getSettings();
        if (loadedSettings) {
          setSettings(loadedSettings);
        }
        setIsInitializing(false);
      } catch (err) {
        console.error('initialization failed:', err);
        setError('Failed to initialize app. Please refresh the page.');
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Initializing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!mode) {
    return (
      <>
        <ModePicker 
          onSelectMode={setMode}
          onShowSettings={() => setShowSettings(true)}
          onShowStats={() => setShowStats(true)}
          onShowExportImport={() => setShowExportImport(true)}
        />
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        {showStats && <Stats onClose={() => setShowStats(false)} />}
        {showExportImport && <ExportImport onClose={() => setShowExportImport(false)} />}
      </>
    );
  }

  if (mode === 'blitz') {
    return (
      <BlitzMode
        timeLimit={(settings?.timeLimit || 60) * 1000}
        difficulty={settings?.difficulty || 'adaptive'}
        onExit={() => setMode(null)}
      />
    );
  }

  if (mode === 'practice') {
    return <PracticeModeWrapper onExit={() => setMode(null)} />;
  }

  // placeholder for other modes
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">{mode} mode</div>
        <div className="text-gray-600 mb-4">Coming soon</div>
        <button
          onClick={() => setMode(null)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to menu
        </button>
      </div>
    </div>
  );
}

