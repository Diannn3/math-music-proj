import { describe, expect, it } from 'vitest';
import { isHelpShortcut } from '../components/keyboard';

describe('help keyboard shortcut', () => {
  it.each([
    [{ key: '/', code: 'Slash' }, true],
    [{ key: '?', code: 'Slash' }, true],
    [{ key: 'Dead', code: 'Slash' }, true],
    [{ key: 'r', code: 'KeyR' }, false],
    [{ key: ' ', code: 'Space' }, false],
  ])('classifies %o as %s', (event, expected) => {
    expect(isHelpShortcut(event)).toBe(expected);
  });
});
