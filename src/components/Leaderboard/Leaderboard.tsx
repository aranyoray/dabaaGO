// leaderboard display

import { useState, useEffect } from 'react';
import type { LeaderboardEntry, League } from '../../types';
import { getUserProfile } from '../../services/profileService';

const LEAGUE_COLORS: Record<League, string> = {
  stone: 'text-gray-600',
  bronze: 'text-orange-700',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-400',
  diamond: 'text-blue-400',
  master: 'text-purple-600',
};

const LEAGUE_ICONS: Record<League, string> = {
  stone: '🪨',
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💠',
  diamond: '💎',
  master: '👑',
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId] = useState<string>('local-user');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    // in a real app, this would fetch from a server
    // for now, we'll create mock data with the current user
    const profile = await getUserProfile();

    const mockEntries: LeaderboardEntry[] = [
      {
        userId: 'local-user',
        username: 'You',
        score: 0,
        elo: profile.elo,
        league: profile.league,
        streakCount: profile.streakCount,
        rank: 1,
      },
      // add some mock competitors
      {
        userId: 'user-2',
        username: 'ChessMaster',
        score: 8500,
        elo: 1650,
        league: 'diamond',
        streakCount: 45,
        rank: 2,
      },
      {
        userId: 'user-3',
        username: 'PuzzlePro',
        score: 7200,
        elo: 1520,
        league: 'platinum',
        streakCount: 38,
        rank: 3,
      },
      {
        userId: 'user-4',
        username: 'TacticsKing',
        score: 6800,
        elo: 1450,
        league: 'gold',
        streakCount: 32,
        rank: 4,
      },
      {
        userId: 'user-5',
        username: 'RookiePlayer',
        score: 5100,
        elo: 1280,
        league: 'silver',
        streakCount: 25,
        rank: 5,
      },
    ];

    // sort by ELO
    mockEntries.sort((a, b) => b.elo - a.elo);
    mockEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    setEntries(mockEntries);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard 🏆</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-left">League</th>
              <th className="px-4 py-3 text-right">ELO</th>
              <th className="px-4 py-3 text-right">Streak</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.userId}
                className={`border-t ${
                  entry.userId === currentUserId ? 'bg-blue-50 font-bold' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="text-2xl">{getRankIcon(entry.rank)}</div>
                </td>
                <td className="px-4 py-3">
                  {entry.username}
                  {entry.userId === currentUserId && (
                    <span className="ml-2 text-xs text-blue-600">(You)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{LEAGUE_ICONS[entry.league]}</span>
                    <span className={`capitalize ${LEAGUE_COLORS[entry.league]}`}>
                      {entry.league}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono">{entry.elo}</td>
                <td className="px-4 py-3 text-right">
                  {entry.streakCount} 🔥
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">How Rankings Work</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Rankings are based on your ELO rating</li>
          <li>• Win puzzles to increase your ELO and climb the ranks</li>
          <li>• Maintain streaks to earn badges and stay competitive</li>
          <li>• Your league is determined by your ELO rating</li>
        </ul>
      </div>
    </div>
  );
}
