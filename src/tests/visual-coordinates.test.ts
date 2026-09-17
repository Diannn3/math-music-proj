import { describe, expect, it } from 'vitest';
import { rToNdc, rToPercent, xToNdc, xToPercentFromTop } from '../visual/coordinates';

describe('bifurcation coordinate transforms', () => {
  it('maps the configured r extent to NDC and percentage bounds', () => {
    expect(rToNdc(2.7)).toBeCloseTo(-1, 12);
    expect(rToNdc(4)).toBeCloseTo(1, 12);
    expect(rToPercent(2.7)).toBeCloseTo(0, 12);
    expect(rToPercent(4)).toBeCloseTo(100, 12);
  });

  it('maps logistic x values to plot coordinates', () => {
    expect(xToNdc(0)).toBe(-1);
    expect(xToNdc(0.5)).toBe(0);
    expect(xToNdc(1)).toBe(1);
    expect(xToPercentFromTop(1)).toBe(0);
    expect(xToPercentFromTop(0)).toBe(100);
  });
});
