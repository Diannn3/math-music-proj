import { describe, expect, it } from 'vitest';
import {
  durationForArticulation,
  foldMidiToBass,
  midiToNoteName,
  modulationIndexForRegime,
  reverbWetForRegime,
} from '../audio/musicalArrangement';

describe('musicalized arrangement helpers', () => {
  it('folds mapped notes into the planned D2-C3 bass region', () => {
    expect(foldMidiToBass(50)).toBe(38);
    expect(foldMidiToBass(60)).toBe(48);
    expect(foldMidiToBass(84)).toBe(48);
    expect(foldMidiToBass(69)).toBe(45);
  });

  it('converts MIDI numbers into deterministic note names', () => {
    expect(midiToNoteName(38)).toBe('D2');
    expect(midiToNoteName(45)).toBe('A2');
    expect(midiToNoteName(48)).toBe('C3');
  });

  it('shortens stronger articulations without changing event onset timing', () => {
    const interval = 0.3125;
    expect(durationForArticulation('soft', interval)).toBeGreaterThan(durationForArticulation('normal', interval));
    expect(durationForArticulation('normal', interval)).toBeGreaterThan(durationForArticulation('accent', interval));
    expect(durationForArticulation('accent', interval)).toBeGreaterThan(durationForArticulation('strong', interval));
  });

  it('uses orbit regime rather than r itself to shape timbral complexity', () => {
    expect(modulationIndexForRegime('chaotic')).toBeGreaterThan(modulationIndexForRegime('periodic'));
    expect(reverbWetForRegime('chaotic')).toBeGreaterThan(reverbWetForRegime('periodic'));
  });
});
