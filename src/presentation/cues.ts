import { SCORE_TIMELINE } from '../composition';

export type PresentationCue = {
  id: string;
  segmentId: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  r: number;
  talkingPoint: string;
  demoAction: string;
  fallbackLine: string;
};

function segment(id: string) {
  const match = SCORE_TIMELINE.find((entry) => entry.id === id);
  if (!match) throw new Error(`Missing presentation segment: ${id}`);
  return match;
}

function cue(
  segmentId: string,
  title: string,
  talkingPoint: string,
  demoAction: string,
  fallbackLine: string,
): PresentationCue {
  const source = segment(segmentId);
  return {
    id: `cue-${segmentId}`,
    segmentId,
    title,
    startSeconds: source.startSeconds,
    endSeconds: source.endSeconds,
    r: source.r,
    talkingPoint,
    demoAction,
    fallbackLine,
  };
}

export const PRESENTATION_CUES: readonly PresentationCue[] = [
  cue(
    'equilibrium',
    'One equation, one attractor',
    'At r = 2.8 the orbit settles to a period-1 attractor. The repeated sound is not a loop sample; it is the repeated orbit value.',
    'Start in RAW mode and let the fixed pulse establish the mapping.',
    'The mathematical state is stable: one attracting value, one repeating pitch.',
  ),
  cue(
    'split',
    'The first split',
    'At r = 3.2 the attractor alternates between two values, so the sonification exposes a two-event cycle.',
    'Jump to II. Split and point to the two orbit bands.',
    'The system now alternates between two stable states.',
  ),
  cue(
    'four',
    'Period four',
    'At r = 3.5 the orbit follows a four-value cycle. The pulse stays constant; only the mathematical pattern gets longer.',
    'Jump to III. Four and count the repeating pattern.',
    'The period doubles again: four states before repetition.',
  ),
  cue(
    'cascade-8',
    'The cascade accelerates',
    'Successive parameter choices expose period 8, period 16, and higher finite periodicity without changing the tempo.',
    'Use IV. Cascade to show that complexity comes from orbit structure, not faster playback.',
    'The rhythm is unchanged; the orbit itself takes longer to repeat.',
  ),
  cue(
    'break',
    'Deterministic chaos',
    'At r = 3.72 no low period is detected and the finite Lyapunov estimate is positive. The sequence is deterministic, not random.',
    'Jump to V. Break and compare the irregular orbit trail with the earlier cycles.',
    'The equation is still deterministic even though nearby states separate rapidly.',
  ),
  cue(
    'island',
    'Order returns inside chaos',
    'Near r = 3.83 a period-3 window appears. This is the central reveal: larger r does not mean monotonically more chaos.',
    'Jump to VI. Island, then switch RAW ↔ MUSICALIZED while keeping the same orbit events.',
    'The system returns to a three-state cycle inside a broader chaotic parameter region.',
  ),
  cue(
    'return',
    'Chaos returns',
    'At r = 3.9 the finite orbit is chaotic again, making the period-3 window visibly and audibly exceptional.',
    'Jump to VII. Return and compare it directly with VI. Island.',
    'After the ordered window, the irregular deterministic orbit returns.',
  ),
  cue(
    'limit',
    'Strip the composition back to the math',
    'At r = 4 the ending removes artistic layers until the continuous-frequency RAW sonification is exposed again.',
    'Play VIII. Limit and let the final coda remove transient, halo, bass, and drone.',
    'The piece ends where its evidence began: orbit value to sound, directly.',
  ),
] as const;

export function presentationCueAtTime(seconds: number): PresentationCue {
  const safe = Math.max(0, seconds);
  let current = PRESENTATION_CUES[0];
  for (const cue of PRESENTATION_CUES) {
    if (cue.startSeconds > safe) break;
    current = cue;
  }
  return current;
}

export function nextPresentationCue(seconds: number): PresentationCue | null {
  return PRESENTATION_CUES.find((cue) => cue.startSeconds > seconds) ?? null;
}
