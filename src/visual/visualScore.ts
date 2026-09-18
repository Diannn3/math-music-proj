import { rToNdc, xToNdc } from './coordinates';

export type VisualFrame = {
  segmentId: string;
  rMin: number;
  rMax: number;
  xMin: number;
  xMax: number;
  transitionMs: number;
};

const DEFAULT_X_MIN = 0;
const DEFAULT_X_MAX = 1;

export const VISUAL_FRAMES: Record<string, VisualFrame> = {
  equilibrium: {
    segmentId: 'equilibrium',
    rMin: 2.70,
    rMax: 3.02,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 900,
  },
  split: {
    segmentId: 'split',
    rMin: 2.95,
    rMax: 3.34,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 900,
  },
  four: {
    segmentId: 'four',
    rMin: 3.28,
    rMax: 3.58,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 900,
  },
  'cascade-8': {
    segmentId: 'cascade-8',
    rMin: 3.46,
    rMax: 3.575,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 800,
  },
  'cascade-16': {
    segmentId: 'cascade-16',
    rMin: 3.525,
    rMax: 3.575,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 750,
  },
  'cascade-high': {
    segmentId: 'cascade-high',
    rMin: 3.555,
    rMax: 3.5755,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 750,
  },
  break: {
    segmentId: 'break',
    rMin: 3.60,
    rMax: 3.79,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 1100,
  },
  island: {
    segmentId: 'island',
    rMin: 3.79,
    rMax: 3.87,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 1100,
  },
  return: {
    segmentId: 'return',
    rMin: 3.82,
    rMax: 3.965,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 1100,
  },
  limit: {
    segmentId: 'limit',
    rMin: 3.90,
    rMax: 4.0,
    xMin: DEFAULT_X_MIN,
    xMax: DEFAULT_X_MAX,
    transitionMs: 1200,
  },
};

export function getVisualFrame(segmentId: string): VisualFrame | null {
  return VISUAL_FRAMES[segmentId] ?? null;
}

export function visualFrameToNdcArea(frame: VisualFrame) {
  const x0 = rToNdc(frame.rMin);
  const x1 = rToNdc(frame.rMax);
  const y0 = xToNdc(frame.xMin);
  const y1 = xToNdc(frame.xMax);

  return {
    x: Math.min(x0, x1),
    y: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0),
  };
}
