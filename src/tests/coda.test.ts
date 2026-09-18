import { describe, expect, it } from 'vitest';
import { generateCanonicalScore } from '../composition';
import { codaStateForEvent } from '../audio';

describe('raw coda', () => {
  const score = generateCanonicalScore();
  const limit = score.events.filter((event) => event.segmentId === 'limit');

  it('keeps the first four bars fully musicalized', () => {
    for (const event of limit.slice(0, 32)) {
      const coda = codaStateForEvent(event);
      expect(coda.active).toBe(false);
      expect(coda.musicalMix).toBe(1);
      expect(coda.rawMix).toBe(0);
    }
  });

  it('crossfades monotonically across the final 32 events', () => {
    const states = limit.slice(32).map(codaStateForEvent);
    expect(states).toHaveLength(32);
    expect(states[0].rawMix).toBeGreaterThan(0);
    expect(states.at(-1)?.rawMix).toBe(1);
    expect(states.at(-1)?.musicalMix).toBe(0);

    for (let index = 1; index < states.length; index += 1) {
      expect(states[index].rawMix).toBeGreaterThan(states[index - 1].rawMix);
      expect(states[index].musicalMix).toBeLessThan(states[index - 1].musicalMix);
    }
  });

  it('strips transient, halo, bass, and drone one bar at a time', () => {
    const barStarts = [32, 40, 48, 56].map((index) => codaStateForEvent(limit[index]));
    expect(barStarts[0]).toMatchObject({ transient: false, halo: true, bass: true, drone: true });
    expect(barStarts[1]).toMatchObject({ transient: false, halo: false, bass: true, drone: true });
    expect(barStarts[2]).toMatchObject({ transient: false, halo: false, bass: false, drone: true });
    expect(barStarts[3]).toMatchObject({ transient: false, halo: false, bass: false, drone: false });
  });
});
