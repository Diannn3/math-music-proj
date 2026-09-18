import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BPM,
  CANONICAL_BURN_IN,
  CANONICAL_X0,
  TOTAL_BARS,
  TOTAL_PRIMARY_EVENTS,
  TOTAL_SECONDS,
} from '../composition/chapters';

const manifest = JSON.parse(
  readFileSync(
    new URL('../../public/bifurcate-release-manifest.json', import.meta.url),
    'utf8',
  ),
);

describe('release manifest', () => {
  it('matches canonical score constants', () => {
    expect(manifest.schema).toBe('bifurcate.release-manifest.v1');
    expect(manifest.hashAlgorithm).toBe('sha256');
    expect(manifest.canonicalScore).toMatchObject({
      x0: CANONICAL_X0,
      burnIn: CANONICAL_BURN_IN,
      tempoBpm: BPM,
      bars: TOTAL_BARS,
      durationSeconds: TOTAL_SECONDS,
      primaryEventCount: TOTAL_PRIMARY_EVENTS,
    });
  });

  it('keeps the period-3 island explicit', () => {
    const island = manifest.canonicalSegments.find(
      (segment: { id: string }) => segment.id === 'island',
    );
    expect(island).toEqual({
      id: 'island',
      r: 3.83,
      detectedPeriod: 3,
      expectedRegime: 'periodic',
    });
  });

  it('uses full SHA-256 digests for every declared input and asset', () => {
    const digest = /^[a-f0-9]{64}$/;
    for (const hash of Object.values(manifest.sourceInputs)) {
      expect(hash).toMatch(digest);
    }
    for (const hash of Object.values(manifest.releaseAssets)) {
      expect(hash).toMatch(digest);
    }
    expect(Object.keys(manifest.sourceInputs).length).toBeGreaterThanOrEqual(10);
    expect(Object.keys(manifest.releaseAssets)).toContain('public/bifurcate-poster.png');
  });
});
