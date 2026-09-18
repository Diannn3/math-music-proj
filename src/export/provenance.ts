import {
  MELODY_SCALE,
  SCORE_TIMELINE,
  type CanonicalScore,
} from '../composition';

export function createProvenanceDocument(score: CanonicalScore) {
  return {
    schema: 'bifurcate.provenance.v1',
    project: score.project,
    version: score.version,
    equation: score.equation,
    numericalModel: {
      x0: score.x0,
      burnIn: score.burnIn,
      numberFormat: 'IEEE-754 binary64 / JavaScript number',
    },
    performance: {
      tempoBpm: score.tempoBpm,
      meter: score.meter,
      bars: score.bars,
      durationSeconds: score.durationSeconds,
      primaryEventCount: score.events.length,
    },
    chapters: SCORE_TIMELINE,
    mappings: {
      raw: {
        pitch: 'f = 110 * 2^(4x), 110–1760 Hz',
        rhythm: 'fixed eighth-note event grid',
        velocity: 0.55,
        pan: 0,
      },
      musicalized: {
        pitch: '15-note D minor pentatonic D3–C6, bucket=floor(clamp(x)*15)',
        scale: MELODY_SCALE,
        velocity: '0.35 + 0.55*sqrt(min(1, abs(delta)/0.6))',
        pan: 'sign(delta) mapped to -0.3 / 0 / +0.3',
        artisticLayers: [
          'FM orbit lead',
          'quarter-grid bass derived from mapped orbit pitch',
          'sparse harmonic halo derived from mapped orbit pitch',
          'D2/A2 tonal anchor once per bar',
          'pink-noise transient for abs(delta)>0.45',
          'regime-aware synthesis and reverb',
        ],
      },
    },
    integrityNotes: [
      'RAW and MUSICALIZED are different representations of the same canonical mathematical events.',
      'Scale quantization, bass, halo, drone, synthesis, effects, and arrangement are artistic decisions.',
      'r is not treated as a direct chaos meter; regime labels use orbit period detection and a finite Lyapunov estimate.',
      'MIDI export approximates synthesis/transient layers and is not rendered audio.',
    ],
    events: score.events,
  };
}

export function scoreToProvenanceJson(score: CanonicalScore): string {
  return JSON.stringify(createProvenanceDocument(score), null, 2);
}
