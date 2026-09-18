import { Midi } from '@tonejs/midi';
import {
  EVENT_INTERVAL_SECONDS,
  EVENTS_PER_BAR,
  type CanonicalScore,
} from '../composition';
import {
  durationForArticulation,
  foldMidiToBass,
} from '../audio/musicalArrangement';

const DRONE_MIDI = [38, 45] as const; // D2, A2

export function scoreToMidi(score: CanonicalScore): Midi {
  const midi = new Midi();
  midi.header.name = 'BIFURCATE — Hearing the Logistic Map';
  midi.header.setTempo(score.tempoBpm);
  midi.header.timeSignatures.push({ ticks: 0, timeSignature: [4, 4] });

  const lead = midi.addTrack();
  lead.name = 'Orbit Lead';

  const bass = midi.addTrack();
  bass.name = 'Derived Bass';

  const halo = midi.addTrack();
  halo.name = 'Harmonic Halo';

  const drone = midi.addTrack();
  drone.name = 'Artistic Drone D2 A2';

  const transient = midi.addTrack();
  transient.name = 'Jump Transients (GM percussion approximation)';
  transient.channel = 9;

  for (const event of score.events) {
    lead.addNote({
      midi: event.musical.midi,
      time: event.timeSeconds,
      duration: durationForArticulation(event.musical.articulation, EVENT_INTERVAL_SECONDS),
      velocity: event.musical.velocity,
    });

    if (event.musical.bassTrigger) {
      bass.addNote({
        midi: foldMidiToBass(event.musical.midi),
        time: event.timeSeconds,
        duration: EVENT_INTERVAL_SECONDS * 1.45,
        velocity: Math.min(0.72, event.musical.velocity * 0.78),
      });
    }

    if (event.musical.haloTrigger) {
      halo.addNote({
        midi: event.musical.midi,
        time: event.timeSeconds,
        duration: EVENT_INTERVAL_SECONDS * 3.1,
        velocity: 0.18 + event.musical.velocity * 0.15,
      });
    }

    if (event.globalIndex % EVENTS_PER_BAR === 0) {
      for (const midiNote of DRONE_MIDI) {
        drone.addNote({
          midi: midiNote,
          time: event.timeSeconds,
          duration: EVENT_INTERVAL_SECONDS * EVENTS_PER_BAR * 0.92,
          velocity: 0.11,
        });
      }
    }

    if (event.musical.transientTrigger) {
      transient.addNote({
        midi: 42,
        time: event.timeSeconds,
        duration: 0.045,
        velocity: Math.min(0.34, 0.12 + Math.abs(event.delta) * 0.22),
      });
    }
  }

  return midi;
}

export function scoreToMidiBytes(score: CanonicalScore): Uint8Array {
  return scoreToMidi(score).toArray();
}
