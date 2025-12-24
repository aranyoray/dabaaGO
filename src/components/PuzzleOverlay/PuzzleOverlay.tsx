// modal overlay for puzzle states - kid-friendly with clear actions

import { ReactNode } from 'react';

interface PuzzleOverlayProps {
  show: boolean;
  children: ReactNode;
  blur?: boolean;
}

export function PuzzleOverlay({ show, children, blur = true }: PuzzleOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {blur && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      )}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce-in">
        {children}
      </div>
    </div>
  );
}

interface PuzzleStateModalProps {
  state: 'solved' | 'timeout' | 'encouragement' | null;
  encouragementMessage?: string;
  onReset?: () => void;
  onNext?: () => void;
  onTryAgain?: () => void;
  onExit?: () => void;
  showHint?: boolean;
  onGetHint?: () => void;
  score?: number;
}

export function PuzzleStateModal({
  state,
  encouragementMessage,
  onReset,
  onNext,
  onTryAgain,
  onExit,
  showHint,
  onGetHint,
  score,
}: PuzzleStateModalProps) {
  if (!state) return null;

  if (state === 'solved') {
    return (
      <PuzzleOverlay show={true}>
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Awesome! You got it!
          </h2>
          {score !== undefined && (
            <div className="text-5xl font-bold text-blue-600 my-4">+{score}</div>
          )}
          <p className="text-lg text-gray-600 mb-6">
            Great job solving this puzzle!
          </p>
          <div className="flex flex-col gap-3">
            {onNext && (
              <button
                onClick={onNext}
                className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-xl hover:bg-green-600 shadow-lg"
              >
                Next Puzzle! →
              </button>
            )}
            {onExit && (
              <button
                onClick={onExit}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
              >
                Back to Menu
              </button>
            )}
          </div>
        </div>
      </PuzzleOverlay>
    );
  }

  if (state === 'timeout') {
    return (
      <PuzzleOverlay show={true}>
        <div className="text-center">
          <div className="text-7xl mb-4">⏰</div>
          <h2 className="text-3xl font-bold text-orange-600 mb-2">
            Time's Up!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Let's try another puzzle - you'll get it next time!
          </p>
          <div className="flex flex-col gap-3">
            {onNext && (
              <button
                onClick={onNext}
                className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-xl hover:bg-blue-600 shadow-lg"
              >
                Next Puzzle! →
              </button>
            )}
            {onTryAgain && (
              <button
                onClick={onTryAgain}
                className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600"
              >
                Try Again 🔄
              </button>
            )}
            {onExit && (
              <button
                onClick={onExit}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
              >
                Back to Menu
              </button>
            )}
          </div>
        </div>
      </PuzzleOverlay>
    );
  }

  if (state === 'encouragement' && encouragementMessage) {
    return (
      <PuzzleOverlay show={true}>
        <div className="text-center">
          <div className="text-7xl mb-4">🐼</div>
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            {encouragementMessage}
          </h2>
          <p className="text-gray-600 mb-6">
            Take your time and think about the best move!
          </p>
          <div className="flex flex-col gap-3">
            {showHint && onGetHint && (
              <button
                onClick={onGetHint}
                className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-xl hover:bg-blue-600 shadow-lg"
              >
                💡 Get a Hint
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600"
              >
                Start Over 🔄
              </button>
            )}
            {onTryAgain && (
              <button
                onClick={onTryAgain}
                className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600"
              >
                Keep Trying! 💪
              </button>
            )}
          </div>
        </div>
      </PuzzleOverlay>
    );
  }

  return null;
}
