import { describe, expect, it } from 'vitest';
import { generateCanonicalScore, SCORE_TIMELINE } from '../composition';
import { createProvenanceDocument, scoreToMidi } from '../export';
import { codaStateForEvent } from '../audio';

describe('export system', () => {
  const score = generateCanonicalScore();

  it('serializes the canonical anti-hallucination provenance', () => {
    const document = createProvenanceDocument(score);
    expect(document.schema).toBe('bifurcate.provenance.v1');
    expect(document.performance.primaryEventCount).toBe(736);
    expect(document.events).toHaveLength(736);
    expect(document.chapters).toEqual(SCORE_TIMELINE);
    expect(document.integrityNotes.some((note) => note.includes('MIDI'))).toBe(true);
    expect(document.mappings.raw.pitch).toContain('110');
    expect(document.mappings.musicalized.artisticLayers).toContain('D2/A2 tonal anchor once per bar');
  });

  it('exports the coda-aware arrangement as six MIDI tracks', () => {
    const midi = scoreToMidi(score);
    expect(midi.header.tempos[0].bpm).toBe(96);
    expect(midi.tracks).toHaveLength(6);

    const [lead, bass, halo, drone, transient, rawCoda] = midi.tracks;
    expect(lead.name).toBe('Orbit Lead');

    const musicalEvents = score.events.filter((event) => codaStateForEvent(event).musicalMix > 0);
    const bassEvents = score.events.filter((event) => event.musical.bassTrigger && codaStateForEvent(event).bass);
    const haloEvents = score.events.filter((event) => event.musical.haloTrigger && codaStateForEvent(event).halo);
    const droneEvents = score.events.filter((event) => event.globalIndex % 8 === 0 && codaStateForEvent(event).drone);
    const transientEvents = score.events.filter((event) => event.musical.transientTrigger && codaStateForEvent(event).transient);
    const rawEvents = score.events.filter((event) => codaStateForEvent(event).rawMix > 0);

    expect(lead.notes).toHaveLength(musicalEvents.length);
    expect(bass.notes).toHaveLength(bassEvents.length);
    expect(halo.notes).toHaveLength(haloEvents.length);
    expect(drone.notes).toHaveLength(droneEvents.length * 2);
    expect(transient.notes).toHaveLength(transientEvents.length);
    expect(rawCoda.notes).toHaveLength(rawEvents.length);
    expect(rawCoda.name).toContain('nearest-semitone');
  });
});
