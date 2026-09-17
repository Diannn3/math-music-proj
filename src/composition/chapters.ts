export type ScoreSegment = {
  id: string;
  macroChapter: string;
  label: string;
  bars: number;
  r: number;
  expectedPeriod: number | null;
  expectedRegime: 'periodic' | 'chaotic' | 'high-period';
};

export const BPM = 96;
export const BEATS_PER_BAR = 4;
export const EVENTS_PER_BEAT = 2;
export const EVENTS_PER_BAR = BEATS_PER_BAR * EVENTS_PER_BEAT;
export const SECONDS_PER_BEAT = 60 / BPM;
export const EVENT_INTERVAL_SECONDS = SECONDS_PER_BEAT / EVENTS_PER_BEAT;
export const EVENT_DURATION_SECONDS = EVENT_INTERVAL_SECONDS * 0.75;
export const CANONICAL_X0 = 0.2;
export const CANONICAL_BURN_IN = 4096;

export const SCORE_SEGMENTS: readonly ScoreSegment[] = [
  { id: 'equilibrium', macroChapter: 'I. Equilibrium', label: 'Equilibrium', bars: 8, r: 2.8, expectedPeriod: 1, expectedRegime: 'periodic' },
  { id: 'split', macroChapter: 'II. Split', label: 'Split', bars: 12, r: 3.2, expectedPeriod: 2, expectedRegime: 'periodic' },
  { id: 'four', macroChapter: 'III. Four', label: 'Four', bars: 12, r: 3.5, expectedPeriod: 4, expectedRegime: 'periodic' },
  { id: 'cascade-8', macroChapter: 'IV. Cascade', label: 'Cascade — 8', bars: 4, r: 3.55, expectedPeriod: 8, expectedRegime: 'periodic' },
  { id: 'cascade-16', macroChapter: 'IV. Cascade', label: 'Cascade — 16', bars: 4, r: 3.568, expectedPeriod: 16, expectedRegime: 'periodic' },
  { id: 'cascade-high', macroChapter: 'IV. Cascade', label: 'Cascade — High Period', bars: 4, r: 3.5698, expectedPeriod: 64, expectedRegime: 'high-period' },
  { id: 'break', macroChapter: 'V. Break', label: 'Break', bars: 16, r: 3.72, expectedPeriod: null, expectedRegime: 'chaotic' },
  { id: 'island', macroChapter: 'VI. Island', label: 'Periodic Window', bars: 12, r: 3.83, expectedPeriod: 3, expectedRegime: 'periodic' },
  { id: 'return', macroChapter: 'VII. Return', label: 'Return', bars: 12, r: 3.9, expectedPeriod: null, expectedRegime: 'chaotic' },
  { id: 'limit', macroChapter: 'VIII. Limit', label: 'Limit', bars: 8, r: 4, expectedPeriod: null, expectedRegime: 'chaotic' },
] as const;

export const TOTAL_BARS = SCORE_SEGMENTS.reduce((sum, segment) => sum + segment.bars, 0);
export const TOTAL_PRIMARY_EVENTS = TOTAL_BARS * EVENTS_PER_BAR;
export const TOTAL_SECONDS = TOTAL_BARS * BEATS_PER_BAR * SECONDS_PER_BEAT;
