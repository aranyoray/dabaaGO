// user profile dashboard with stats, league, and progress

import { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';
import { getUserProfile, setPlayerLevel } from '../../services/profileService';
import { PandaAvatar } from '../PandaMascot/PandaMascot';


const LEAGUE_ICONS: Record<string, string> = {
  stone: '🪨',
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💠',
  diamond: '💎',
  master: '👑',
};

interface ProfileDashboardProps {
  onClose: () => void;
}

export function ProfileDashboard({ onClose }: ProfileDashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showLevelSelector, setShowLevelSelector] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getUserProfile();
    setProfile(data);

    // show level selector if tutorial not completed
    if (!data.hasCompletedTutorial) {
      setShowLevelSelector(true);
    }
  };

  const handleLevelSelect = async (level: 'beginner' | 'amateur') => {
    await setPlayerLevel(level);
    setShowLevelSelector(false);
    loadProfile();
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (showLevelSelector) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <PandaAvatar size="lg" />
          <h1 className="text-3xl font-bold mt-4">Welcome to Daaba!</h1>
          <p className="text-gray-600 mt-2">Let's get started. What's your level?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleLevelSelect('beginner')}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-400"
          >
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2">Beginner</h3>
            <p className="text-sm text-gray-600">
              New to chess or puzzles. You'll get:
            </p>
            <ul className="text-sm text-gray-600 mt-2 text-left space-y-1">
              <li>• Tutorial on rules and strategies</li>
              <li>• Simpler puzzles to start</li>
              <li>• More helpful hints</li>
              <li>• Gradual difficulty increase</li>
            </ul>
          </button>

          <button
            onClick={() => handleLevelSelect('amateur')}
            className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-400"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Amateur</h3>
            <p className="text-sm text-gray-600">
              Know the basics and ready for more. You'll get:
            </p>
            <ul className="text-sm text-gray-600 mt-2 text-left space-y-1">
              <li>• Skip straight to puzzles</li>
              <li>• Adaptive difficulty</li>
              <li>• Indirect hints only</li>
              <li>• ELO-based matching</li>
            </ul>
          </button>
        </div>
      </div>
    );
  }

  const nextBadgeTarget = [10, 20, 30, 50, 75, 100, 150, 200].find(
    (target) => target > profile.streakCount
  ) || 200;

  const streakProgress = (profile.streakCount / nextBadgeTarget) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-6">
          <PandaAvatar size="lg" />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Player</h2>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm ${
                  profile.level === 'beginner' ? 'bg-green-500' : 'bg-purple-500'
                }`}
              >
                {profile.level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-sm text-gray-600">ELO Rating</div>
                <div className="text-2xl font-bold">{profile.elo}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">League</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{LEAGUE_ICONS[profile.league]}</span>
                  <span className="text-lg font-bold capitalize">
                    {profile.league}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Streak Progress 🔥</h3>
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Current: {profile.streakCount} days</span>
            <span>Next badge: {nextBadgeTarget} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-4 rounded-full transition-all"
              style={{ width: `${Math.min(100, streakProgress)}%` }}
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Play for 10+ minutes daily to maintain your streak!
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Play Time</div>
            <div className="text-2xl font-bold">{profile.totalPlayTime} min</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Badges</div>
            <div className="text-2xl font-bold">{profile.badges.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Best Streak</div>
            <div className="text-2xl font-bold">{profile.streakCount} 🔥</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Tutorial</div>
            <div className="text-2xl">
              {profile.hasCompletedTutorial ? '✅' : '⏳'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent badges */}
      {profile.badges.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Recent Badges</h3>
          <div className="flex flex-wrap gap-4">
            {profile.badges.slice(-5).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg border-2 border-yellow-400"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <div className="font-bold text-sm">{badge.name}</div>
                  <div className="text-xs text-gray-600">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
