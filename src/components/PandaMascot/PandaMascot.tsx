// cheerful panda mascot for celebrations and encouragement

import { useEffect, useState } from 'react';

interface PandaMascotProps {
  event?: 'solve' | 'badge' | 'streak' | 'levelup' | null;
  message?: string;
  onClose?: () => void;
}

export function PandaMascot({ event, message, onClose }: PandaMascotProps) {
  const [visible, setVisible] = useState(false);
  const [pandaMessage, setPandaMessage] = useState('');

  useEffect(() => {
    if (event) {
      setVisible(true);
      setPandaMessage(message || getDefaultMessage(event));

      // auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [event, message, onClose]);

  const getDefaultMessage = (evt: string): string => {
    const messages = {
      solve: [
        'Great job! 🎯',
        'You\'re on fire! 🔥',
        'Brilliant move! ✨',
        'Keep it up! 💪',
        'Fantastic! 🌟',
      ],
      badge: [
        'New badge earned! 🏆',
        'You\'re amazing! 🎉',
        'Well deserved! ⭐',
        'Incredible achievement! 🌟',
      ],
      streak: [
        'Streak milestone! 🔥',
        'You\'re unstoppable! 💪',
        'Keep going! 🚀',
        'On a roll! 🎯',
      ],
      levelup: [
        'Level up! 🎊',
        'You\'re growing! 🌱',
        'New heights! 🏔️',
        'Advancing! 📈',
      ],
    };

    const eventMessages = messages[evt as keyof typeof messages] || messages.solve;
    return eventMessages[Math.floor(Math.random() * eventMessages.length)];
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs border-4 border-blue-400">
        <div className="flex items-center gap-4">
          {/* Panda ASCII art */}
          <div className="text-6xl">🐼</div>

          <div className="flex-1">
            <div className="font-bold text-lg text-gray-800">{pandaMessage}</div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                setVisible(false);
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Fun animation bubbles */}
        <div className="mt-2 flex gap-1">
          {['💫', '⭐', '✨'].map((emoji, i) => (
            <span
              key={i}
              className="inline-block animate-float"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Panda display for profile/menu
export function PandaAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  return (
    <div className={`${sizes[size]} animate-wave`}>
      🐼
    </div>
  );
}
