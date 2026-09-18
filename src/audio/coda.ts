import { EVENTS_PER_BAR, type MathMusicEvent } from '../composition';

export type CodaState = {
  active: boolean;
  progress: number;
  musicalMix: number;
  rawMix: number;
  transient: boolean;
  halo: boolean;
  bass: boolean;
  drone: boolean;
};

const CODA_START_EVENT = EVENTS_PER_BAR * 4;
const CODA_EVENT_COUNT = EVENTS_PER_BAR * 4;

export function codaStateForEvent(event: MathMusicEvent): CodaState {
  if (event.segmentId !== 'limit' || event.segmentIndex < CODA_START_EVENT) {
    return {
      active: false,
      progress: 0,
      musicalMix: 1,
      rawMix: 0,
      transient: true,
      halo: true,
      bass: true,
      drone: true,
    };
  }

  const localIndex = Math.min(
    CODA_EVENT_COUNT - 1,
    Math.max(0, event.segmentIndex - CODA_START_EVENT),
  );
  const codaBar = Math.floor(localIndex / EVENTS_PER_BAR);
  const progress = (localIndex + 1) / CODA_EVENT_COUNT;

  return {
    active: true,
    progress,
    musicalMix: 1 - progress,
    rawMix: progress,
    transient: false,
    halo: codaBar === 0,
    bass: codaBar <= 1,
    drone: codaBar <= 2,
  };
}

export function frequencyToNearestMidi(frequencyHz: number): number {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) {
    throw new RangeError('frequencyHz must be positive and finite.');
  }
  return Math.round(69 + 12 * Math.log2(frequencyHz / 440));
}
