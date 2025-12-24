// achievements and badges display

import { useState, useEffect } from 'react';
import type { Achievement, Badge, UserProfile } from '../../types';
import { getAchievements } from '../../services/profileService';
import { getUserProfile } from '../../services/profileService';

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges'>('achievements');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [achievementsData, profileData] = await Promise.all([
      getAchievements(),
      getUserProfile(),
    ]);
    setAchievements(achievementsData);
    setProfile(profileData);
  };

  const renderBadge = (badge: Badge) => (
    <div
      key={badge.id}
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md border-2 border-yellow-400"
    >
      <div className="text-4xl mb-2">{badge.icon}</div>
      <div className="text-sm font-bold text-center">{badge.name}</div>
      <div className="text-xs text-gray-600 text-center mt-1">
        {badge.description}
      </div>
      {badge.earnedAt && (
        <div className="text-xs text-gray-500 mt-2">
          {new Date(badge.earnedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );

  const renderAchievement = (achievement: Achievement) => {
    const progress = Math.min(100, (achievement.progress / achievement.target) * 100);

    return (
      <div
        key={achievement.id}
        className={`flex items-center p-4 bg-white rounded-lg shadow-md ${
          achievement.unlocked ? 'border-2 border-green-500' : 'border border-gray-300'
        }`}
      >
        <div className={`text-4xl mr-4 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="font-bold">{achievement.name}</div>
          <div className="text-sm text-gray-600">{achievement.description}</div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {achievement.progress} / {achievement.target}
            </div>
          </div>
        </div>
        {achievement.unlocked && (
          <div className="ml-4 text-green-500 text-2xl">✓</div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Achievements & Badges</h1>

      {/* Tab selector */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'achievements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Achievements
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'badges'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Badges ({profile?.badges.length || 0})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'achievements' && (
        <div className="grid gap-4">
          {achievements.map(renderAchievement)}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {profile?.badges.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No badges earned yet. Keep playing to earn streak badges!
            </div>
          ) : (
            profile?.badges.map(renderBadge)
          )}
        </div>
      )}
    </div>
  );
}
