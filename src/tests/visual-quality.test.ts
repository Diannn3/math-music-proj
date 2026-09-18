import { describe, expect, it } from 'vitest';
import { chooseVisualQuality, VISUAL_QUALITY_PROFILES } from '../visual';

describe('adaptive visual quality', () => {
  it('uses low density for reduced motion regardless of hardware', () => {
    expect(chooseVisualQuality({
      width: 1920,
      devicePixelRatio: 1,
      hardwareConcurrency: 16,
      reducedMotion: true,
    })).toEqual(VISUAL_QUALITY_PROFILES.low);
  });

  it('uses high density only for roomy capable displays', () => {
    expect(chooseVisualQuality({
      width: 1600,
      devicePixelRatio: 1.5,
      hardwareConcurrency: 12,
      reducedMotion: false,
    })).toEqual(VISUAL_QUALITY_PROFILES.high);
  });

  it('keeps the planned point-count tiers', () => {
    expect(VISUAL_QUALITY_PROFILES.high.rSamples * VISUAL_QUALITY_PROFILES.high.retain).toBe(393216);
    expect(VISUAL_QUALITY_PROFILES.medium.rSamples * VISUAL_QUALITY_PROFILES.medium.retain).toBe(131072);
    expect(VISUAL_QUALITY_PROFILES.low.rSamples * VISUAL_QUALITY_PROFILES.low.retain).toBe(49152);
  });
});
