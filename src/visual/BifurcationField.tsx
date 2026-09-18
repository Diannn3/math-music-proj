import { useEffect, useMemo, useRef, useState } from 'react';
import type { MathMusicEvent } from '../composition';
import { rToPercent, xToPercentFromTop } from './coordinates';
import { detectVisualQuality } from './quality';

type Props = { event: MathMusicEvent; showBeginOverlay?: boolean; onBegin?: () => void };
type PlotStatus = { state: 'loading'; progress: number } | { state: 'ready'; pointCount: number } | { state: 'error'; message: string };

export default function BifurcationField({ event, showBeginOverlay = false, onBegin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<PlotStatus>({ state: 'loading', progress: 0 });
  const [profile] = useState(detectVisualQuality);
  const active = useMemo(() => ({ left: `${rToPercent(event.r)}%`, top: `${xToPercentFromTop(event.x)}%` }), [event.r, event.x]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;
    let destroyed = false;
    let scatterplot: { draw: (points: unknown) => Promise<unknown> | unknown; set: (options: Record<string, unknown>) => void; destroy: () => void } | null = null;
    const worker = new Worker(new URL('../workers/bifurcation.worker.ts', import.meta.url), { type: 'module' });
    const resize = () => {
      if (!scatterplot || destroyed) return;
      const rect = host.getBoundingClientRect();
      scatterplot.set({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    void (async () => {
      try {
        const module = await import('regl-scatterplot');
        if (destroyed) return;
        const rect = host.getBoundingClientRect();
        scatterplot = module.default({ canvas, width: Math.max(1, rect.width), height: Math.max(1, rect.height), backgroundColor: '#0f1115', pointColor: '#87909f', pointSize: profile.pointSize, opacity: profile.opacity, cameraIsFixed: true, showReticle: false, deselectOnDblClick: false });
        worker.postMessage({ type: 'build', rSamples: profile.rSamples, burnIn: profile.burnIn, retain: profile.retain, x0: 0.2 });
      } catch (error) {
        if (!destroyed) setStatus({ state: 'error', message: error instanceof Error ? error.message : String(error) });
      }
    })();

    worker.onmessage = (message: MessageEvent) => {
      if (destroyed) return;
      if (message.data.type === 'progress') {
        setStatus({ state: 'loading', progress: message.data.progress });
        return;
      }
      if (message.data.type === 'complete' && scatterplot) {
        const { x, y, pointCount } = message.data as { x: Float32Array; y: Float32Array; pointCount: number };
        void Promise.resolve(scatterplot.draw({ x, y })).then(() => {
          if (!destroyed) setStatus({ state: 'ready', pointCount });
        });
      }
    };

    return () => {
      destroyed = true;
      observer.disconnect();
      worker.terminate();
      scatterplot?.destroy();
    };
  }, [profile]);

  return (
    <div ref={hostRef} className="bifurcation-field">
      <canvas ref={canvasRef} className="bifurcation-canvas" aria-hidden="true" />
      <p className="sr-only" aria-live="polite">
        Logistic-map state: r {event.r.toFixed(4)}, x {event.x.toFixed(6)},
        Lyapunov {Number.isFinite(event.lambda) ? event.lambda.toFixed(4) : 'negative infinity'},
        regime {event.regime}, detected period {event.detectedPeriod ?? 'none'}.
      </p>
      <div className="plot-axis-label plot-axis-label--y-top">1.0</div>
      <div className="plot-axis-label plot-axis-label--y-mid">0.5</div>
      <div className="plot-axis-label plot-axis-label--y-bottom">0.0</div>
      <div className="plot-axis-label plot-axis-label--x-left">r 2.7</div>
      <div className="plot-axis-label plot-axis-label--x-right">4.0</div>
      <div className="active-r-line" style={{ left: active.left }} aria-hidden="true" />
      <div key={event.id} className={`active-event-point active-event-point--${event.regime}`} style={active} aria-hidden="true" />
      <div className="plot-status" aria-live="polite">
        {status.state === 'loading' ? `Building orbit field ${Math.round(status.progress * 100)}%` : null}
        {status.state === 'ready' ? `${profile.quality} · ${status.pointCount.toLocaleString()} orbit points` : null}
        {status.state === 'error' ? `Plot error: ${status.message}` : null}
      </div>
      {showBeginOverlay ? (
        <button className="begin-button begin-button--overlay" type="button" onClick={onBegin}>
          <span>Begin raw sonification</span>
          <small>Every sound will light its mathematical state.</small>
        </button>
      ) : null}
    </div>
  );
}
