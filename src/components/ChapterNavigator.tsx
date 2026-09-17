import { SCORE_TIMELINE, TOTAL_BARS } from '../composition';

type Props = {
  currentSegmentId: string;
  onSelect: (startSeconds: number) => void;
  disabled?: boolean;
};

function regimeLabel(regime: (typeof SCORE_TIMELINE)[number]['expectedRegime']): string {
  if (regime === 'periodic') return 'periodic';
  if (regime === 'chaotic') return 'chaotic';
  return 'high period';
}

export default function ChapterNavigator({ currentSegmentId, onSelect, disabled = false }: Props) {
  return (
    <nav className="chapter-nav" aria-label="Composition chapters">
      <header><span>FORM</span><strong>92 bars · fixed-r portraits</strong></header>
      <div className="chapter-nav__track">
        {SCORE_TIMELINE.map((segment) => (
          <button
            type="button"
            key={segment.id}
            disabled={disabled}
            className={segment.id === currentSegmentId ? 'is-active' : ''}
            style={{ flexGrow: segment.bars, flexBasis: `${(segment.bars / TOTAL_BARS) * 100}%` }}
            onClick={() => onSelect(segment.startSeconds)}
            title={`${segment.macroChapter} · r=${segment.r} · ${regimeLabel(segment.expectedRegime)}`}
            aria-label={`Jump to ${segment.macroChapter}, r ${segment.r}, ${regimeLabel(segment.expectedRegime)}`}
          >
            <span>{segment.macroChapter.split('.')[0]}</span>
            <strong>{segment.r.toFixed(segment.r === 4 ? 1 : 3)}</strong>
          </button>
        ))}
      </div>
      <div className="chapter-nav__legend" aria-hidden="true">
        <span>order</span><span>period doubling</span><span>chaos</span><span>period-3 island</span><span>chaos</span>
      </div>
    </nav>
  );
}
