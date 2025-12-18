import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Timer precision', () => {
  let mockPerformanceNow: ReturnType<typeof vi.fn<[], number>>;
  let fakeTime = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    fakeTime = 0;
    mockPerformanceNow = vi.fn<[], number>(() => fakeTime);
    vi.stubGlobal('performance', { now: mockPerformanceNow });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should use performance.now for precision', () => {
    const start = performance.now();
    fakeTime += 1000;
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

