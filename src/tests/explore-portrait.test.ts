import { describe, expect, it } from 'vitest';
import { generateParameterPortrait } from '../composition';

describe('parameter portrait generation', () => {
  it('creates a 4-bar fixed-r portrait without touching canonical form', () => {
    const portrait = generateParameterPortrait(3.83, 0.2, 4);
    expect(portrait.events).toHaveLength(32);
    expect(portrait.durationSeconds).toBe(10);
    expect(new Set(portrait.events.map((event) => event.r))).toEqual(new Set([3.83]));
    expect(portrait.events.every((event) => event.segmentId === 'explore')).toBe(true);
  });

  it('detects the period-3 island and chaotic r=3.9 independently', () => {
    const island = generateParameterPortrait(3.83);
    const chaos = generateParameterPortrait(3.9);

    expect(island.events[0].detectedPeriod).toBe(3);
    expect(island.events[0].lambda).toBeLessThan(0);
    expect(chaos.events[0].detectedPeriod).toBeNull();
    expect(chaos.events[0].lambda).toBeGreaterThan(0);
  });

  it('keeps raw and musical transforms on every explore event', () => {
    const portrait = generateParameterPortrait(3.72);
    for (const event of portrait.events) {
      expect(event.raw.frequencyHz).toBeGreaterThanOrEqual(110);
      expect(event.raw.frequencyHz).toBeLessThanOrEqual(1760);
      expect(event.musical.midi).toBeGreaterThanOrEqual(50);
      expect(event.musical.midi).toBeLessThanOrEqual(84);
    }
  });
});
