import { describe, expect, it } from 'vitest';
import {
  SCORE_SEGMENTS,
  TOTAL_BARS,
  TOTAL_PRIMARY_EVENTS,
  TOTAL_SECONDS,
  generateCanonicalScore,
  rawFrequencyFromX,
} from '../composition';

describe('canonical score architecture', () => {
  it('locks the planned 92-bar / 230-second form', () => {
    expect(TOTAL_BARS).toBe(92);
    expect(TOTAL_SECONDS).toBe(230);
  });

  it('generates exactly 736 primary orbit events', () => {
    const score = generateCanonicalScore();
    expect(TOTAL_PRIMARY_EVENTS).toBe(736);
    expect(score.events).toHaveLength(736);
  });

  it('keeps chapter parameters fixed within each segment', () => {
    const score = generateCanonicalScore();
    for (const segment of SCORE_SEGMENTS) {
      const events = score.events.filter((event) => event.segmentId === segment.id);
      expect(events).toHaveLength(segment.bars * 8);
      expect(new Set(events.map((event) => event.r))).toEqual(new Set([segment.r]));
    }
  });

  it('keeps the period-3 island classified as periodic', () => {
    const score = generateCanonicalScore();
    const event = score.events.find((candidate) => candidate.segmentId === 'island');
    expect(event?.detectedPeriod).toBe(3);
    expect(event?.regime).toBe('periodic');
    expect(event?.lambda).toBeLessThan(0);
  });

  it('preserves raw frequency endpoints by definition', () => {
    expect(rawFrequencyFromX(0)).toBeCloseTo(110, 12);
    expect(rawFrequencyFromX(0.5)).toBeCloseTo(440, 12);
    expect(rawFrequencyFromX(1)).toBeCloseTo(1760, 12);
  });

  it('is deterministic for a fixed project configuration', () => {
    const a = generateCanonicalScore();
    const b = generateCanonicalScore();
    expect(a).toEqual(b);
  });

  it('ends on the last planned eighth-note onset', () => {
    const score = generateCanonicalScore();
    const last = score.events.at(-1);
    expect(last?.timeSeconds).toBeCloseTo(229.6875, 10);
    expect(score.durationSeconds).toBe(230);
  });
});
