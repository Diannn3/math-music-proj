import { describe, expect, it } from 'vitest';
import { getVisualFrame, visualFrameToNdcArea, VISUAL_FRAMES } from '../visual';

describe('cinematic visual score', () => {
  it('defines a frame for every canonical score segment', () => {
    expect(Object.keys(VISUAL_FRAMES)).toEqual([
      'equilibrium',
      'split',
      'four',
      'cascade-8',
      'cascade-16',
      'cascade-high',
      'break',
      'island',
      'return',
      'limit',
    ]);
  });

  it('keeps the active canonical r value inside every frame', () => {
    const expectedR: Record<string, number> = {
      equilibrium: 2.8,
      split: 3.2,
      four: 3.5,
      'cascade-8': 3.55,
      'cascade-16': 3.568,
      'cascade-high': 3.5698,
      break: 3.72,
      island: 3.83,
      return: 3.9,
      limit: 4,
    };

    for (const [segmentId, r] of Object.entries(expectedR)) {
      const frame = getVisualFrame(segmentId);
      expect(frame).not.toBeNull();
      expect(r).toBeGreaterThanOrEqual(frame!.rMin);
      expect(r).toBeLessThanOrEqual(frame!.rMax);
      expect(frame!.xMin).toBe(0);
      expect(frame!.xMax).toBe(1);
    }
  });

  it('maps chapter windows to valid normalized-device rectangles', () => {
    for (const frame of Object.values(VISUAL_FRAMES)) {
      const area = visualFrameToNdcArea(frame);
      expect(area.width).toBeGreaterThan(0);
      expect(area.height).toBeGreaterThan(0);
      expect(area.x).toBeGreaterThanOrEqual(-1);
      expect(area.x + area.width).toBeLessThanOrEqual(1.000001);
      expect(area.y).toBeGreaterThanOrEqual(-1);
      expect(area.y + area.height).toBeLessThanOrEqual(1.000001);
    }
  });
});
