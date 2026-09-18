import * as Tone from 'tone';
import {
  EVENT_INTERVAL_SECONDS,
  EVENTS_PER_BAR,
  type CanonicalScore,
} from '../composition';
import {
  DRONE_NOTES,
  durationForArticulation,
  foldMidiToBass,
  midiToNoteName,
  modulationIndexForRegime,
  reverbWetForRegime,
} from '../audio/musicalArrangement';
import { codaStateForEvent } from '../audio/coda';
import { MASTER_COMPRESSOR, MASTER_LIMITER_DB, MASTER_REVERB, RAW_CODA_VOLUME_DB, RAW_SYNTH_VOLUME_DB } from '../audio/releaseAudio';

export type OfflineRenderMode = 'raw' | 'musicalized';

export async function renderScoreOffline(
  score: CanonicalScore,
  mode: OfflineRenderMode,
  sampleRate = 44100,
): Promise<AudioBuffer> {
  const tail = mode === 'musicalized' ? 3 : 0.5;
  const rendered = await Tone.Offline(async () => {
    const limiter = new Tone.Limiter(MASTER_LIMITER_DB).toDestination();

    if (mode === 'raw') {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.004, decay: 0.02, sustain: 0.95, release: 0.025 },
        volume: RAW_SYNTH_VOLUME_DB,
      }).connect(limiter);

      for (const event of score.events) {
        synth.triggerAttackRelease(
          event.raw.frequencyHz,
          event.durationSeconds,
          event.timeSeconds,
          event.raw.velocity,
        );
      }
      return;
    }

    const compressor = new Tone.Compressor(MASTER_COMPRESSOR).connect(limiter);

    const reverb = new Tone.Reverb(MASTER_REVERB).connect(compressor);
    await reverb.ready;

    const leadPanner = new Tone.Panner(0).connect(reverb);
    const lead = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 2.2,
      oscillator: { type: 'sine' },
      modulation: { type: 'triangle' },
      envelope: { attack: 0.008, decay: 0.08, sustain: 0.32, release: 0.18 },
      modulationEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.2, release: 0.12 },
      volume: -10,
    }).connect(leadPanner);

    const bass = new Tone.MonoSynth({
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
    }).connect(compressor);

    const halo = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.12, decay: 0.2, sustain: 0.24, release: 0.8 },
      volume: -20,
    }).connect(reverb);
    halo.maxPolyphony = 8;

    const drone = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.25, decay: 0.4, sustain: 0.55, release: 0.8 },
      volume: -27,
    }).connect(compressor);
    drone.maxPolyphony = 4;

    const transient = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.001, decay: 0.045, sustain: 0, release: 0.02 },
      volume: -28,
    }).connect(compressor);

    const rawCoda = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.004, decay: 0.02, sustain: 0.95, release: 0.025 },
      volume: RAW_CODA_VOLUME_DB,
    }).connect(compressor);

    for (const event of score.events) {
      const time = event.timeSeconds;
      const coda = codaStateForEvent(event);
      leadPanner.pan.setValueAtTime(event.musical.pan, time);
      lead.modulationIndex.setValueAtTime(modulationIndexForRegime(event.regime), time);
      reverb.wet.setValueAtTime(reverbWetForRegime(event.regime), time);

      if (coda.musicalMix > 0) {
        lead.triggerAttackRelease(
          event.musical.note,
          durationForArticulation(event.musical.articulation, EVENT_INTERVAL_SECONDS),
          time,
          event.musical.velocity * coda.musicalMix,
        );
      }

      if (coda.rawMix > 0) {
        rawCoda.triggerAttackRelease(
          event.raw.frequencyHz,
          event.durationSeconds,
          time,
          event.raw.velocity * coda.rawMix,
        );
      }

      if (event.musical.bassTrigger && coda.bass) {
        bass.triggerAttackRelease(
          midiToNoteName(foldMidiToBass(event.musical.midi)),
          EVENT_INTERVAL_SECONDS * 1.45,
          time,
          Math.min(0.72, event.musical.velocity * 0.78),
        );
      }

      if (event.musical.haloTrigger && coda.halo) {
        halo.triggerAttackRelease(
          event.musical.note,
          EVENT_INTERVAL_SECONDS * 3.1,
          time,
          0.18 + event.musical.velocity * 0.15,
        );
      }

      if (event.globalIndex % EVENTS_PER_BAR === 0 && coda.drone) {
        drone.triggerAttackRelease(
          [...DRONE_NOTES],
          EVENT_INTERVAL_SECONDS * EVENTS_PER_BAR * 0.92,
          time,
          0.11,
        );
      }

      if (event.musical.transientTrigger && coda.transient) {
        transient.triggerAttackRelease(
          0.045,
          time,
          Math.min(0.34, 0.12 + Math.abs(event.delta) * 0.22),
        );
      }
    }
  }, score.durationSeconds + tail, 2, sampleRate);

  const buffer = rendered.get();
  if (!buffer) throw new Error('Tone.Offline completed without an AudioBuffer.');
  return buffer;
}
