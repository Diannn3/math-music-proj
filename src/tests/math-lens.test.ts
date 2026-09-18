import { describe, expect, it } from 'vitest';
import { buildCobwebPath, buildLogisticCurve, sampleLyapunovCurve } from '../visual';

describe('Math Lens data', () => {
  it('builds a logistic curve entirely inside the unit square', () => {
    const curve = buildLogisticCurve(3.83, 64);
    expect(curve).toHaveLength(65);
    for (const point of curve) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(1);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(1);
    }
  });

  it('builds alternating vertical-horizontal cobweb segments', () => {
    const cobweb = buildCobwebPath(3.2, 0.2, 4);
    expect(cobweb).toHaveLength(9);
    for (let index = 1; index < cobweb.length; index += 2) {
      expect(cobweb[index].x).toBeCloseTo(cobweb[index - 1].x, 12);
      if (index + 1 < cobweb.length) {
        expect(cobweb[index].y).toBeCloseTo(cobweb[index + 1].y, 12);
      }
    }
  });

  it('captures the sign change between the period-3 window and chaotic r=3.9', () => {
    const curve = sampleLyapunovCurve(3.83, 3.9, 7, 0.2, 3000, 3000);
    const nearIsland = curve[0];
    const chaotic = curve.at(-1)!;
    expect(nearIsland.lambda).toBeLessThan(0);
    expect(chaotic.lambda).toBeGreaterThan(0);
  });
});
