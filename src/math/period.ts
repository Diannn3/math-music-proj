export type PeriodDetectionOptions = {
  maxPeriod?: number;
  tolerance?: number;
  repetitions?: number;
};

export type PeriodDetection = {
  period: number | null;
  maxError: number;
  confidence: number;
  comparisons: number;
};

/**
 * Numerically detects the smallest repeating period in the tail of an orbit.
 * This is a finite floating-point classification, not a symbolic proof.
 */
export function detectPeriod(
  orbit: ArrayLike<number>,
  {
    maxPeriod = 128,
    tolerance = 1e-9,
    repetitions = 6,
  }: PeriodDetectionOptions = {},
): PeriodDetection {
  if (!Number.isInteger(maxPeriod) || maxPeriod < 1) {
    throw new RangeError('maxPeriod must be a positive integer.');
  }

  if (!Number.isFinite(tolerance) || tolerance <= 0) {
    throw new RangeError('tolerance must be positive and finite.');
  }

  if (!Number.isInteger(repetitions) || repetitions < 2) {
    throw new RangeError('repetitions must be an integer >= 2.');
  }

  const n = orbit.length;
  if (n < 2) {
    return { period: null, maxError: Number.POSITIVE_INFINITY, confidence: 0, comparisons: 0 };
  }

  const largestCandidate = Math.min(maxPeriod, Math.floor(n / repetitions));
  let bestFailedError = Number.POSITIVE_INFINITY;

  for (let period = 1; period <= largestCandidate; period += 1) {
    const window = period * repetitions;
    const start = n - window;
    let maxError = 0;
    let comparisons = 0;
    let failed = false;

    for (let i = start + period; i < n; i += 1) {
      const error = Math.abs(Number(orbit[i]) - Number(orbit[i - period]));
      maxError = Math.max(maxError, error);
      comparisons += 1;

      if (error > tolerance) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      const normalizedError = maxError / tolerance;
      return {
        period,
        maxError,
        comparisons,
        confidence: Math.max(0, Math.min(1, 1 - normalizedError)),
      };
    }

    bestFailedError = Math.min(bestFailedError, maxError);
  }

  return {
    period: null,
    maxError: bestFailedError,
    confidence: 0,
    comparisons: 0,
  };
}
