export type OfflineRenderBudget = {
  contentSeconds: number;
  tailSeconds: number;
  sampleRate: number;
  channels: number;
  floatBufferBytes: number;
  pcm16Bytes: number;
  estimatedMinimumBytes: number;
  estimatedWithSafetyBytes: number;
};

export type RenderRisk = {
  level: 'low' | 'medium' | 'high' | 'unknown';
  deviceMemoryGb: number | null;
  reason: string;
};

const SAFETY_OVERHEAD_BYTES = 32 * 1024 * 1024;

export function estimateOfflineRenderBudget(
  contentSeconds: number,
  tailSeconds: number,
  sampleRate = 44100,
  channels = 2,
): OfflineRenderBudget {
  if (!Number.isFinite(contentSeconds) || contentSeconds <= 0) {
    throw new RangeError('contentSeconds must be positive and finite.');
  }
  if (!Number.isFinite(tailSeconds) || tailSeconds < 0) {
    throw new RangeError('tailSeconds must be finite and non-negative.');
  }
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new RangeError('sampleRate must be positive and finite.');
  }
  if (!Number.isInteger(channels) || channels < 1) {
    throw new RangeError('channels must be a positive integer.');
  }

  const frames = Math.ceil((contentSeconds + tailSeconds) * sampleRate);
  const floatBufferBytes = frames * channels * 4;
  const pcm16Bytes = frames * channels * 2;
  const estimatedMinimumBytes = floatBufferBytes + pcm16Bytes;

  return {
    contentSeconds,
    tailSeconds,
    sampleRate,
    channels,
    floatBufferBytes,
    pcm16Bytes,
    estimatedMinimumBytes,
    estimatedWithSafetyBytes: estimatedMinimumBytes + SAFETY_OVERHEAD_BYTES,
  };
}

export function classifyOfflineRenderRisk(
  budget: OfflineRenderBudget,
  deviceMemoryGb: number | null,
): RenderRisk {
  if (deviceMemoryGb === null || !Number.isFinite(deviceMemoryGb) || deviceMemoryGb <= 0) {
    return {
      level: 'unknown',
      deviceMemoryGb: null,
      reason: 'Browser did not expose device-memory information.',
    };
  }

  const bytesPerGb = 1024 ** 3;
  const ratio = budget.estimatedWithSafetyBytes / (deviceMemoryGb * bytesPerGb);

  if (deviceMemoryGb <= 2 || ratio >= 0.1) {
    return {
      level: 'high',
      deviceMemoryGb,
      reason: 'Estimated render working set is significant for the reported device memory.',
    };
  }

  if (deviceMemoryGb <= 4 || ratio >= 0.05) {
    return {
      level: 'medium',
      deviceMemoryGb,
      reason: 'Full offline rendering may briefly use substantial browser memory.',
    };
  }

  return {
    level: 'low',
    deviceMemoryGb,
    reason: 'Reported device memory leaves comfortable room for the estimated PCM working set.',
  };
}

export function browserDeviceMemoryGb(): number | null {
  if (typeof navigator === 'undefined') return null;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof memory === 'number' && Number.isFinite(memory) ? memory : null;
}

export function formatBinaryBytes(bytes: number): string {
  const mib = bytes / (1024 ** 2);
  return `${mib.toFixed(mib >= 100 ? 0 : 1)} MiB`;
}
