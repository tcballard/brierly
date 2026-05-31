import { describe, it, expect } from 'vitest';
import { brierScore, logLoss, confidenceGap } from '../src/scoring.js';

describe('brierScore', () => {
  it('matches the hand-computed anchor', () => {
    const data = [
      { p: 0.7, o: true },
      { p: 0.7, o: false },
      { p: 0.9, o: true },
    ];
    expect(brierScore(data)).toBeCloseTo(0.19667, 5);
  });

  it('scores the always-0.5 strategy at 0.25', () => {
    const data = [
      { p: 0.5, o: true },
      { p: 0.5, o: false },
      { p: 0.5, o: true },
    ];
    expect(brierScore(data)).toBeCloseTo(0.25, 10);
  });

  it('returns null (not NaN) for an empty resolved set', () => {
    expect(brierScore([])).toBeNull();
  });
});

describe('logLoss', () => {
  it('stays finite at the clamp boundaries', () => {
    const data = [
      { p: 0, o: true },
      { p: 1, o: false },
    ];
    expect(Number.isFinite(logLoss(data))).toBe(true);
  });

  it('returns null for an empty resolved set', () => {
    expect(logLoss([])).toBeNull();
  });
});

describe('confidenceGap', () => {
  it('returns null for an empty resolved set', () => {
    expect(confidenceGap([])).toBeNull();
  });
});
