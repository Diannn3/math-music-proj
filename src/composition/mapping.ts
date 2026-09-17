export const MELODY_SCALE = [
  { note: 'D3', midi: 50 }, { note: 'F3', midi: 53 }, { note: 'G3', midi: 55 },
  { note: 'A3', midi: 57 }, { note: 'C4', midi: 60 }, { note: 'D4', midi: 62 },
  { note: 'F4', midi: 65 }, { note: 'G4', midi: 67 }, { note: 'A4', midi: 69 },
  { note: 'C5', midi: 72 }, { note: 'D5', midi: 74 }, { note: 'F5', midi: 77 },
  { note: 'G5', midi: 79 }, { note: 'A5', midi: 81 }, { note: 'C6', midi: 84 },
] as const;

export type Articulation = 'soft' | 'normal' | 'accent' | 'strong';

export function rawFrequencyFromX(x: number): number {
  return 110 * 2 ** (4 * x);
}

export function melodyFromX(x: number): { note: string; midi: number; bucket: number } {
  const bounded = Math.min(1, Math.max(0, x));
  const bucket = Math.min(MELODY_SCALE.length - 1, Math.floor(bounded * MELODY_SCALE.length));
  const pitch = MELODY_SCALE[bucket];
  return { ...pitch, bucket };
}

export function velocityFromDelta(delta: number): number {
  const magnitude = Math.abs(delta);
  const normalized = Math.min(1, magnitude / 0.6);
  return 0.35 + 0.55 * Math.sqrt(normalized);
}

export function panFromDelta(delta: number, tolerance = 1e-4): number {
  if (delta > tolerance) return 0.3;
  if (delta < -tolerance) return -0.3;
  return 0;
}

export function articulationFromDelta(delta: number): Articulation {
  const magnitude = Math.abs(delta);
  if (magnitude < 0.08) return 'soft';
  if (magnitude < 0.25) return 'normal';
  if (magnitude < 0.5) return 'accent';
  return 'strong';
}
