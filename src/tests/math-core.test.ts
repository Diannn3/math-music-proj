import { describe, expect, it } from 'vitest';
import {
  classifyOrbit,
  detectPeriod,
  estimateLyapunov,
  generateOrbit,
  logisticStep,
} from '../math';

describe('logistic map core', () => {
  it('computes the canonical r=4, x=.2 first step', () => {
    expect(logisticStep(0.2, 4)).toBeCloseTo(0.64, 14);
  });

  it('rejects parameters outside the canonical interval', () => {
    expect(() => logisticStep(0.2, 4.1)).toThrow(RangeError);
    expect(() => logisticStep(-0.1, 3.5)).toThrow(RangeError);
  });

  it('generates deterministic orbit samples', () => {
    const a = generateOrbit({ r: 3.5, x0: 0.2, burnIn: 16, count: 32 });
    const b = generateOrbit({ r: 3.5, x0: 0.2, burnIn: 16, count: 32 });
    expect(Array.from(a)).toEqual(Array.from(b));
  });
});

describe('period detection', () => {
  const cases = [
    [2.8, 1],
    [3.2, 2],
    [3.5, 4],
    [3.55, 8],
    [3.568, 16],
    [3.83, 3],
  ] as const;

  for (const [r, period] of cases) {
    it(`detects period ${period} at r=${r}`, () => {
      const orbit = generateOrbit({ r, x0: 0.2, burnIn: 16384, count: 1024 });
      const result = detectPeriod(orbit, { maxPeriod: 128, tolerance: 1e-8, repetitions: 6 });
      expect(result.period).toBe(period);
    });
  }

  it('does not invent a low period in a chaotic reference orbit', () => {
    const orbit = generateOrbit({ r: 3.9, x0: 0.2, burnIn: 4096, count: 1024 });
    const result = detectPeriod(orbit, { maxPeriod: 128, tolerance: 1e-9, repetitions: 6 });
    expect(result.period).toBeNull();
  });
});

describe('Lyapunov estimates and regime classification', () => {
  it('approaches ln(2) at r=4 for a typical orbit', () => {
    const orbit = generateOrbit({ r: 4, x0: 0.2, burnIn: 4096, count: 32768 });
    const lambda = estimateLyapunov(orbit, 4);
    expect(lambda).toBeCloseTo(Math.log(2), 2);
  });

  it('keeps the period-3 window non-chaotic despite its large r value', () => {
    const orbit = generateOrbit({ r: 3.83, x0: 0.2, burnIn: 16384, count: 2048 });
    const classification = classifyOrbit(orbit, 3.83, {
      period: { maxPeriod: 128, tolerance: 1e-8, repetitions: 6 },
    });
    expect(classification.regime).toBe('periodic');
    expect(classification.period).toBe(3);
    expect(classification.lambda).toBeLessThan(0);
  });

  it('classifies r=3.9 as chaotic for the reference trajectory', () => {
    const orbit = generateOrbit({ r: 3.9, x0: 0.2, burnIn: 4096, count: 4096 });
    const classification = classifyOrbit(orbit, 3.9);
    expect(classification.regime).toBe('chaotic');
    expect(classification.lambda).toBeGreaterThan(0);
  });
});
