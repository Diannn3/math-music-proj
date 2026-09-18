import { describe, expect, it, vi } from 'vitest';
import {
  PRESENTATION_CHAPTER_SHORTCUTS,
  presentationChapterForKey,
  releaseScreenWakeLock,
  requestScreenWakeLock,
} from '../presentation';

describe('presentation chapter shortcuts', () => {
  it('derives exactly eight macro chapter starts from the canonical score', () => {
    expect(PRESENTATION_CHAPTER_SHORTCUTS).toHaveLength(8);
    expect(PRESENTATION_CHAPTER_SHORTCUTS.map((shortcut) => shortcut.key)).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8',
    ]);
    expect(PRESENTATION_CHAPTER_SHORTCUTS.map((shortcut) => shortcut.macroChapter)).toEqual([
      'I. Equilibrium',
      'II. Split',
      'III. Four',
      'IV. Cascade',
      'V. Break',
      'VI. Island',
      'VII. Return',
      'VIII. Limit',
    ]);
  });

  it('uses the first fixed-r portrait for the Cascade macro chapter', () => {
    expect(presentationChapterForKey('4')).toMatchObject({
      segmentId: 'cascade-8',
      startBar: 33,
      startSeconds: 80,
      r: 3.55,
    });
  });

  it('keeps the period-3 island on presentation key 6', () => {
    expect(presentationChapterForKey('6')).toMatchObject({
      segmentId: 'island',
      startBar: 61,
      startSeconds: 150,
      r: 3.83,
    });
  });

  it('returns null for non-presentation keys', () => {
    expect(presentationChapterForKey('0')).toBeNull();
    expect(presentationChapterForKey('9')).toBeNull();
    expect(presentationChapterForKey('x')).toBeNull();
  });
});

describe('presentation wake lock', () => {
  it('returns null when Wake Lock is unavailable', async () => {
    await expect(requestScreenWakeLock({})).resolves.toBeNull();
  });

  it('returns null when the browser denies the request', async () => {
    await expect(
      requestScreenWakeLock({
        wakeLock: {
          request: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
        },
      }),
    ).resolves.toBeNull();
  });

  it('requests the screen wake lock and releases it safely', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const sentinel = {
      release,
      addEventListener: vi.fn(),
    };
    const request = vi.fn().mockResolvedValue(sentinel);

    const acquired = await requestScreenWakeLock({
      wakeLock: { request },
    });

    expect(request).toHaveBeenCalledWith('screen');
    expect(acquired).toBe(sentinel);

    await releaseScreenWakeLock(acquired);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('swallows release errors because wake lock is presentation-only enhancement', async () => {
    await expect(
      releaseScreenWakeLock({
        release: vi.fn().mockRejectedValue(new Error('already released')),
      }),
    ).resolves.toBeUndefined();
  });
});
