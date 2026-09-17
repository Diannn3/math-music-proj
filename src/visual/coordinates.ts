export const BIFURCATION_R_MIN = 2.7;
export const BIFURCATION_R_MAX = 4;

export function normalizeR(r: number): number {
  const normalized = (r - BIFURCATION_R_MIN) / (BIFURCATION_R_MAX - BIFURCATION_R_MIN);
  return Math.min(1, Math.max(0, normalized));
}

export function rToNdc(r: number): number {
  return normalizeR(r) * 2 - 1;
}

export function xToNdc(x: number): number {
  const bounded = Math.min(1, Math.max(0, x));
  return bounded * 2 - 1;
}

export function rToPercent(r: number): number {
  return normalizeR(r) * 100;
}

export function xToPercentFromTop(x: number): number {
  const bounded = Math.min(1, Math.max(0, x));
  return (1 - bounded) * 100;
}
