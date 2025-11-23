// settings component for user preferences

import { useState, useEffect } from 'react';
import { getSettings, setSettings } from '../../services/localStore';
import type { GameSettings } from '../../types';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [settings, updateSettings] = useState<GameSettings | null>(null);

  useEffect(() => {
    getSettings().then(set => {
      if (set) updateSettings(set);
    });
  }, []);

  const handleChange = async (key: keyof GameSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    updateSettings(newSettings);
    await setSettings(newSettings);
  };

  if (!settings) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Piece Style</label>
            <select
              value={settings.pieceStyle}
              onChange={(e) => handleChange('pieceStyle', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="minimal">Minimal</option>
              <option value="rounded">Rounded</option>
              <option value="geometric">Geometric</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Time Limit (seconds)</label>
            <select
              value={settings.timeLimit}
              onChange={(e) => handleChange('timeLimit', parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="0">Unlimited</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
              <option value="120">120 seconds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={settings.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="adaptive">Adaptive</option>
              <option value="simple">Simple</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Engine Strength (1-20)</label>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.engineStrength}
              onChange={(e) => handleChange('engineStrength', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600">{settings.engineStrength}</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sound"
              checked={settings.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
            />
            <label htmlFor="sound">Enable Sound</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="animations"
              checked={settings.animationsEnabled}
              onChange={(e) => handleChange('animationsEnabled', e.target.checked)}
            />
            <label htmlFor="animations">Enable Animations</label>
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

