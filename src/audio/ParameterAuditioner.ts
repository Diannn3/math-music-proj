import * as Tone from 'tone';
import type { MathMusicEvent } from '../composition';

export type AuditionMode = 'raw' | 'musicalized';
export type AuditionEventCallback = (event: MathMusicEvent, audioTime: number) => void;

export class ParameterAuditioner {
  private rawSynth: Tone.Synth | null = null;
  private musicalSynth: Tone.FMSynth | null = null;
  private limiter: Tone.Limiter | null = null;
  private generation = 0;

  async initialize(): Promise<void> {
    await Tone.start();
    if (this.rawSynth && this.musicalSynth) return;

    this.limiter = new Tone.Limiter(-1).toDestination();

    this.rawSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.004, decay: 0.02, sustain: 0.95, release: 0.025 },
      volume: -8,
    }).connect(this.limiter);

    this.musicalSynth = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 2.2,
      oscillator: { type: 'sine' },
      modulation: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.08, sustain: 0.55, release: 0.12 },
      modulationEnvelope: { attack: 0.01, decay: 0.09, sustain: 0.35, release: 0.12 },
      volume: -10,
    }).connect(this.limiter);
  }

  async audition(
    events: readonly MathMusicEvent[],
    mode: AuditionMode,
    onEvent?: AuditionEventCallback,
    onComplete?: () => void,
  ): Promise<void> {
    if (events.length === 0) return;
    await this.initialize();

    const token = ++this.generation;
    const start = Tone.now() + 0.06;

    for (const event of events) {
      const time = start + event.timeSeconds;
      if (mode === 'raw') {
        this.rawSynth?.triggerAttackRelease(
          event.raw.frequencyHz,
          event.durationSeconds,
          time,
          event.raw.velocity,
        );
      } else {
        this.musicalSynth?.triggerAttackRelease(
          event.musical.note,
          event.durationSeconds,
          time,
          event.musical.velocity,
        );
      }

      if (onEvent) {
        Tone.getDraw().schedule(() => {
          if (token === this.generation) onEvent(event, time);
        }, time);
      }
    }

    const final = events[events.length - 1];
    Tone.getDraw().schedule(() => {
      if (token === this.generation) onComplete?.();
    }, start + final.timeSeconds + final.durationSeconds + 0.08);
  }

  cancel(): void {
    this.generation += 1;
    this.rawSynth?.triggerRelease();
    this.musicalSynth?.triggerRelease();
  }

  dispose(): void {
    this.cancel();
    this.rawSynth?.dispose();
    this.musicalSynth?.dispose();
    this.limiter?.dispose();
    this.rawSynth = null;
    this.musicalSynth = null;
    this.limiter = null;
  }
}
