import * as Tone from 'tone';
import {
  EVENT_INTERVAL_SECONDS,
  EVENTS_PER_BAR,
  type CanonicalScore,
  type MathMusicEvent,
} from '../composition';
import {
  DRONE_NOTES,
  durationForArticulation,
  foldMidiToBass,
  midiToNoteName,
  modulationIndexForRegime,
  reverbWetForRegime,
} from './musicalArrangement';
import { clampScoreTime } from './timeline';
import { codaStateForEvent } from './coda';

export type MusicalAudioEventCallback = (event: MathMusicEvent, audioTime: number) => void;

/**
 * Plays the explicitly MUSICALIZED interpretation of the canonical score.
 * The orbit lead owns the mathematical melody. Bass, halo, drone, noise,
 * synthesis and effects are documented compositional decisions.
 */
export class MusicalAudioEngine {
  private readonly score: CanonicalScore;
  private lead: Tone.FMSynth | null = null;
  private leadPanner: Tone.Panner | null = null;
  private bass: Tone.MonoSynth | null = null;
  private halo: Tone.PolySynth | null = null;
  private drone: Tone.PolySynth | null = null;
  private transient: Tone.NoiseSynth | null = null;
  private rawCoda: Tone.Synth | null = null;
  private reverb: Tone.Reverb | null = null;
  private compressor: Tone.Compressor | null = null;
  private limiter: Tone.Limiter | null = null;
  private scheduledIds: number[] = [];
  private scheduled = false;
  private eventCallback: MusicalAudioEventCallback | null = null;

  constructor(score: CanonicalScore) {
    this.score = score;
  }

  get transport() { return Tone.getTransport(); }
  get initialized(): boolean { return this.lead !== null; }
  get currentTimeSeconds(): number { return this.transport.seconds; }

  setEventCallback(callback: MusicalAudioEventCallback | null): void {
    this.eventCallback = callback;
  }

  async initialize(): Promise<void> {
    await Tone.start();
    if (this.lead) return;

    this.limiter = new Tone.Limiter(-1).toDestination();
    this.compressor = new Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.2 }).connect(this.limiter);
    this.reverb = new Tone.Reverb({ decay: 2.8, preDelay: 0.015, wet: 0.18 }).connect(this.compressor);
    await this.reverb.ready;

    this.leadPanner = new Tone.Panner(0).connect(this.reverb);
    this.lead = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 2.2,
      oscillator: { type: 'sine' },
      modulation: { type: 'triangle' },
      envelope: { attack: 0.008, decay: 0.08, sustain: 0.32, release: 0.18 },
      modulationEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.2, release: 0.12 },
      volume: -10,
    }).connect(this.leadPanner);

    this.bass = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { type: 'lowpass', Q: 1, rolloff: -24 },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.18,
        sustain: 0.2,
        release: 0.25,
        baseFrequency: 90,
        octaves: 2.2,
      },
      envelope: { attack: 0.01, decay: 0.08, sustain: 0.42, release: 0.2 },
      volume: -15,
    }).connect(this.compressor);

    this.halo = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.12, decay: 0.2, sustain: 0.24, release: 0.8 },
      volume: -20,
    }).connect(this.reverb);
    this.halo.maxPolyphony = 8;

    this.drone = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.25, decay: 0.4, sustain: 0.55, release: 0.8 },
      volume: -27,
    }).connect(this.compressor);
    this.drone.maxPolyphony = 4;

    this.transient = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.045, sustain: 0, release: 0.02 },
      volume: -28,
    }).connect(this.compressor);

    this.rawCoda = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.004, decay: 0.02, sustain: 0.95, release: 0.025 },
      volume: -10,
    }).connect(this.compressor);

    this.transport.bpm.value = this.score.tempoBpm;
    this.transport.timeSignature = 4;
  }

  schedule(): void {
    if (!this.initialized) throw new Error('MusicalAudioEngine.initialize() must be called before schedule().');
    this.clearSchedule();

    for (const event of this.score.events) {
      const id = this.transport.schedule((time) => {
        const coda = codaStateForEvent(event);
        const duration = durationForArticulation(event.musical.articulation, EVENT_INTERVAL_SECONDS);
        this.leadPanner?.pan.setValueAtTime(event.musical.pan, time);
        this.lead?.modulationIndex.setValueAtTime(modulationIndexForRegime(event.regime), time);
        this.reverb?.wet.setValueAtTime(reverbWetForRegime(event.regime), time);

        if (coda.musicalMix > 0) {
          this.lead?.triggerAttackRelease(
            event.musical.note,
            duration,
            time,
            event.musical.velocity * coda.musicalMix,
          );
        }

        if (coda.rawMix > 0) {
          this.rawCoda?.triggerAttackRelease(
            event.raw.frequencyHz,
            event.durationSeconds,
            time,
            event.raw.velocity * coda.rawMix,
          );
        }

        if (event.musical.bassTrigger && coda.bass) {
          const bassNote = midiToNoteName(foldMidiToBass(event.musical.midi));
          this.bass?.triggerAttackRelease(bassNote, EVENT_INTERVAL_SECONDS * 1.45, time, Math.min(0.72, event.musical.velocity * 0.78));
        }

        if (event.musical.haloTrigger && coda.halo) {
          this.halo?.triggerAttackRelease(event.musical.note, EVENT_INTERVAL_SECONDS * 3.1, time, 0.18 + event.musical.velocity * 0.15);
        }

        if (event.globalIndex % EVENTS_PER_BAR === 0 && coda.drone) {
          this.drone?.triggerAttackRelease([...DRONE_NOTES], EVENT_INTERVAL_SECONDS * EVENTS_PER_BAR * 0.92, time, 0.11);
        }

        if (event.musical.transientTrigger && coda.transient) {
          this.transient?.triggerAttackRelease(0.045, time, Math.min(0.34, 0.12 + Math.abs(event.delta) * 0.22));
        }

        if (this.eventCallback) {
          Tone.getDraw().schedule(() => this.eventCallback?.(event, time), time);
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

  pause(): void { if (this.transport.state === 'started') this.transport.pause(); }
  stop(): void { this.transport.stop(); this.transport.seconds = 0; }
  seek(seconds: number): void { this.transport.seconds = clampScoreTime(this.score, seconds); }

  private clearSchedule(): void {
    for (const id of this.scheduledIds) this.transport.clear(id);
    this.scheduledIds = [];
    this.scheduled = false;
  }

  dispose(): void {
    this.stop();
    this.clearSchedule();
    this.lead?.dispose();
    this.leadPanner?.dispose();
    this.bass?.dispose();
    this.halo?.dispose();
    this.drone?.dispose();
    this.transient?.dispose();
    this.rawCoda?.dispose();
    this.reverb?.dispose();
    this.compressor?.dispose();
    this.limiter?.dispose();
    this.lead = null;
    this.leadPanner = null;
    this.bass = null;
    this.halo = null;
    this.drone = null;
    this.transient = null;
    this.rawCoda = null;
    this.reverb = null;
    this.compressor = null;
    this.limiter = null;
    this.eventCallback = null;
  }
}
