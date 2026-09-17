import type { Articulation } from '../composition';
import type { OrbitRegime } from '../math';

export const DRONE_NOTES = ['D2', 'A2'] as const;

export function foldMidiToBass(midi: number): number {
  if (!Number.isFinite(midi)) throw new TypeError('midi must be finite.');
  let folded = Math.round(midi);
  while (folded > 48) folded -= 12;
  while (folded < 38) folded += 12;
  return folded;
}

export function midiToNoteName(midi: number): string {
  const rounded = Math.round(midi);
  const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pitchClass = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  return `${pitchClasses[pitchClass]}${octave}`;
}

export function durationForArticulation(articulation: Articulation, eventIntervalSeconds: number): number {
  const ratios: Record<Articulation, number> = { soft: 0.92, normal: 0.76, accent: 0.62, strong: 0.48 };
  return eventIntervalSeconds * ratios[articulation];
}

export function modulationIndexForRegime(regime: OrbitRegime): number {
  switch (regime) {
    case 'periodic': return 2.2;
    case 'chaotic': return 5.4;
    case 'transition-or-unresolved': return 3.4;
  }
}

export function reverbWetForRegime(regime: OrbitRegime): number {
  switch (regime) {
    case 'periodic': return 0.14;
    case 'chaotic': return 0.24;
    case 'transition-or-unresolved': return 0.19;
  }
}
