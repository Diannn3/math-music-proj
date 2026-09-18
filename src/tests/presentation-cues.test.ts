import { describe, expect, it } from 'vitest';
import { SCORE_TIMELINE } from '../composition';
import {
  PRESENTATION_CUES,
  nextPresentationCue,
  presentationCueAtTime,
} from '../presentation/cues';

describe('presentation cue score', () => {
  it('stays ordered and anchored to canonical score segments', () => {
    expect(PRESENTATION_CUES).toHaveLength(8);

    let previous = -1;
    for (const cue of PRESENTATION_CUES) {
      expect(cue.startSeconds).toBeGreaterThan(previous);
      previous = cue.startSeconds;

      const segment = SCORE_TIMELINE.find((entry) => entry.id === cue.segmentId);
      expect(segment).toBeDefined();
      expect(cue.startSeconds).toBe(segment!.startSeconds);
      expect(cue.endSeconds).toBe(segment!.endSeconds);
      expect(cue.r).toBe(segment!.r);
    }
  });

  it('preserves the period-3 reveal at 2:30', () => {
    const island = PRESENTATION_CUES.find((cue) => cue.segmentId === 'island');
    expect(island).toMatchObject({
      startSeconds: 150,
      r: 3.83,
    });
    expect(island!.talkingPoint).toMatch(/period-3 window/i);
  });

  it('finds the active and next cue deterministically', () => {
    expect(presentationCueAtTime(0).segmentId).toBe('equilibrium');
    expect(presentationCueAtTime(149.99).segmentId).toBe('break');
    expect(presentationCueAtTime(150).segmentId).toBe('island');
    expect(nextPresentationCue(150)?.segmentId).toBe('return');
    expect(nextPresentationCue(230)).toBeNull();
  });
});
