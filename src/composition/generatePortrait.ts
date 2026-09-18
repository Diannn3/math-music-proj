import { classifyOrbit, generateOrbit } from '../math';
import {
  BPM,
  CANONICAL_BURN_IN,
  EVENT_DURATION_SECONDS,
  EVENT_INTERVAL_SECONDS,
  EVENTS_PER_BAR,
} from './chapters';
import {
  articulationFromDelta,
  melodyFromX,
  panFromDelta,
  rawFrequencyFromX,
  velocityFromDelta,
} from './mapping';
import { MAPPING_VERSION } from './generateScore';
import type { MathMusicEvent } from './types';

export type ParameterPortrait = {
  r: number;
  x0: number;
  bars: number;
  durationSeconds: number;
  events: MathMusicEvent[];
};

export function generateParameterPortrait(
  r: number,
  x0 = 0.2,
  bars = 4,
): ParameterPortrait {
  if (!Number.isFinite(r) || r < 0 || r > 4) {
    throw new RangeError('Explore r must lie in [0, 4].');
  }
  if (!Number.isFinite(x0) || x0 <= 0 || x0 >= 1) {
    throw new RangeError('Explore x0 must lie strictly inside (0, 1).');
  }
  if (!Number.isInteger(bars) || bars < 1) {
    throw new RangeError('Explore bars must be a positive integer.');
  }

  const eventCount = bars * EVENTS_PER_BAR;
  const orbit = generateOrbit({
    r,
    x0,
    burnIn: CANONICAL_BURN_IN,
    count: Math.max(eventCount + 1, 2048),
  });
  const classification = classifyOrbit(orbit, r, {
    period: { maxPeriod: 128, tolerance: 1e-8, repetitions: 6 },
  });

  const events: MathMusicEvent[] = [];

  for (let index = 0; index < eventCount; index += 1) {
    const previousX = orbit[index];
    const x = orbit[index + 1];
    const delta = x - previousX;
    const withinBar = index % EVENTS_PER_BAR;
    const musical = melodyFromX(x);

    events.push({
      id: `explore-${r.toFixed(6)}-${index}`,
      segmentId: 'explore',
      macroChapter: 'Explore',
      chapterLabel: 'Interactive portrait',
      globalIndex: index,
      segmentIndex: index,
      orbitIndex: index + 1,
      r,
      x,
      previousX,
      delta,
      lambda: classification.lambda,
      detectedPeriod: classification.period,
      regime: classification.regime,
      bar: Math.floor(index / EVENTS_PER_BAR) + 1,
      beat: Math.floor(withinBar / 2) + 1,
      subdivision: withinBar % 2,
      timeSeconds: index * EVENT_INTERVAL_SECONDS,
      durationSeconds: EVENT_DURATION_SECONDS,
      raw: {
        frequencyHz: rawFrequencyFromX(x),
        velocity: 0.55,
      },
      musical: {
        note: musical.note,
        midi: musical.midi,
        bucket: musical.bucket,
        velocity: velocityFromDelta(delta),
        pan: panFromDelta(delta),
        articulation: articulationFromDelta(delta),
        bassTrigger: false,
        haloTrigger: false,
        transientTrigger: false,
      },
      source: {
        x0,
        burnIn: CANONICAL_BURN_IN,
        mappingVersion: MAPPING_VERSION,
      },
    });
  }

  return {
    r,
    x0,
    bars,
    durationSeconds: eventCount * EVENT_INTERVAL_SECONDS,
    events,
  };
}

export const EXPLORE_PORTRAIT_BPM = BPM;
