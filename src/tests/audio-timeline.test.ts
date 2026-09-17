import { describe, expect, it } from 'vitest';
import { generateCanonicalScore } from '../composition';
import { clampScoreTime, findEventAtTime } from '../audio/timeline';

const score = generateCanonicalScore();

describe('audio timeline helpers', () => {
  it('clamps transport time into the score', () => {
    expect(clampScoreTime(score, -1)).toBe(0);
    expect(clampScoreTime(score, 999)).toBe(230);
  });

  it('returns the event active at a time', () => {
    expect(findEventAtTime(score, 0).globalIndex).toBe(0);
    expect(findEventAtTime(score, 0.3125).globalIndex).toBe(1);
    expect(findEventAtTime(score, 20).segmentId).toBe('split');
    expect(findEventAtTime(score, 230).globalIndex).toBe(735);
  });
});
