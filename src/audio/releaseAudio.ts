export const MASTER_LIMITER_DB = -1;

export const MASTER_COMPRESSOR = {
  threshold: -18,
  ratio: 3,
  attack: 0.01,
  release: 0.2,
} as const;

export const MASTER_REVERB = {
  decay: 2.8,
  preDelay: 0.015,
  wet: 0.18,
} as const;

export const RAW_SYNTH_VOLUME_DB = -8;
export const RAW_CODA_VOLUME_DB = -10;

export type AudioReleaseMetrics = {
  sampleRate: number;
  channels: number;
  durationSeconds: number;
  frameCount: number;
  peakLinear: number;
  peakDbfs: number;
  rmsLinear: number;
  rmsDbfs: number;
  crestFactorDb: number;
  dcOffset: number;
  nonFiniteSamples: number;
};

export type AudioReleaseAssessment = {
  status: 'pass' | 'warn' | 'fail';
  issues: string[];
};

function amplitudeToDbfs(amplitude: number): number {
  if (amplitude <= 0) return Number.NEGATIVE_INFINITY;
  return 20 * Math.log10(amplitude);
}

export function analyzeAudioChannels(
  channels: readonly Float32Array[],
  sampleRate: number,
): AudioReleaseMetrics {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new RangeError('sampleRate must be positive and finite.');
  }
  if (channels.length < 1) {
    throw new RangeError('At least one audio channel is required.');
  }

  const frameCount = channels[0].length;
  if (!channels.every((channel) => channel.length === frameCount)) {
    throw new RangeError('All audio channels must have the same frame count.');
  }

  let peak = 0;
  let squareSum = 0;
  let signedSum = 0;
  let finiteCount = 0;
  let nonFiniteSamples = 0;

  for (const channel of channels) {
    for (let index = 0; index < channel.length; index += 1) {
      const sample = channel[index];
      if (!Number.isFinite(sample)) {
        nonFiniteSamples += 1;
        continue;
      }

      const magnitude = Math.abs(sample);
      if (magnitude > peak) peak = magnitude;
      squareSum += sample * sample;
      signedSum += sample;
      finiteCount += 1;
    }
  }

  const rms = finiteCount > 0 ? Math.sqrt(squareSum / finiteCount) : 0;
  const peakDbfs = amplitudeToDbfs(peak);
  const rmsDbfs = amplitudeToDbfs(rms);

  return {
    sampleRate,
    channels: channels.length,
    durationSeconds: frameCount / sampleRate,
    frameCount,
    peakLinear: peak,
    peakDbfs,
    rmsLinear: rms,
    rmsDbfs,
    crestFactorDb: Number.isFinite(peakDbfs) && Number.isFinite(rmsDbfs)
      ? peakDbfs - rmsDbfs
      : Number.POSITIVE_INFINITY,
    dcOffset: finiteCount > 0 ? signedSum / finiteCount : 0,
    nonFiniteSamples,
  };
}

export function analyzeAudioBuffer(buffer: AudioBuffer): AudioReleaseMetrics {
  const channels = Array.from(
    { length: buffer.numberOfChannels },
    (_, index) => buffer.getChannelData(index),
  );
  return analyzeAudioChannels(channels, buffer.sampleRate);
}

export function assessAudioRelease(
  metrics: AudioReleaseMetrics,
  expectedDurationSeconds?: number,
): AudioReleaseAssessment {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (metrics.nonFiniteSamples > 0) {
    failures.push(`${metrics.nonFiniteSamples} non-finite sample(s) detected`);
  }
  if (metrics.peakLinear > 1) {
    failures.push(`sample peak exceeds full scale (${metrics.peakDbfs.toFixed(2)} dBFS)`);
  }
  if (metrics.rmsLinear === 0) {
    failures.push('render is silent');
  }
  if (metrics.channels !== 2) {
    warnings.push(`expected stereo render, received ${metrics.channels} channel(s)`);
  }
  if (metrics.sampleRate < 44100) {
    warnings.push(`sample rate ${metrics.sampleRate} Hz is below the 44.1 kHz release target`);
  }
  if (metrics.peakDbfs > -0.2) {
    warnings.push(`sample peak is very close to full scale (${metrics.peakDbfs.toFixed(2)} dBFS)`);
  }
  if (metrics.rmsDbfs < -55) {
    warnings.push(`RMS level is unusually low (${metrics.rmsDbfs.toFixed(1)} dBFS)`);
  }
  if (Math.abs(metrics.dcOffset) > 0.01) {
    warnings.push(`DC offset is elevated (${metrics.dcOffset.toFixed(5)})`);
  }
  if (
    typeof expectedDurationSeconds === 'number'
    && Math.abs(metrics.durationSeconds - expectedDurationSeconds) > 0.08
  ) {
    warnings.push(
      `duration ${metrics.durationSeconds.toFixed(3)} s differs from expected ${expectedDurationSeconds.toFixed(3)} s`,
    );
  }

  if (failures.length > 0) {
    return { status: 'fail', issues: [...failures, ...warnings] };
  }
  if (warnings.length > 0) {
    return { status: 'warn', issues: warnings };
  }
  return { status: 'pass', issues: [] };
}
