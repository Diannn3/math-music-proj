import { useEffect, useRef, useState } from 'react';
import type { MathMusicEvent, ParameterPortrait } from '../composition';

type AudioMode = 'raw' | 'musicalized';

type Props = {
  mode: AudioMode;
  auditioning: boolean;
  onPortraitChange: (event: MathMusicEvent) => void;
  onAudition: (portrait: ParameterPortrait) => void;
  onClose: () => void;
};

type WorkerResponse =
  | { type: 'portrait'; requestId: number; portrait: ParameterPortrait }
  | { type: 'error'; requestId: number; message: string };

function regimeText(event: MathMusicEvent | null): string {
  if (!event) return 'computing…';
  if (event.regime === 'periodic') return event.detectedPeriod ? `period ${event.detectedPeriod}` : 'periodic';
  if (event.regime === 'chaotic') return 'chaotic';
  return 'transition / unresolved';
}

export default function ExplorePanel({
  mode,
  auditioning,
  onPortraitChange,
  onAudition,
  onClose,
}: Props) {
  const [r, setR] = useState(3.83);
  const [x0, setX0] = useState(0.2);
  const [portrait, setPortrait] = useState<ParameterPortrait | null>(null);
  const [computing, setComputing] = useState(true);
  const [computeError, setComputeError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/explore.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (message: MessageEvent<WorkerResponse>) => {
      const response = message.data;
      if (response.requestId !== requestIdRef.current) return;

      if (response.type === 'error') {
        setComputing(false);
        setComputeError(response.message);
        return;
      }

      setPortrait(response.portrait);
      setComputing(false);
      setComputeError(null);
      const first = response.portrait.events[0];
      if (first) onPortraitChange(first);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [onPortraitChange]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setComputing(true);
    setComputeError(null);

    const timer = window.setTimeout(() => {
      workerRef.current?.postMessage({
        type: 'portrait',
        requestId,
        r,
        x0,
        bars: 4,
      });
    }, 70);

    return () => window.clearTimeout(timer);
  }, [r, x0]);

  const event = portrait?.events[0] ?? null;
  const canAudition = Boolean(portrait) && !computing && !auditioning;

  return (
    <section
      className="explore-panel"
      aria-label="Explore logistic-map parameter"
      aria-busy={computing}
    >
      <header>
        <div>
          <span>EXPLORE MODE</span>
          <strong>
            Fixed-r portrait · {portrait ? `${portrait.durationSeconds.toFixed(1)} s` : 'computing…'}
          </strong>
        </div>
        <button type="button" onClick={onClose}>Return to piece</button>
      </header>

      <div className="explore-controls">
        <label>
          <span><strong>r</strong><output>{r.toFixed(4)}</output></span>
          <input
            type="range"
            min="2.8"
            max="4"
            step="0.0001"
            value={r}
            onChange={(change) => setR(Number(change.currentTarget.value))}
          />
        </label>

        <label>
          <span><strong>x₀</strong><output>{x0.toFixed(2)}</output></span>
          <input
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            value={x0}
            onChange={(change) => setX0(Number(change.currentTarget.value))}
          />
        </label>
      </div>

      <div className="explore-metrics">
        <div><span>Regime</span><strong>{regimeText(event)}</strong></div>
        <div><span>λ</span><strong>{event ? (Number.isFinite(event.lambda) ? event.lambda.toFixed(4) : '−∞') : '…'}</strong></div>
        <div><span>Period</span><strong>{event ? (event.detectedPeriod ?? '—') : '…'}</strong></div>
        <div><span>Mode</span><strong>{mode}</strong></div>
      </div>

      <div className="explore-presets" role="group" aria-label="Interesting r presets">
        {[
          ['period 2', 3.2],
          ['period 4', 3.5],
          ['cascade', 3.568],
          ['chaos', 3.72],
          ['period 3', 3.83],
          ['chaos', 3.9],
          ['limit', 4],
        ].map(([label, value]) => (
          <button type="button" key={String(value)} onClick={() => setR(Number(value))}>
            <span>{String(label)}</span><strong>{Number(value).toFixed(3)}</strong>
          </button>
        ))}
      </div>

      {computeError ? <p className="error-message">Explore calculation failed: {computeError}</p> : null}

      <button
        type="button"
        className="explore-audition"
        disabled={!canAudition}
        onClick={() => portrait && onAudition(portrait)}
      >
        {auditioning
          ? 'Auditioning…'
          : computing
            ? 'Computing portrait…'
            : `Audition ${mode === 'raw' ? 'raw sonification' : 'musicalized portrait'}`}
      </button>
    </section>
  );
}
