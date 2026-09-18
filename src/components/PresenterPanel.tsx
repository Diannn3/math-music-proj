import {
  PRESENTATION_CUES,
  nextPresentationCue,
  presentationCueAtTime,
} from '../presentation/cues';

type Props = {
  timeSeconds: number;
  onSeek: (seconds: number) => void;
  onClose: () => void;
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export default function PresenterPanel({ timeSeconds, onSeek, onClose }: Props) {
  const current = presentationCueAtTime(timeSeconds);
  const next = nextPresentationCue(timeSeconds);

  return (
    <aside className="presenter-panel" aria-label="Presenter cue sheet">
      <header>
        <div>
          <span>PRESENTER / PRIVATE CUE SHEET</span>
          <strong>{current.title}</strong>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </header>

      <div className="presenter-panel__current">
        <div className="presenter-panel__meta">
          <span>{formatTime(current.startSeconds)}</span>
          <span>r = {current.r.toFixed(4)}</span>
          <span>{current.segmentId}</span>
        </div>
        <p>{current.talkingPoint}</p>
        <dl>
          <div>
            <dt>Demo action</dt>
            <dd>{current.demoAction}</dd>
          </div>
          <div>
            <dt>If live demo fails</dt>
            <dd>{current.fallbackLine}</dd>
          </div>
        </dl>
        {next ? (
          <p className="presenter-panel__next">
            Next at {formatTime(next.startSeconds)} · {next.title}
          </p>
        ) : (
          <p className="presenter-panel__next">Final cue · close on the equation.</p>
        )}
      </div>

      <nav className="presenter-panel__cues" aria-label="Presentation cue points">
        {PRESENTATION_CUES.map((cue) => (
          <button
            type="button"
            key={cue.id}
            className={cue.id === current.id ? 'is-current' : ''}
            aria-current={cue.id === current.id ? 'step' : undefined}
            onClick={() => onSeek(cue.startSeconds)}
          >
            <span>{formatTime(cue.startSeconds)}</span>
            <strong>{cue.title}</strong>
          </button>
        ))}
      </nav>

      <footer>
        <span>D closes this panel</span>
        <span>These are presentation notes, not mathematical data.</span>
      </footer>
    </aside>
  );
}
