import { describe, expect, it } from 'vitest';
import { generateCanonicalScore, SCORE_TIMELINE } from '../composition';
import { createProvenanceDocument, scoreToMidi } from '../export';

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

  it('exports the musicalized arrangement as five MIDI tracks', () => {
    const midi = scoreToMidi(score);
    expect(midi.header.tempos[0].bpm).toBe(96);
    expect(midi.tracks).toHaveLength(5);

    const [lead, bass, halo, drone, transient] = midi.tracks;
    expect(lead.name).toBe('Orbit Lead');
    expect(lead.notes).toHaveLength(score.events.length);
    expect(bass.notes).toHaveLength(score.events.filter((event) => event.musical.bassTrigger).length);
    expect(halo.notes).toHaveLength(score.events.filter((event) => event.musical.haloTrigger).length);
    expect(drone.notes).toHaveLength(score.bars * 2);
    expect(transient.notes).toHaveLength(score.events.filter((event) => event.musical.transientTrigger).length);
  });
});
