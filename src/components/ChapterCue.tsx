import type { MathMusicEvent } from '../composition';

const CUES: Record<string, { title: string; detail: string }> = {
  equilibrium: { title: 'I — EQUILIBRIUM', detail: 'one attracting state' },
  split: { title: 'II — SPLIT', detail: 'one becomes two' },
  four: { title: 'III — FOUR', detail: 'a four-state orbit becomes an ostinato' },
  'cascade-8': { title: 'IV — CASCADE', detail: 'period 8' },
  'cascade-16': { title: 'IV — CASCADE', detail: 'period 16' },
  'cascade-high': { title: 'IV — CASCADE', detail: 'repetition expands beyond easy perception' },
  break: { title: 'V — BREAK', detail: 'positive λ · deterministic irregularity' },
  island: { title: 'VI — PERIODIC WINDOW', detail: 'order returns inside the chaotic parameter region' },
  return: { title: 'VII — RETURN', detail: 'chaotic behavior returns' },
  limit: { title: 'VIII — LIMIT', detail: 'r = 4 · λ approaches ln 2 for the typical orbit' },
};

export default function ChapterCue({ event }: { event: MathMusicEvent }) {
  const cue = CUES[event.segmentId];
  if (!cue) return null;

  return (
    <div key={event.segmentId} className="chapter-cue" aria-live="polite">
      <span>{cue.title}</span>
      <strong>{cue.detail}</strong>
    </div>
  );
}
