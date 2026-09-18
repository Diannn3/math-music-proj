import { describe, expect, it } from 'vitest';
import {
  classifyOfflineRenderRisk,
  encodePcm16Wave,
  estimateOfflineRenderBudget,
  inspectPcm16Wave,
} from '../export';

describe('offline render budgeting', () => {
  it('estimates the canonical musicalized working set explicitly', () => {
    const budget = estimateOfflineRenderBudget(230, 3, 44100, 2);

    expect(budget.floatBufferBytes).toBe(233 * 44100 * 2 * 4);
    expect(budget.pcm16Bytes).toBe(233 * 44100 * 2 * 2);
    expect(budget.estimatedWithSafetyBytes).toBeGreaterThan(budget.estimatedMinimumBytes);
  });

  it('classifies constrained devices conservatively without claiming an exact memory ceiling', () => {
    const budget = estimateOfflineRenderBudget(230, 3);
    expect(classifyOfflineRenderRisk(budget, 2).level).toBe('high');
    expect(classifyOfflineRenderRisk(budget, 4).level).toMatch(/medium|high/);
    expect(classifyOfflineRenderRisk(budget, null).level).toBe('unknown');
  });
});

describe('PCM16 WAV inspection', () => {
  it('round-trips a deterministic stereo buffer through RIFF inspection', () => {
    const left = new Float32Array([0, 0.5, -0.5, 1]);
    const right = new Float32Array([0, -0.25, 0.25, -1]);
    const bytes = encodePcm16Wave([left, right], 44100);
    const info = inspectPcm16Wave(bytes);

    expect(info.channels).toBe(2);
    expect(info.sampleRate).toBe(44100);
    expect(info.bitsPerSample).toBe(16);
    expect(info.frameCount).toBe(4);
    expect(info.dataBytes).toBe(16);
    expect(info.durationSeconds).toBeCloseTo(4 / 44100, 12);
  });

  it('rejects corrupted RIFF sizes', () => {
    const bytes = encodePcm16Wave([new Float32Array([0, 0])], 44100);
    const corrupted = bytes.slice();
    new DataView(corrupted.buffer).setUint32(4, 1, true);
    expect(() => inspectPcm16Wave(corrupted)).toThrow(/RIFF size/);
  });
});
