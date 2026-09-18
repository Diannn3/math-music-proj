import { describe, expect, it } from 'vitest';
import { SCORE_TIMELINE, TOTAL_BARS, TOTAL_SECONDS } from '../composition';

describe('chapter navigation timeline', () => {
  it('covers the canonical 92-bar, 230-second form without gaps', () => {
    expect(TOTAL_BARS).toBe(92);
    expect(TOTAL_SECONDS).toBe(230);
    expect(SCORE_TIMELINE[0].startSeconds).toBe(0);
    expect(SCORE_TIMELINE.at(-1)?.endSeconds).toBe(230);

    for (let index = 1; index < SCORE_TIMELINE.length; index += 1) {
      expect(SCORE_TIMELINE[index].startSeconds)
        .toBe(SCORE_TIMELINE[index - 1].endSeconds);
      expect(SCORE_TIMELINE[index].startBar)
        .toBe(SCORE_TIMELINE[index - 1].endBar + 1);
    }
  });

  it('places the period-3 island at the canonical 2:30 reveal', () => {
    const island = SCORE_TIMELINE.find((segment) => segment.id === 'island');
    expect(island).toBeDefined();
    expect(island?.startSeconds).toBe(150);
    expect(island?.startBar).toBe(61);
    expect(island?.r).toBe(3.83);
    expect(island?.expectedPeriod).toBe(3);
  });

  it('keeps the cascade as fixed-r subchapters rather than a continuous r sweep', () => {
    const cascade = SCORE_TIMELINE.filter((segment) => segment.macroChapter === 'IV. Cascade');
    expect(cascade.map((segment) => segment.r)).toEqual([3.55, 3.568, 3.5698]);
    expect(cascade.map((segment) => segment.bars)).toEqual([4, 4, 4]);
  });
});
