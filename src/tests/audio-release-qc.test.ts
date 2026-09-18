import { describe, expect, it } from 'vitest';
import {
  analyzeAudioChannels,
  assessAudioRelease,
  MASTER_LIMITER_DB,
  MASTER_COMPRESSOR,
  MASTER_REVERB,
} from '../audio';

describe('audio release QC', () => {
  it('measures peak, RMS, crest factor, duration, and DC deterministically', () => {
    const left = new Float32Array([0.5, -0.5, 0.5, -0.5]);
    const right = new Float32Array([-0.5, 0.5, -0.5, 0.5]);
    const metrics = analyzeAudioChannels([left, right], 4);

    expect(metrics.channels).toBe(2);
    expect(metrics.durationSeconds).toBe(1);
    expect(metrics.peakLinear).toBeCloseTo(0.5, 8);
    expect(metrics.peakDbfs).toBeCloseTo(-6.0206, 3);
    expect(metrics.rmsLinear).toBeCloseTo(0.5, 8);
    expect(metrics.rmsDbfs).toBeCloseTo(-6.0206, 3);
    expect(metrics.crestFactorDb).toBeCloseTo(0, 6);
    expect(metrics.dcOffset).toBeCloseTo(0, 8);
    expect(metrics.nonFiniteSamples).toBe(0);
  });

  it('passes a technically safe stereo render while keeping aesthetic judgment separate', () => {
    const signal = new Float32Array([0.2, -0.2, 0.1, -0.1]);
    const metrics = analyzeAudioChannels([signal, signal], 44100);
    const assessment = assessAudioRelease(metrics, metrics.durationSeconds);
    expect(assessment).toEqual({ status: 'pass', issues: [] });
  });

  it('fails clipping and non-finite sample corruption', () => {
    const signal = new Float32Array([1.1, Number.POSITIVE_INFINITY, 0, 0]);
    const metrics = analyzeAudioChannels([signal, signal], 44100);
    const assessment = assessAudioRelease(metrics);

    expect(assessment.status).toBe('fail');
    expect(assessment.issues.some((issue) => issue.includes('non-finite'))).toBe(true);
    expect(assessment.issues.some((issue) => issue.includes('full scale'))).toBe(true);
  });

  it('warns about release-format problems without falsely calling them clipping', () => {
    const signal = new Float32Array([0.4, 0.4, 0.4, 0.4]);
    const metrics = analyzeAudioChannels([signal], 22050);
    const assessment = assessAudioRelease(metrics);

    expect(assessment.status).toBe('warn');
    expect(assessment.issues.some((issue) => issue.includes('stereo'))).toBe(true);
    expect(assessment.issues.some((issue) => issue.includes('sample rate'))).toBe(true);
    expect(assessment.issues.some((issue) => issue.includes('DC offset'))).toBe(true);
  });

  it('keeps master-bus configuration explicit and centralized', () => {
    expect(MASTER_LIMITER_DB).toBe(-1);
    expect(MASTER_COMPRESSOR).toMatchObject({ threshold: -18, ratio: 3 });
    expect(MASTER_REVERB).toMatchObject({ decay: 2.8, wet: 0.18 });
  });
});
