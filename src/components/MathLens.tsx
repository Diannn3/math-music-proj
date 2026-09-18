import type { MathMusicEvent } from '../composition';
import { CobwebPlot, LyapunovStrip } from '../visual';

type Props = {
  event: MathMusicEvent;
  onClose: () => void;
};

export default function MathLens({ event, onClose }: Props) {
  return (
    <section className="math-lens" aria-label="Mathematical analysis lens">
      <header className="math-lens__header">
        <div>
          <span>MATH LENS</span>
          <strong>{event.macroChapter}</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close Math Lens">Close</button>
      </header>
      <div className="math-lens__grid">
        <CobwebPlot r={event.r} x0={event.previousX} />
        <LyapunovStrip r={event.r} />
      </div>
      <footer>
        <span>Current λ: {Number.isFinite(event.lambda) ? event.lambda.toFixed(4) : '−∞'}</span>
        <span>Detected period: {event.detectedPeriod ?? 'none ≤ tested bound'}</span>
      </footer>
    </section>
  );
}
