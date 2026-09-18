import { useEffect, useMemo, useRef, useState } from 'react';
import { MusicalAudioEngine, ParameterAuditioner, RawAudioEngine, codaStateForEvent, findEventAtTime } from '../audio';
import { generateCanonicalScore } from '../composition';
import type { MathMusicEvent, ParameterPortrait } from '../composition';
import { BifurcationField, OrbitHistory } from '../visual';
import MappingInspector from './MappingInspector';
import ChapterNavigator from './ChapterNavigator';
import MathLens from './MathLens';
import ExplorePanel from './ExplorePanel';
import ExportPanel from './ExportPanel';
import ChapterCue from './ChapterCue';

type AudioMode = 'raw' | 'musicalized';
type ActiveAudioEngine = RawAudioEngine | MusicalAudioEngine;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON';
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = Math.floor(safe % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function createAudioEngine(mode: AudioMode, score: ReturnType<typeof generateCanonicalScore>): ActiveAudioEngine {
  return mode === 'raw' ? new RawAudioEngine(score) : new MusicalAudioEngine(score);
}

export default function BifurcateExperience() {
  const score = useMemo(() => generateCanonicalScore(), []);
  const engineRef = useRef<ActiveAudioEngine | null>(null);
  const auditionerRef = useRef<ParameterAuditioner | null>(null);
  const clockRef = useRef<number | null>(null);
  const [mode, setMode] = useState<AudioMode>('raw');
  const [audioReady, setAudioReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [mathLensOpen, setMathLensOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [auditioning, setAuditioning] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [time, setTime] = useState(0);
  const [event, setEvent] = useState<MathMusicEvent>(() => score.events[0]);
  const [error, setError] = useState<string | null>(null);

  const bindEngine = (engine: ActiveAudioEngine) => {
    engine.setEventCallback((nextEvent) => setEvent(nextEvent));
    engineRef.current = engine;
  };

  useEffect(() => {
    const engine = createAudioEngine('raw', score);
    bindEngine(engine);
    auditionerRef.current = new ParameterAuditioner();

    return () => {
      if (clockRef.current !== null) window.clearInterval(clockRef.current);
      engineRef.current?.dispose();
      engineRef.current = null;
      auditionerRef.current?.dispose();
      auditionerRef.current = null;
    };
  }, [score]);

  useEffect(() => {
    if (!playing) return;

    const updateClock = () => {
      const activeEngine = engineRef.current;
      if (activeEngine) setTime(activeEngine.currentTimeSeconds);
    };

    updateClock();
    clockRef.current = window.setInterval(updateClock, 125);

    return () => {
      if (clockRef.current !== null) {
        window.clearInterval(clockRef.current);
        clockRef.current = null;
      }
    };
  }, [playing]);

  const begin = async () => {
    try {
      setError(null);
      const engine = engineRef.current;
      if (!engine) return;
      await engine.initialize();
      engine.schedule();
      setAudioReady(true);
      await engine.play();
      setPlaying(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const togglePlayback = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      if (engine.transport.state === 'started') {
        engine.pause();
        setPlaying(false);
        setTime(engine.currentTimeSeconds);
      } else {
        await engine.play();
        setPlaying(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const stop = () => {
    engineRef.current?.stop();
    setPlaying(false);
    setEvent(score.events[0]);
    setTime(0);
  };

  const seekToChapter = (startSeconds: number) => {
    const engine = engineRef.current;
    if (!engine) return;

    auditionerRef.current?.cancel();
    setAuditioning(false);
    engine.seek(startSeconds);
    setTime(startSeconds);
    setEvent(findEventAtTime(score, startSeconds));
  };

  const closeExplore = () => {
    auditionerRef.current?.cancel();
    setAuditioning(false);
    setExploreOpen(false);
    setEvent(findEventAtTime(score, engineRef.current?.currentTimeSeconds ?? time));
  };

  const auditionPortrait = async (portrait: ParameterPortrait) => {
    const auditioner = auditionerRef.current;
    if (!auditioner || auditioning) return;

    try {
      setError(null);
      engineRef.current?.pause();
      setPlaying(false);
      setTime(engineRef.current?.currentTimeSeconds ?? time);
      setAuditioning(true);
      await auditioner.audition(
        portrait.events,
        mode,
        (nextEvent) => setEvent(nextEvent),
        () => setAuditioning(false),
      );
    } catch (caught) {
      setAuditioning(false);
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const switchMode = async (nextMode: AudioMode) => {
    if (nextMode === mode || switchingMode) return;
    setSwitchingMode(true);
    setError(null);

    const previous = engineRef.current;
    const position = previous?.currentTimeSeconds ?? time;
    const wasPlaying = previous?.transport.state === 'started';

    try {
      previous?.pause();
      setPlaying(false);
      previous?.dispose();

      const next = createAudioEngine(nextMode, score);
      bindEngine(next);
      setMode(nextMode);
      if (!exploreOpen) setEvent(findEventAtTime(score, position));

      if (audioReady) {
        await next.initialize();
        next.schedule();
        next.seek(position);
        if (wasPlaying) {
          await next.play();
          setPlaying(true);
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSwitchingMode(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (isTypingTarget(keyEvent.target)) return;

      const key = keyEvent.key.toLowerCase();
      if (key === ' ') {
        keyEvent.preventDefault();
        if (audioReady && !switchingMode && !auditioning) void togglePlayback();
        return;
      }

      if (key === 'r' && !auditioning) {
        void switchMode('raw');
        return;
      }

      if (key === 'm' && !auditioning) {
        void switchMode('musicalized');
        return;
      }

      if (key === 'e' && audioReady && !switchingMode && !auditioning) {
        if (exploreOpen) closeExplore();
        else setExploreOpen(true);
        return;
      }

      if (key === 'l') {
        setMathLensOpen((open) => !open);
        return;
      }

      if (key === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioReady, auditioning, exploreOpen, mode, switchingMode]);

  const progress = Math.min(1, time / score.durationSeconds);
  const coda = mode === 'musicalized' ? codaStateForEvent(event) : null;
  const primaryReadout = mode === 'raw'
    ? `${event.raw.frequencyHz.toFixed(2)} Hz`
    : coda?.active
      ? `${event.musical.note} → ${event.raw.frequencyHz.toFixed(1)} Hz`
      : event.musical.note;
  const secondaryReadout = mode === 'raw'
    ? `x = ${event.x.toFixed(6)}`
    : coda?.active
      ? `RAW crossfade ${Math.round(coda.rawMix * 100)}% · artistic layers stripping`
      : `bucket ${event.musical.bucket + 1}/15 · Δ ${event.delta >= 0 ? '+' : ''}${event.delta.toFixed(4)}`;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">MATHEMATICAL MUSIC / A-B SONIFICATION</p>
          <h1>BIFURCATE</h1>
          <p className="subtitle">Hearing the Logistic Map</p>
        </div>
        <code>x[n+1] = r · x[n] · (1 − x[n])</code>
      </header>

      <section className={`stage stage--${event.regime}`} aria-label="Bifurcation visualization stage">
        <BifurcationField event={event} showBeginOverlay={!audioReady} onBegin={begin} />
        {audioReady ? <OrbitHistory events={score.events} current={event} /> : null}
        {audioReady && !exploreOpen ? <ChapterCue key={event.segmentId} event={event} /> : null}
        {audioReady ? (
          <div className="stage-readout" aria-live="polite">
            <span className={`mode-chip mode-chip--${mode}`}>
              {mode === 'raw' ? 'RAW' : coda?.active ? 'MUSICALIZED → RAW' : 'MUSICALIZED'}
            </span>
            <strong>{primaryReadout}</strong>
            <span>{secondaryReadout}</span>
          </div>
        ) : null}
      </section>

      <section className="transport-panel" aria-label="Playback controls">
        <div className="mode-switch" role="group" aria-label="Sonification mode">
          <button type="button" className={mode === 'raw' ? 'is-active' : ''} aria-pressed={mode === 'raw'} disabled={switchingMode || auditioning} onClick={() => void switchMode('raw')}>
            <strong>Raw</strong>
            <span>continuous frequency</span>
          </button>
          <button type="button" className={mode === 'musicalized' ? 'is-active' : ''} aria-pressed={mode === 'musicalized'} disabled={switchingMode || auditioning} onClick={() => void switchMode('musicalized')}>
            <strong>Musicalized</strong>
            <span>D-minor pentatonic + artistic layers</span>
          </button>
        </div>

        <div className="analysis-toolbar">
          <ChapterNavigator
            currentSegmentId={exploreOpen ? '' : event.segmentId}
            disabled={!audioReady || switchingMode || exploreOpen}
            onSelect={seekToChapter}
          />
          <div className="analysis-actions">
            <button
              type="button"
              className={exploreOpen ? 'analysis-toggle is-active' : 'analysis-toggle'}
              aria-pressed={exploreOpen}
              disabled={!audioReady || switchingMode || auditioning}
              onClick={() => exploreOpen ? closeExplore() : setExploreOpen(true)}
            >
              <strong>Explore</strong>
              <span>choose r + audition</span>
            </button>
            <button
              type="button"
              className={mathLensOpen ? 'analysis-toggle is-active' : 'analysis-toggle'}
              aria-pressed={mathLensOpen}
              onClick={() => setMathLensOpen((open) => !open)}
            >
              <strong>Math Lens</strong>
              <span>cobweb + Lyapunov</span>
            </button>
            <button
              type="button"
              className={exportOpen ? 'analysis-toggle is-active' : 'analysis-toggle'}
              aria-pressed={exportOpen}
              onClick={() => setExportOpen((open) => !open)}
            >
              <strong>Export</strong>
              <span>JSON + MIDI</span>
            </button>
          </div>
        </div>

        {exploreOpen ? (
          <ExplorePanel
            mode={mode}
            auditioning={auditioning}
            onPortraitChange={setEvent}
            onAudition={(portrait) => void auditionPortrait(portrait)}
            onClose={closeExplore}
          />
        ) : null}

        {mathLensOpen ? <MathLens event={event} onClose={() => setMathLensOpen(false)} /> : null}

        {exportOpen ? <ExportPanel score={score} onClose={() => setExportOpen(false)} /> : null}

        <MappingInspector event={event} mode={mode} />

        <div className="state-grid">
          <div><span>Chapter</span><strong>{event.macroChapter}</strong></div>
          <div><span>r</span><strong>{event.r.toFixed(4)}</strong></div>
          <div><span>λ</span><strong>{Number.isFinite(event.lambda) ? event.lambda.toFixed(3) : '−∞'}</strong></div>
          <div><span>Period</span><strong>{event.detectedPeriod ?? '—'}</strong></div>
          <div><span>x[n]</span><strong>{event.x.toFixed(6)}</strong></div>
          <div><span>{mode === 'raw' ? 'Raw pitch' : 'Musical note'}</span><strong>{mode === 'raw' ? `${event.raw.frequencyHz.toFixed(1)} Hz` : `${event.musical.note} · MIDI ${event.musical.midi}`}</strong></div>
        </div>

        <div className="transport-row">
          <button type="button" onClick={togglePlayback} disabled={!audioReady || switchingMode}>{playing ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={stop} disabled={!audioReady || switchingMode}>Stop</button>
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
