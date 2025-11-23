// high precision timer component using performance.now

import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  initialTime: number; // milliseconds
  onTimeout?: () => void;
  onTick?: (remaining: number) => void;
  paused?: boolean;
  className?: string;
}

export function Timer({
  initialTime,
  onTimeout,
  onTick,
  paused = false,
  className = '',
}: TimerProps) {
  const [remaining, setRemaining] = useState(initialTime);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (paused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (startTimeRef.current) {
        pausedTimeRef.current = remaining;
        startTimeRef.current = null;
      }
      return;
    }

    // start or resume timer
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }

    const update = () => {
      if (!startTimeRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      const newRemaining = Math.max(0, pausedTimeRef.current - elapsed);

      setRemaining(newRemaining);
      onTick?.(newRemaining);

      if (newRemaining <= 0) {
        onTimeout?.();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [paused, onTimeout, onTick]);

  // reset when initialTime changes
  useEffect(() => {
    setRemaining(initialTime);
    pausedTimeRef.current = initialTime;
    startTimeRef.current = null;
  }, [initialTime]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const percentage = initialTime > 0 ? (remaining / initialTime) * 100 : 0;
  const isLowTime = remaining < 10000; // less than 10 seconds

  return (
    <div className={`timer ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative w-32 h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-100 ${
              isLowTime ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-sm font-mono font-bold ${
                isLowTime ? 'text-white animate-pulse' : 'text-gray-900'
              }`}
            >
              {formatTime(remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

