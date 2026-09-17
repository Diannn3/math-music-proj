import * as Tone from 'tone';
import type { CanonicalScore, MathMusicEvent } from '../composition';
import { clampScoreTime } from './timeline';

export type RawAudioEventCallback = (event: MathMusicEvent, audioTime: number) => void;

export class RawAudioEngine {
  private readonly score: CanonicalScore;
  private synth: Tone.Synth | null = null;
  private limiter: Tone.Limiter | null = null;
  private scheduledIds: number[] = [];
  private scheduled = false;
  private eventCallback: RawAudioEventCallback | null = null;

  constructor(score: CanonicalScore) {
    this.score = score;
  }

  get transport() {
    return Tone.getTransport();
  }

  get initialized(): boolean {
    return this.synth !== null;
  }

  get currentTimeSeconds(): number {
    return this.transport.seconds;
  }

  setEventCallback(callback: RawAudioEventCallback | null): void {
    this.eventCallback = callback;
  }

  async initialize(): Promise<void> {
    await Tone.start();

    if (this.synth) return;

    this.limiter = new Tone.Limiter(-1).toDestination();
    this.synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.004, decay: 0.02, sustain: 0.95, release: 0.025 },
      volume: -8,
    }).connect(this.limiter);

    this.transport.bpm.value = this.score.tempoBpm;
    this.transport.timeSignature = 4;
  }

  schedule(): void {
    if (!this.synth) throw new Error('RawAudioEngine.initialize() must be called before schedule().');

    this.clearSchedule();

    for (const event of this.score.events) {
      const id = this.transport.schedule((time) => {
        this.synth?.triggerAttackRelease(event.raw.frequencyHz, event.durationSeconds, time, event.raw.velocity);
        if (this.eventCallback) {
          Tone.getDraw().schedule(() => {
            this.eventCallback?.(event, time);
          }, time);
        }
      }, event.timeSeconds);
      this.scheduledIds.push(id);
    }

    this.scheduled = true;
  }

  async play(fromSeconds?: number): Promise<void> {
    await this.initialize();
    if (!this.scheduled) this.schedule();
    if (typeof fromSeconds === 'number') this.seek(fromSeconds);
    if (this.transport.seconds >= this.score.durationSeconds) this.transport.seconds = 0;
    if (this.transport.state !== 'started') this.transport.start();
  }

  pause(): void {
    if (this.transport.state === 'started') this.transport.pause();
  }

  stop(): void {
    this.transport.stop();
    this.transport.seconds = 0;
  }

  seek(seconds: number): void {
    this.transport.seconds = clampScoreTime(this.score, seconds);
  }

  private clearSchedule(): void {
    for (const id of this.scheduledIds) this.transport.clear(id);
    this.scheduledIds = [];
    this.scheduled = false;
  }

  dispose(): void {
    this.stop();
    this.clearSchedule();
    this.synth?.dispose();
    this.limiter?.dispose();
    this.synth = null;
    this.limiter = null;
    this.eventCallback = null;
  }
}
