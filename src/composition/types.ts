import type { Articulation } from './mapping';
import type { OrbitRegime } from '../math';

export type MathMusicEvent = {
  id: string;
  segmentId: string;
  macroChapter: string;
  chapterLabel: string;
  globalIndex: number;
  segmentIndex: number;
  orbitIndex: number;
  r: number;
  x: number;
  previousX: number;
  delta: number;
  lambda: number;
  detectedPeriod: number | null;
  regime: OrbitRegime;
  bar: number;
  beat: number;
  subdivision: number;
  timeSeconds: number;
  durationSeconds: number;
  raw: { frequencyHz: number; velocity: number };
  musical: {
    note: string;
    midi: number;
    bucket: number;
    velocity: number;
    pan: number;
    articulation: Articulation;
    bassTrigger: boolean;
    haloTrigger: boolean;
    transientTrigger: boolean;
  };
  source: { x0: number; burnIn: number; mappingVersion: string };
};

export type CanonicalScore = {
  project: 'BIFURCATE';
  version: string;
  mappingVersion: string;
  equation: string;
  x0: number;
  burnIn: number;
  tempoBpm: number;
  meter: '4/4';
  bars: number;
  durationSeconds: number;
  events: MathMusicEvent[];
};
