import { logisticDerivative } from './logistic';

export type LyapunovOptions = {
  startIndex?: number;
  epsilon?: number;
};

/**
 * Finite-time Lyapunov estimate for a sampled logistic-map orbit.
 *
 * λ_N = (1/N) Σ ln |r(1 - 2x_n)|
 *
 * If the derivative is exactly zero for any sampled state, the finite estimate
 * is -Infinity rather than silently replacing log(0) with an arbitrary value.
 */
export function estimateLyapunov(
  orbit: ArrayLike<number>,
  r: number,
  { startIndex = 0, epsilon = 0 }: LyapunovOptions = {},
): number {
  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= orbit.length) {
    throw new RangeError('startIndex must refer to an existing orbit element.');
  }

  if (!Number.isFinite(epsilon) || epsilon < 0) {
    throw new RangeError('epsilon must be finite and non-negative.');
  }

  let sum = 0;
  let samples = 0;

  for (let i = startIndex; i < orbit.length; i += 1) {
    const magnitude = Math.abs(logisticDerivative(orbit[i], r));

    if (magnitude === 0 && epsilon === 0) {
      return Number.NEGATIVE_INFINITY;
    }

    sum += Math.log(Math.max(magnitude, epsilon));
    samples += 1;
  }

  if (samples === 0) {
    throw new RangeError('At least one orbit sample is required.');
  }

  return sum / samples;
}
