import type { CanonicalScore, MathMusicEvent } from '../composition';

export function clampScoreTime(score: CanonicalScore, seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.min(score.durationSeconds, Math.max(0, seconds));
}

export function findEventAtTime(score: CanonicalScore, seconds: number): MathMusicEvent {
  const time = clampScoreTime(score, seconds);
  const events = score.events;

  if (time >= score.durationSeconds) {
    return events[events.length - 1];
  }

  let low = 0;
  let high = events.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const current = events[mid];
    const next = events[mid + 1];

    if (time < current.timeSeconds) {
      high = mid - 1;
      continue;
    }

    if (!next || time < next.timeSeconds) {
      return current;
    }

    low = mid + 1;
  }

  return events[0];
}
