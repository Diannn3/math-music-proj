import { classifyOrbit, generateOrbit } from '../math';
import {
  BPM,
  CANONICAL_BURN_IN,
  CANONICAL_X0,
  EVENT_DURATION_SECONDS,
  EVENT_INTERVAL_SECONDS,
  EVENTS_PER_BAR,
  SCORE_SEGMENTS,
  TOTAL_BARS,
  TOTAL_SECONDS,
} from './chapters';
import {
  articulationFromDelta,
  melodyFromX,
  panFromDelta,
  rawFrequencyFromX,
  velocityFromDelta,
} from './mapping';
import type { CanonicalScore, MathMusicEvent } from './types';

export const SCORE_VERSION = '0.1.0';
export const MAPPING_VERSION = '1.0.0';

export function generateCanonicalScore(): CanonicalScore {
  const events: MathMusicEvent[] = [];
  let globalIndex = 0;
  let absoluteBarOffset = 0;

  for (const segment of SCORE_SEGMENTS) {
    const eventCount = segment.bars * EVENTS_PER_BAR;
    const orbit = generateOrbit({
      r: segment.r,
      x0: CANONICAL_X0,
      burnIn: CANONICAL_BURN_IN,
      count: Math.max(eventCount + 1, 2048),
    });

    const classification = classifyOrbit(orbit, segment.r, {
      period: { maxPeriod: 128, tolerance: 1e-8, repetitions: 6 },
    });

    for (let segmentIndex = 0; segmentIndex < eventCount; segmentIndex += 1) {
      const x = orbit[segmentIndex + 1];
      const previousX = orbit[segmentIndex];
      const delta = x - previousX;
      const localBar = Math.floor(segmentIndex / EVENTS_PER_BAR);
      const withinBar = segmentIndex % EVENTS_PER_BAR;
      const beat = Math.floor(withinBar / 2) + 1;
      const subdivision = withinBar % 2;
      const musical = melodyFromX(x);

      events.push({
        id: `${segment.id}-${String(segmentIndex).padStart(3, '0')}`,
        segmentId: segment.id,
        macroChapter: segment.macroChapter,
        chapterLabel: segment.label,
        globalIndex,
        segmentIndex,
        orbitIndex: segmentIndex + 1,
        r: segment.r,
        x,
        previousX,
        delta,
        lambda: classification.lambda,
        detectedPeriod: classification.period,
        regime: classification.regime,
        bar: absoluteBarOffset + localBar + 1,
        beat,
        subdivision,
        timeSeconds: globalIndex * EVENT_INTERVAL_SECONDS,
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
          bassTrigger: globalIndex % 2 === 0,
          haloTrigger: globalIndex % 4 === 0,
          transientTrigger: Math.abs(delta) > 0.45,
        },
        source: {
          x0: CANONICAL_X0,
          burnIn: CANONICAL_BURN_IN,
          mappingVersion: MAPPING_VERSION,
        },
      });

      globalIndex += 1;
    }

    absoluteBarOffset += segment.bars;
  }

  return {
    project: 'BIFURCATE',
    version: SCORE_VERSION,
    mappingVersion: MAPPING_VERSION,
    equation: 'x[n+1] = r*x[n]*(1-x[n])',
    x0: CANONICAL_X0,
    burnIn: CANONICAL_BURN_IN,
    tempoBpm: BPM,
    meter: '4/4',
    bars: TOTAL_BARS,
    durationSeconds: TOTAL_SECONDS,
    events,
  };
}
