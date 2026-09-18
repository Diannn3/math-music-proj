import { useMemo } from 'react';
import type { MathMusicEvent } from '../composition';

type Props = {
  events: readonly MathMusicEvent[];
  current: MathMusicEvent;
  length?: number;
};

export default function OrbitHistory({ events, current, length = 24 }: Props) {
  const history = useMemo(() => {
    const sameSegment = events.filter((event) => (
      event.segmentId === current.segmentId && event.globalIndex <= current.globalIndex
    ));
    return sameSegment.slice(-length);
  }, [events, current, length]);

  const points = history.map((event, index) => {
    const x = history.length <= 1 ? 50 : (index / (history.length - 1)) * 100;
    const y = (1 - event.x) * 100;
    return { event, x, y };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <aside className="orbit-history" aria-label="Recent logistic orbit states in time order">
      <header>
        <span>ORBIT HISTORY</span>
        <strong>time →</strong>
      </header>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Last ${history.length} states for r ${current.r.toFixed(4)}`}>
        <line x1="0" y1="50" x2="100" y2="50" className="orbit-history__midline" />
        {points.length > 1 ? <polyline points={polyline} className="orbit-history__line" /> : null}
        {points.map(({ event, x, y }) => (
          <circle
            key={event.id}
            cx={x}
            cy={y}
            r={event.id === current.id ? 2.4 : 1.25}
            className={event.id === current.id ? 'orbit-history__point orbit-history__point--active' : 'orbit-history__point'}
          />
        ))}
      </svg>
      <div className="orbit-history__scale" aria-hidden="true"><span>1</span><span>.5</span><span>0</span></div>
    </aside>
  );
}
