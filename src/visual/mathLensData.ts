import { estimateLyapunov, generateOrbit, logisticStep } from '../math';

export type CobwebPoint = { x: number; y: number };
export type LyapunovPoint = { r: number; lambda: number };

export function buildLogisticCurve(r: number, samples = 128): CobwebPoint[] {
  if (!Number.isInteger(samples) || samples < 2) throw new RangeError('samples must be an integer >= 2.');
  return Array.from({ length: samples + 1 }, (_, index) => {
    const x = index / samples;
    return { x, y: logisticStep(x, r) };
  });
}

export function buildCobwebPath(r: number, x0: number, steps = 16): CobwebPoint[] {
  if (!Number.isInteger(steps) || steps < 1) throw new RangeError('steps must be a positive integer.');

  let x = x0;
  const points: CobwebPoint[] = [{ x, y: 0 }];

  for (let index = 0; index < steps; index += 1) {
    const next = logisticStep(x, r);
    points.push({ x, y: next });
    points.push({ x: next, y: next });
    x = next;
  }

  return points;
}

export function sampleLyapunovCurve(
  rMin = 2.8,
  rMax = 4,
  samples = 240,
  x0 = 0.2,
  burnIn = 800,
  measure = 800,
): LyapunovPoint[] {
  if (!(rMax > rMin)) throw new RangeError('rMax must be greater than rMin.');
  if (!Number.isInteger(samples) || samples < 2) throw new RangeError('samples must be an integer >= 2.');

  return Array.from({ length: samples + 1 }, (_, index) => {
    const r = rMin + ((rMax - rMin) * index) / samples;
    const orbit = generateOrbit({ r, x0, burnIn, count: measure });
    return { r, lambda: estimateLyapunov(orbit, r) };
  });
}
