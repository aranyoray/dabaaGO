import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Timer precision', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should use performance.now for precision', () => {
    const start = performance.now();
    vi.advanceTimersByTime(1000);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(1000);
  });

  it('should handle timer timeout', () => {
    let timeoutCalled = false;
    const timeout = setTimeout(() => {
      timeoutCalled = true;
    }, 5000);

    vi.advanceTimersByTime(5000);
    expect(timeoutCalled).toBe(true);
    clearTimeout(timeout);
  });
});

