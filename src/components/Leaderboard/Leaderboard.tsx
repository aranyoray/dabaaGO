// personal progress tracker - you are your biggest competition!

import { useState, useEffect } from 'react';
import type { League } from '../../types';
import type { UserProfile } from '../../types';
import { getUserProfile } from '../../services/profileService';
import { getStats } from '../../services/localStore';

const LEAGUE_ICONS: Record<League, string> = {
  stone: '🪨',
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💠',
  diamond: '💎',
  master: '👑',
};

const NEXT_LEAGUE: Record<League, { league: League; elo: number } | null> = {
  stone: { league: 'bronze', elo: 800 },
  bronze: { league: 'silver', elo: 1000 },
  silver: { league: 'gold', elo: 1200 },
  gold: { league: 'platinum', elo: 1400 },
  platinum: { league: 'diamond', elo: 1600 },
  diamond: { league: 'master', elo: 1800 },
  master: null,
};

export function Leaderboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userProfile = await getUserProfile();
    const userStats = await getStats();
    setProfile(userProfile);
    setStats(userStats);
  };

  if (!profile || !stats) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const nextLeague = NEXT_LEAGUE[profile.league];
  const eloProgress = nextLeague
    ? ((profile.elo - (nextLeague.elo - 200)) / 200) * 100
    : 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Your Progress 📈</h1>
        <p className="text-2xl text-purple-600 font-bold italic">
          "You are your biggest competition!"
        </p>
        <p className="text-gray-600 mt-2">
          Track your growth and beat your personal best
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">{LEAGUE_ICONS[profile.league]}</div>
          <h2 className="text-3xl font-bold capitalize mb-2">{profile.league} League</h2>
          <div className="text-6xl font-bold text-blue-600">{profile.elo}</div>
          <div className="text-sm text-gray-600 mt-1">ELO Rating</div>
        </div>

        {nextLeague && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress to {LEAGUE_ICONS[nextLeague.league]} {nextLeague.league}</span>
              <span>{profile.elo} / {nextLeague.elo}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${Math.min(100, Math.max(0, eloProgress))}%` }}
              >
                <span className="text-white text-xs font-bold">
                  {Math.round(eloProgress)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personal Bests */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔥 Streak Record
          </h3>
          <div className="text-5xl font-bold text-orange-600 mb-2">
            {profile.streakCount}
          </div>
          <p className="text-gray-600">days in a row!</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎯 Accuracy
          </h3>
          <div className="text-5xl font-bold text-green-600 mb-2">
            {Math.round((stats.accuracy || 0) * 100)}%
          </div>
          <p className="text-gray-600">puzzles solved correctly</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6">Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.totalPuzzles || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Puzzles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{stats.solvedPuzzles || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Solved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">{profile.badges.length}</div>
            <div className="text-sm text-gray-600 mt-1">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">{profile.totalPlayTime}</div>
            <div className="text-sm text-gray-600 mt-1">Minutes Played</div>
          </div>
        </div>
      </div>

      {/* Motivational Section */}
      <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
        <h3 className="font-bold text-xl mb-3 text-center">Keep Growing! 🌱</h3>
        <div className="text-gray-700 space-y-2">
          <p className="text-center">• Every puzzle makes you stronger 💪</p>
          <p className="text-center">• Mistakes help you learn 🧠</p>
          <p className="text-center">• Your progress is your own journey 🚀</p>
        </div>
      </div>
    </div>
  );
}
