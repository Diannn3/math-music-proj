export type KeyboardShortcutEvent = Pick<KeyboardEvent, 'key' | 'code'>;

export function isHelpShortcut(event: KeyboardShortcutEvent): boolean {
  const key = event.key.toLowerCase();
  return key === '?' || key === '/' || event.code === 'Slash';
}
