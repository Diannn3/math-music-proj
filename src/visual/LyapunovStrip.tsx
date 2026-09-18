import { useMemo } from 'react';
import { sampleLyapunovCurve } from './mathLensData';

type Props = { r: number };

const R_MIN = 2.8;
const R_MAX = 4;
const LAMBDA_MIN = -2;
const LAMBDA_MAX = 0.8;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const xForR = (r: number) => ((r - R_MIN) / (R_MAX - R_MIN)) * 100;
const yForLambda = (lambda: number) => {
  const clamped = clamp(lambda, LAMBDA_MIN, LAMBDA_MAX);
  return 100 - ((clamped - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN)) * 100;
};

export default function LyapunovStrip({ r }: Props) {
  const points = useMemo(() => sampleLyapunovCurve(R_MIN, R_MAX, 240), []);
  const path = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${xForR(point.r).toFixed(3)} ${yForLambda(point.lambda).toFixed(3)}`
  ).join(' ');
  const zeroY = yForLambda(0);

  return (
    <figure className="math-lens-card math-lens-card--lyapunov">
      <figcaption>
        <span>LYAPUNOV</span>
        <strong>λ(r)</strong>
      </figcaption>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Finite numerical Lyapunov estimate across r from 2.8 to 4">
        <line className="lyapunov-zero" x1="0" x2="100" y1={zeroY} y2={zeroY} />
        <path className="lyapunov-curve" d={path} />
        <line className="lyapunov-marker" x1={xForR(r)} x2={xForR(r)} y1="0" y2="100" />
      </svg>
      <div className="lyapunov-legend"><span>λ &lt; 0 periodic</span><span>λ &gt; 0 chaotic</span></div>
    </figure>
  );
}
