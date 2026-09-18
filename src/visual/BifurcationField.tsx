import { useEffect, useMemo, useRef, useState } from 'react';
import type { MathMusicEvent } from '../composition';
import {
  BIFURCATION_R_MAX,
  BIFURCATION_R_MIN,
  rToPercent,
  xToPercentFromTop,
} from './coordinates';
import { detectVisualQuality } from './quality';
import { getVisualFrame, visualFrameToNdcArea } from './visualScore';

type Props = {
  event: MathMusicEvent;
  showBeginOverlay?: boolean;
  onBegin?: () => void;
  cinematic?: boolean;
};

type PlotStatus =
  | { state: 'loading'; progress: number }
  | { state: 'ready'; pointCount: number }
  | { state: 'error'; message: string };

type ScatterplotInstance = ReturnType<(typeof import('regl-scatterplot'))['default']>;

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export default function BifurcationField({
  event,
  showBeginOverlay = false,
  onBegin,
  cinematic = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const scatterplotRef = useRef<ScatterplotInstance | null>(null);
  const [status, setStatus] = useState<PlotStatus>({ state: 'loading', progress: 0 });
  const [profile] = useState(detectVisualQuality);

  const frame = cinematic ? getVisualFrame(event.segmentId) : null;

  const active = useMemo(() => {
    if (!frame) {
      return {
        left: `${rToPercent(event.r)}%`,
        top: `${xToPercentFromTop(event.x)}%`,
      };
    }

    const left = ((event.r - frame.rMin) / (frame.rMax - frame.rMin)) * 100;
    const normalizedX = (event.x - frame.xMin) / (frame.xMax - frame.xMin);
    const top = (1 - normalizedX) * 100;

    return {
      left: `${clampPercent(left)}%`,
      top: `${clampPercent(top)}%`,
    };
  }, [event.r, event.x, frame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let destroyed = false;
    let scatterplot: ScatterplotInstance | null = null;
    const worker = new Worker(new URL('../workers/bifurcation.worker.ts', import.meta.url), { type: 'module' });

    const resize = () => {
      if (!scatterplot || destroyed) return;
      const rect = host.getBoundingClientRect();
      scatterplot.set({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    void (async () => {
      try {
        const module = await import('regl-scatterplot');
        if (destroyed) return;

        const rect = host.getBoundingClientRect();
        scatterplot = module.default({
          canvas,
          width: Math.max(1, rect.width),
          height: Math.max(1, rect.height),
          backgroundColor: '#0f1115',
          pointColor: '#87909f',
          pointSize: profile.pointSize,
          opacity: profile.opacity,
          cameraIsFixed: true,
          showReticle: false,
          deselectOnDblClick: false,
        });
        scatterplotRef.current = scatterplot;

        worker.postMessage({
          type: 'build',
          rSamples: profile.rSamples,
          burnIn: profile.burnIn,
          retain: profile.retain,
          x0: 0.2,
        });
      } catch (error) {
        if (!destroyed) {
          setStatus({
            state: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    })();

    worker.onmessage = (message: MessageEvent) => {
      if (destroyed) return;

      if (message.data.type === 'progress') {
        setStatus({ state: 'loading', progress: message.data.progress });
        return;
      }

      if (message.data.type === 'error') {
        setStatus({ state: 'error', message: String(message.data.message) });
        return;
      }

      if (message.data.type === 'complete' && scatterplot) {
        const { x, y, pointCount } = message.data as {
          x: Float32Array;
          y: Float32Array;
          pointCount: number;
        };

        void Promise.resolve(scatterplot.draw({ x, y })).then(() => {
          if (!destroyed) setStatus({ state: 'ready', pointCount });
        });
      }
    };

    return () => {
      destroyed = true;
      observer.disconnect();
      worker.terminate();
      scatterplotRef.current = null;
      scatterplot?.destroy();
    };
  }, [profile]);

  useEffect(() => {
    if (status.state !== 'ready') return;
    const scatterplot = scatterplotRef.current;
    if (!scatterplot) return;

    if (!cinematic || !frame) {
      void scatterplot.zoomToOrigin({
        transition: true,
        transitionDuration: 700,
      });
      return;
    }

    void scatterplot.zoomToArea(
      visualFrameToNdcArea(frame),
      {
        transition: true,
        transitionDuration: frame.transitionMs,
      },
    );
  }, [cinematic, event.segmentId, frame, status.state]);

  const axisLeft = frame?.rMin ?? BIFURCATION_R_MIN;
  const axisRight = frame?.rMax ?? BIFURCATION_R_MAX;

  return (
    <div
      ref={hostRef}
      className={cinematic ? 'bifurcation-field bifurcation-field--cinematic' : 'bifurcation-field'}
    >
      <canvas ref={canvasRef} className="bifurcation-canvas" aria-hidden="true" />
      <p className="sr-only" aria-live="polite">
        Logistic-map state: r {event.r.toFixed(4)}, x {event.x.toFixed(6)},
        Lyapunov {Number.isFinite(event.lambda) ? event.lambda.toFixed(4) : 'negative infinity'},
        regime {event.regime}, detected period {event.detectedPeriod ?? 'none'}.
      </p>

      <div className="plot-axis-label plot-axis-label--y-top">1.0</div>
      <div className="plot-axis-label plot-axis-label--y-mid">0.5</div>
      <div className="plot-axis-label plot-axis-label--y-bottom">0.0</div>
      <div className="plot-axis-label plot-axis-label--x-left">r {axisLeft.toFixed(axisLeft < 3 ? 2 : 3)}</div>
      <div className="plot-axis-label plot-axis-label--x-right">{axisRight.toFixed(axisRight === 4 ? 1 : 3)}</div>

      <div className="active-r-line" style={{ left: active.left }} aria-hidden="true" />
      <div
        key={event.id}
        className={`active-event-point active-event-point--${event.regime}`}
        style={active}
        aria-hidden="true"
      />

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
