// main app component with routing and mode selection

import { useState, useEffect } from 'react';
import { initDB } from './services/localStore';
import { initEngine } from './services/engine';
import { loadSeedData } from './services/seedLoader';
import { BlitzMode } from './modes/BlitzMode';
import { PracticeMode } from './modes/PracticeMode';
import { DailyPuzzleMode } from './modes/DailyPuzzle';
import { PuzzleRushMode } from './modes/PuzzleRush';
import { Settings } from './components/Settings';
import { Stats } from './components/Stats';
import { ExportImport } from './components/ExportImport';
import { ProfileDashboard } from './components/Profile/ProfileDashboard';
import { AchievementsPanel } from './components/Achievements/AchievementsPanel';
import { Leaderboard } from './components/Leaderboard/Leaderboard';
import { ContactForm } from './components/Contact/ContactForm';
import { PandaMascot } from './components/PandaMascot/PandaMascot';
import { getSettings, getAllPuzzles } from './services/localStore';
import { getUserProfile, updateUserProfile, awardBadge } from './services/profileService';
import { calculateStreak } from './utils/scoring';
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
  onShowProfile,
  onShowAchievements,
  onShowLeaderboard,
  onShowContact,
}: {
  onSelectMode: (mode: GameMode) => void;
  onShowSettings: () => void;
  onShowStats: () => void;
  onShowExportImport: () => void;
  onShowProfile: () => void;
  onShowAchievements: () => void;
  onShowLeaderboard: () => void;
  onShowContact: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2">🐼 Daaba</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Premium minimalist chess puzzles
          </p>
          <button
            onClick={onShowProfile}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            View Profile
          </button>
        </div>

        {/* Main game modes */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Play Modes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => onSelectMode('daily')}
              className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <h2 className="text-2xl font-bold mb-2">🌟 Daily Puzzle</h2>
              <p className="text-white opacity-90">
                One special puzzle per day. Come back daily!
              </p>
            </button>

            <button
              onClick={() => onSelectMode('blitz')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <h2 className="text-2xl font-bold mb-2">⚡ Blitz Puzzles</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fast-paced puzzles with time limits
              </p>
            </button>

            <button
              onClick={() => onSelectMode('puzzle-rush')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <h2 className="text-2xl font-bold mb-2">🔥 Puzzle Rush</h2>
              <p className="text-gray-600 dark:text-gray-400">
                15 minutes. How many can you solve?
              </p>
            </button>

            <button
              onClick={() => onSelectMode('practice')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left"
            >
              <h2 className="text-2xl font-bold mb-2">📚 Practice</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Unlimited time to learn and improve
              </p>
            </button>

            <button
              onClick={() => onSelectMode('timed-limited')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left opacity-60"
            >
              <h2 className="text-2xl font-bold mb-2">♟️ Limited Pieces</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon - Endgame focus
              </p>
            </button>

            <button
              onClick={() => onSelectMode('ultra')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left opacity-60"
            >
              <h2 className="text-2xl font-bold mb-2">💎 Ultra Mode</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon - Advanced mates
              </p>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onShowLeaderboard}
            className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={onShowAchievements}
            className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            🎯 Achievements
          </button>
          <button
            onClick={onShowStats}
            className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            📊 Statistics
          </button>
          <button
            onClick={onShowSettings}
            className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={onShowExportImport}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Export / Import
          </button>
          <button
            onClick={onShowContact}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            📧 Contact / Report Bug
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
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [pandaEvent, setPandaEvent] = useState<'solve' | 'badge' | 'streak' | 'levelup' | null>(null);
  const [pandaMessage, setPandaMessage] = useState<string>('');
  const [sessionStartTime] = useState(Date.now());

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
        // check and update streak on app start
        await checkAndUpdateStreak();
        setIsInitializing(false);
      } catch (err) {
        console.error('initialization failed:', err);
        setError('Failed to initialize app. Please refresh the page.');
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  const checkAndUpdateStreak = async () => {
    try {
      const profile = await getUserProfile();
      const sessionDuration = (Date.now() - sessionStartTime) / 60000; // minutes
      const streakResult = calculateStreak(
        profile.streakCount,
        profile.lastPlayedDate,
        sessionDuration
      );

      if (streakResult.isReset) {
        await updateUserProfile({
          streakCount: streakResult.newStreak,
          lastPlayedDate: Date.now(),
        });
      } else if (streakResult.earnedStreak) {
        // check for badge award
        const newBadge = await awardBadge(streakResult.newStreak);
        if (newBadge) {
          setPandaEvent('badge');
          setPandaMessage(`New badge: ${newBadge.name}! ${newBadge.icon}`);
        }
      }
    } catch (error) {
      console.error('failed to check streak:', error);
    }
  };

  // update play time on unmount
  useEffect(() => {
    return () => {
      const updatePlayTime = async () => {
        try {
          const profile = await getUserProfile();
          const sessionDuration = (Date.now() - sessionStartTime) / 60000;
          await updateUserProfile({
            totalPlayTime: profile.totalPlayTime + sessionDuration,
            lastPlayedDate: Date.now(),
          });
        } catch (error) {
          console.error('failed to update play time:', error);
        }
      };
      updatePlayTime();
    };
  }, [sessionStartTime]);

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

  // show profile dashboard if requested
  if (showProfile) {
    return (
      <>
        <ProfileDashboard onClose={() => setShowProfile(false)} />
        <PandaMascot
          event={pandaEvent}
          message={pandaMessage}
          onClose={() => setPandaEvent(null)}
        />
      </>
    );
  }

  // show achievements if requested
  if (showAchievements) {
    return (
      <>
        <AchievementsPanel />
        <button
          onClick={() => setShowAchievements(false)}
          className="fixed top-4 right-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </>
    );
  }

  // show leaderboard if requested
  if (showLeaderboard) {
    return (
      <>
        <Leaderboard />
        <button
          onClick={() => setShowLeaderboard(false)}
          className="fixed top-4 right-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </>
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
          onShowProfile={() => setShowProfile(true)}
          onShowAchievements={() => setShowAchievements(true)}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          onShowContact={() => setShowContact(true)}
        />
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        {showStats && <Stats onClose={() => setShowStats(false)} />}
        {showExportImport && <ExportImport onClose={() => setShowExportImport(false)} />}
        {showContact && <ContactForm onClose={() => setShowContact(false)} />}
        <PandaMascot
          event={pandaEvent}
          message={pandaMessage}
          onClose={() => setPandaEvent(null)}
        />
      </>
    );
  }

  // game modes
  if (mode === 'daily') {
    return (
      <>
        <DailyPuzzleMode onExit={() => setMode(null)} />
        <PandaMascot
          event={pandaEvent}
          message={pandaMessage}
          onClose={() => setPandaEvent(null)}
        />
      </>
    );
  }

  if (mode === 'blitz') {
    return (
      <>
        <BlitzMode
          timeLimit={(settings?.timeLimit || 60) * 1000}
          difficulty={settings?.difficulty || 'adaptive'}
          onExit={() => setMode(null)}
        />
        <PandaMascot
          event={pandaEvent}
          message={pandaMessage}
          onClose={() => setPandaEvent(null)}
        />
      </>
    );
  }

  if (mode === 'puzzle-rush') {
    return (
      <>
        <PuzzleRushMode onExit={() => setMode(null)} />
        <PandaMascot
          event={pandaEvent}
          message={pandaMessage}
          onClose={() => setPandaEvent(null)}
        />
      </>
    );
  }

  if (mode === 'practice') {
    return (
      <>
        <PracticeModeWrapper onExit={() => setMode(null)} />
        <PandaMascot
          event={pandaEvent}
          message={pandaMessage}
          onClose={() => setPandaEvent(null)}
        />
      </>
    );
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

