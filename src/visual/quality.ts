export type VisualQuality = 'high' | 'medium' | 'low';

export type VisualQualityProfile = {
  quality: VisualQuality;
  rSamples: number;
  retain: number;
  burnIn: number;
  pointSize: number;
  opacity: number;
};

export const VISUAL_QUALITY_PROFILES: Record<VisualQuality, VisualQualityProfile> = {
  high: {
    quality: 'high',
    rSamples: 4096,
    retain: 96,
    burnIn: 1024,
    pointSize: 1,
    opacity: 0.28,
  },
  medium: {
    quality: 'medium',
    rSamples: 2048,
    retain: 64,
    burnIn: 1024,
    pointSize: 1.2,
    opacity: 0.33,
  },
  low: {
    quality: 'low',
    rSamples: 1024,
    retain: 48,
    burnIn: 768,
    pointSize: 1.35,
    opacity: 0.38,
  },
};

export type VisualCapability = {
  width: number;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  reducedMotion: boolean;
};

export function chooseVisualQuality({
  width,
  devicePixelRatio,
  hardwareConcurrency,
  reducedMotion,
}: VisualCapability): VisualQualityProfile {
  if (reducedMotion || width < 640 || hardwareConcurrency <= 4) {
    return VISUAL_QUALITY_PROFILES.low;
  }

  if (width < 1100 || devicePixelRatio > 2 || hardwareConcurrency <= 8) {
    return VISUAL_QUALITY_PROFILES.medium;
  }

  return VISUAL_QUALITY_PROFILES.high;
}

export function detectVisualQuality(): VisualQualityProfile {
  if (typeof window === 'undefined') return VISUAL_QUALITY_PROFILES.medium;

  return chooseVisualQuality({
    width: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}
