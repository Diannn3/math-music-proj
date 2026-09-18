import { describe, expect, it } from 'vitest';
import { encodePcm16Wave } from '../export';

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

describe('PCM16 WAV encoder', () => {
  it('writes a valid stereo RIFF/WAVE header', () => {
    const left = new Float32Array([0, 0.5, -0.5, 1]);
    const right = new Float32Array([0, -0.5, 0.5, -1]);
    const bytes = encodePcm16Wave([left, right], 44100);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    expect(ascii(bytes, 0, 4)).toBe('RIFF');
    expect(ascii(bytes, 8, 4)).toBe('WAVE');
    expect(ascii(bytes, 12, 4)).toBe('fmt ');
    expect(ascii(bytes, 36, 4)).toBe('data');
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(44100);
    expect(view.getUint16(34, true)).toBe(16);
    expect(bytes.byteLength).toBe(44 + 4 * 2 * 2);
  });

  it('clips samples to the PCM16 range', () => {
    const bytes = encodePcm16Wave([new Float32Array([2, -2])], 8000);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32768);
  });

  it('rejects mismatched channel lengths', () => {
    expect(() => encodePcm16Wave([
      new Float32Array([0, 1]),
      new Float32Array([0]),
    ], 44100)).toThrow(/same frame count/);
  });
});
