import { useEffect, useMemo, useRef, useState } from 'react';
import { RawAudioEngine, findEventAtTime } from '../audio';
import { generateCanonicalScore } from '../composition';
import type { MathMusicEvent } from '../composition';

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = Math.floor(safe % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export default function BifurcateExperience() {
  const score = useMemo(() => generateCanonicalScore(), []);
  const engineRef = useRef<RawAudioEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [event, setEvent] = useState<MathMusicEvent>(() => score.events[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const engine = new RawAudioEngine(score);
    engineRef.current = engine;

    const tick = () => {
      const seconds = engine.currentTimeSeconds;
      setTime(seconds);
      setEvent(findEventAtTime(score, seconds));
      setPlaying(engine.transport.state === 'started');
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      engine.dispose();
      engineRef.current = null;
    };
  }, [score]);

  const begin = async () => {
    try {
      setError(null);
      const engine = engineRef.current;
      if (!engine) return;
      await engine.initialize();
      engine.schedule();
      setAudioReady(true);
      await engine.play();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const togglePlayback = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    try {
      if (engine.transport.state === 'started') engine.pause();
      else await engine.play();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const stop = () => engineRef.current?.stop();
  const progress = Math.min(1, time / score.durationSeconds);

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">MATHEMATICAL MUSIC / RAW SONIFICATION</p>
          <h1>BIFURCATE</h1>
          <p className="subtitle">Hearing the Logistic Map</p>
        </div>
        <code>x[n+1] = r · x[n] · (1 − x[n])</code>
      </header>

      <section className="stage" aria-label="Bifurcation visualization stage">
        {!audioReady ? (
          <button className="begin-button" type="button" onClick={begin}>
            <span>Begin raw sonification</span>
            <small>Audio starts only after this gesture.</small>
          </button>
        ) : (
          <div className="raw-readout" aria-live="polite">
            <span className="mode-chip">RAW</span>
            <strong>{event.raw.frequencyHz.toFixed(2)} Hz</strong>
            <span>x = {event.x.toFixed(6)}</span>
          </div>
        )}
      </section>

      <section className="transport-panel" aria-label="Playback controls">
        <div className="state-grid">
          <div><span>Chapter</span><strong>{event.macroChapter}</strong></div>
          <div><span>r</span><strong>{event.r.toFixed(4)}</strong></div>
          <div><span>λ</span><strong>{Number.isFinite(event.lambda) ? event.lambda.toFixed(3) : '−∞'}</strong></div>
          <div><span>Period</span><strong>{event.detectedPeriod ?? '—'}</strong></div>
          <div><span>x[n]</span><strong>{event.x.toFixed(6)}</strong></div>
          <div><span>Raw pitch</span><strong>{event.raw.frequencyHz.toFixed(1)} Hz</strong></div>
        </div>

        <div className="transport-row">
          <button type="button" onClick={togglePlayback} disabled={!audioReady}>{playing ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={stop} disabled={!audioReady}>Stop</button>
          <div className="timeline" aria-label={`Playback ${Math.round(progress * 100)} percent`}>
            <div className="timeline-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <output>{formatTime(time)} / {formatTime(score.durationSeconds)}</output>
        </div>
        {error ? <p className="error-message">{error}</p> : null}
      </section>
    </main>
  );
}
