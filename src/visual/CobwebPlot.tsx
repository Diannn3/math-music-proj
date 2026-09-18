import { useMemo } from 'react';
import { buildCobwebPath, buildLogisticCurve } from './mathLensData';

type Props = {
  r: number;
  x0: number;
  steps?: number;
};

const toX = (x: number) => x * 100;
const toY = (y: number) => (1 - y) * 100;

function pathFromPoints(points: { x: number; y: number }[]): string {
  return points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${toX(point.x).toFixed(3)} ${toY(point.y).toFixed(3)}`
  ).join(' ');
}

export default function CobwebPlot({ r, x0, steps = 18 }: Props) {
  const curve = useMemo(() => buildLogisticCurve(r), [r]);
  const cobweb = useMemo(() => buildCobwebPath(r, x0, steps), [r, x0, steps]);

  return (
    <figure className="math-lens-card">
      <figcaption>
        <span>COBWEB</span>
        <strong>r = {r.toFixed(4)}</strong>
      </figcaption>
      <svg viewBox="0 0 100 100" role="img" aria-label={`Cobweb plot for logistic map at r ${r.toFixed(4)}`}>
        <path className="cobweb-grid" d="M 0 100 L 100 0" />
        <path className="cobweb-curve" d={pathFromPoints(curve)} />
        <path className="cobweb-orbit" d={pathFromPoints(cobweb)} />
      </svg>
      <p>Vertical: iterate the equation. Horizontal: return to y = x.</p>
    </figure>
  );
}
