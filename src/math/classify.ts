import { detectPeriod, type PeriodDetectionOptions } from './period';
import { estimateLyapunov } from './lyapunov';

export type OrbitRegime = 'periodic' | 'chaotic' | 'transition-or-unresolved';

export type OrbitClassification = {
  regime: OrbitRegime;
  lambda: number;
  period: number | null;
  periodConfidence: number;
};

export type ClassificationOptions = {
  lambdaThreshold?: number;
  period?: PeriodDetectionOptions;
};

export function classifyOrbit(
  orbit: ArrayLike<number>,
  r: number,
  {
    lambdaThreshold = 1e-3,
    period: periodOptions,
  }: ClassificationOptions = {},
): OrbitClassification {
  if (!Number.isFinite(lambdaThreshold) || lambdaThreshold < 0) {
    throw new RangeError('lambdaThreshold must be finite and non-negative.');
  }

  const lambda = estimateLyapunov(orbit, r);
  const detected = detectPeriod(orbit, periodOptions);

  if (detected.period !== null && lambda < lambdaThreshold) {
    return {
      regime: 'periodic',
      lambda,
      period: detected.period,
      periodConfidence: detected.confidence,
    };
  }

  if (lambda > lambdaThreshold) {
    return {
      regime: 'chaotic',
      lambda,
      period: null,
      periodConfidence: 0,
    };
  }

  return {
    regime: 'transition-or-unresolved',
    lambda,
    period: detected.period,
    periodConfidence: detected.confidence,
  };
}
