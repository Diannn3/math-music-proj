import { SCORE_TIMELINE } from '../composition';

export type PresentationChapterShortcut = {
  key: string;
  macroChapter: string;
  segmentId: string;
  label: string;
  startSeconds: number;
  startBar: number;
  r: number;
};

const firstSegmentByMacroChapter = new Map<string, (typeof SCORE_TIMELINE)[number]>();

for (const segment of SCORE_TIMELINE) {
  if (!firstSegmentByMacroChapter.has(segment.macroChapter)) {
    firstSegmentByMacroChapter.set(segment.macroChapter, segment);
  }
}

export const PRESENTATION_CHAPTER_SHORTCUTS: readonly PresentationChapterShortcut[] =
  [...firstSegmentByMacroChapter.values()].map((segment, index) => ({
    key: String(index + 1),
    macroChapter: segment.macroChapter,
    segmentId: segment.id,
    label: segment.label,
    startSeconds: segment.startSeconds,
    startBar: segment.startBar,
    r: segment.r,
  }));

export function presentationChapterForKey(
  key: string,
): PresentationChapterShortcut | null {
  return PRESENTATION_CHAPTER_SHORTCUTS.find((shortcut) => shortcut.key === key) ?? null;
}
