// stats component showing user progress and leaderboards

import { useState, useEffect } from 'react';
import { getStats } from '../../services/localStore';
import type { UserStats } from '../../types';

interface StatsProps {
  onClose: () => void;
}

export function Stats({ onClose }: StatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getStats().then(s => {
      if (s) setStats(s);
    });
  }, []);

  if (!stats) {
    return <div>Loading stats...</div>;
  }

  const accuracy = stats.totalPuzzles > 0
    ? ((stats.solvedPuzzles / stats.totalPuzzles) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Statistics</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Puzzles</div>
              <div className="text-2xl font-bold">{stats.totalPuzzles}</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Solved</div>
              <div className="text-2xl font-bold">{stats.solvedPuzzles}</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
              <div className="text-2xl font-bold">{stats.bestStreak}</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              <div className="text-2xl font-bold">{accuracy}%</div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Time</div>
              <div className="text-2xl font-bold">
                {stats.averageTime > 0 ? `${Math.round(stats.averageTime / 1000)}s` : 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">Difficulty Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(stats.difficultyBreakdown).map(([difficulty, data]) => (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className="capitalize">{difficulty}</span>
                  <span>
                    {data.solved} / {data.attempted}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

