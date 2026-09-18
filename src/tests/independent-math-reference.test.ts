import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateCanonicalScore, CANONICAL_BURN_IN, CANONICAL_X0 } from '../composition';
import { classifyOrbit, generateOrbit } from '../math';

type MathReference = {
  schema: string;
  generator: string;
  x0: number;
  burnIn: number;
  classificationCount: number;
  period: {
    maxPeriod: number;
    tolerance: number;
    repetitions: number;
  };
  segments: Array<{
    id: string;
    r: number;
    expectedRegime: 'periodic' | 'chaotic' | 'transition-or-unresolved';
    detectedPeriod: number | null;
    lambda: number;
    orbitHead: number[];
    scoreHead: number[];
  }>;
};

const fixtureUrl = new URL('../../fixtures/canonical-math-reference.json', import.meta.url);
const reference = JSON.parse(readFileSync(fixtureUrl, 'utf8')) as MathReference;

describe('independent frozen mathematical reference', () => {
  it('locks the canonical numerical setup independently of the application score', () => {
    expect(reference.schema).toBe('bifurcate.math-reference.v1');
    expect(reference.generator).toBe('independent-python-binary64');
    expect(reference.x0).toBe(CANONICAL_X0);
    expect(reference.burnIn).toBe(CANONICAL_BURN_IN);
    expect(reference.classificationCount).toBe(2048);
  });

  for (const segment of reference.segments) {
    it(`matches independent orbit and classification references for ${segment.id}`, () => {
      const orbit = generateOrbit({
        r: segment.r,
        x0: reference.x0,
        burnIn: reference.burnIn,
        count: reference.classificationCount,
      });

      const classification = classifyOrbit(orbit, segment.r, {
        period: reference.period,
      });

      expect(classification.period).toBe(segment.detectedPeriod);
      expect(classification.regime).toBe(segment.expectedRegime);
      expect(classification.lambda).toBeCloseTo(segment.lambda, 11);

      segment.orbitHead.forEach((expected, index) => {
        expect(orbit[index]).toBeCloseTo(expected, 14);
      });
    });
  }

  it('matches the independent score-facing orbit samples', () => {
    const score = generateCanonicalScore();

    for (const segment of reference.segments) {
      const events = score.events
        .filter((event) => event.segmentId === segment.id)
        .slice(0, segment.scoreHead.length);

      expect(events).toHaveLength(segment.scoreHead.length);
      events.forEach((event, index) => {
        expect(event.x).toBeCloseTo(segment.scoreHead[index], 14);
        expect(event.detectedPeriod).toBe(segment.detectedPeriod);
        expect(event.regime).toBe(segment.expectedRegime);
        expect(event.lambda).toBeCloseTo(segment.lambda, 11);
      });
    }
  });
});
