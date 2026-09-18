import { useMemo, useState } from 'react';
import type { CanonicalScore } from '../composition';
import {
  analyzeAudioBuffer,
  assessAudioRelease,
  type AudioReleaseAssessment,
  type AudioReleaseMetrics,
} from '../audio';
import {
  FULL_RENDER_TAIL_SECONDS,
  audioBufferToWaveBytes,
  browserDeviceMemoryGb,
  classifyOfflineRenderRisk,
  downloadBytes,
  downloadText,
  estimateOfflineRenderBudget,
  formatBinaryBytes,
  inspectPcm16Wave,
  renderScoreExcerptOffline,
  renderScoreOffline,
  scoreToMidiBytes,
  scoreToProvenanceJson,
} from '../export';

type Props = {
  score: CanonicalScore;
  onClose: () => void;
};

type AudioQc = {
  mode: 'raw' | 'musicalized';
  metrics: AudioReleaseMetrics;
  assessment: AudioReleaseAssessment;
};

type DiagnosticResult = {
  mode: 'raw' | 'musicalized';
  peakDbfs: number;
  rmsDbfs: number;
  durationSeconds: number;
  waveBytes: number;
};

export default function ExportPanel({ score, onClose }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [rendering, setRendering] = useState<'raw' | 'musicalized' | null>(null);
  const [audioQc, setAudioQc] = useState<AudioQc | null>(null);
  const [allowHighRiskRender, setAllowHighRiskRender] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[] | null>(null);

  const memory = useMemo(() => {
    const deviceMemoryGb = browserDeviceMemoryGb();
    const rawBudget = estimateOfflineRenderBudget(
      score.durationSeconds,
      FULL_RENDER_TAIL_SECONDS.raw,
    );
    const musicalizedBudget = estimateOfflineRenderBudget(
      score.durationSeconds,
      FULL_RENDER_TAIL_SECONDS.musicalized,
    );

    return {
      deviceMemoryGb,
      rawBudget,
      musicalizedBudget,
      risk: classifyOfflineRenderRisk(musicalizedBudget, deviceMemoryGb),
    };
  }, [score.durationSeconds]);

  const fullRenderBlocked = memory.risk.level === 'high' && !allowHighRiskRender;

  const exportJson = () => {
    downloadText(
      scoreToProvenanceJson(score),
      'BIFURCATE-provenance.json',
      'application/json',
    );
    setStatus('Provenance JSON exported.');
  };

  const exportManifest = async () => {
    try {
      const response = await fetch('/bifurcate-release-manifest.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Release manifest unavailable: HTTP ${response.status}.`);
      }
      const manifest = await response.text();
      downloadText(
        manifest,
        'BIFURCATE-release-manifest.json',
        'application/json',
      );
      setStatus('Release manifest exported.');
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const exportMidi = () => {
    downloadBytes(
      scoreToMidiBytes(score),
      'BIFURCATE-musicalized.mid',
      'audio/midi',
    );
    setStatus('Multi-track MIDI exported.');
  };

  const exportWav = async (mode: 'raw' | 'musicalized') => {
    if (rendering || fullRenderBlocked) return;

    try {
      setRendering(mode);
      setStatus(`Rendering ${mode} audio offline…`);
      const buffer = await renderScoreOffline(score, mode);
      const metrics = analyzeAudioBuffer(buffer);
      const expectedDuration = score.durationSeconds + FULL_RENDER_TAIL_SECONDS[mode];
      const assessment = assessAudioRelease(metrics, expectedDuration);

      setAudioQc({ mode, metrics, assessment });

      if (assessment.status === 'fail') {
        setStatus(`${mode} WAV failed technical QC and was not downloaded.`);
        return;
      }

      const bytes = audioBufferToWaveBytes(buffer);
      const wave = inspectPcm16Wave(bytes);

      if (wave.channels !== 2 || wave.sampleRate !== 44100) {
        throw new Error(
          `Encoded WAV format mismatch: ${wave.channels} channel(s) at ${wave.sampleRate} Hz.`,
        );
      }

      downloadBytes(bytes, `BIFURCATE-${mode}.wav`, 'audio/wav');
      setStatus(
        `${mode === 'raw' ? 'Raw' : 'Musicalized'} WAV exported · `
        + `peak ${metrics.peakDbfs.toFixed(2)} dBFS · RMS ${metrics.rmsDbfs.toFixed(1)} dBFS · `
        + `${wave.durationSeconds.toFixed(2)} s RIFF validated.`,
      );
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setRendering(null);
    }
  };

  const runShortDiagnostic = async () => {
    if (diagnosticRunning || rendering) return;

    setDiagnosticRunning(true);
    setDiagnostics(null);
    setStatus('Running short browser offline-audio diagnostic…');

    try {
      const results: DiagnosticResult[] = [];

      for (const mode of ['raw', 'musicalized'] as const) {
        const tail = mode === 'musicalized' ? 1 : 0.5;
        const buffer = await renderScoreExcerptOffline(score, mode, 2);
        const metrics = analyzeAudioBuffer(buffer);
        const assessment = assessAudioRelease(metrics, 2 + tail);
        if (assessment.status === 'fail') {
          throw new Error(
            `${mode} diagnostic failed audio QC: ${assessment.issues.join('; ')}`,
          );
        }

        const bytes = audioBufferToWaveBytes(buffer);
        const wave = inspectPcm16Wave(bytes);
        if (wave.channels !== 2 || wave.sampleRate !== 44100 || wave.frameCount <= 0) {
          throw new Error(`${mode} diagnostic produced an invalid release WAV structure.`);
        }

        results.push({
          mode,
          peakDbfs: metrics.peakDbfs,
          rmsDbfs: metrics.rmsDbfs,
          durationSeconds: wave.durationSeconds,
          waveBytes: bytes.byteLength,
        });
      }

      setDiagnostics(results);
      setStatus('Short RAW + MUSICALIZED offline-render diagnostic passed.');
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setDiagnosticRunning(false);
    }
  };

  return (
    <section className="export-panel" aria-label="Export BIFURCATE">
      <header>
        <div>
          <span>EXPORT</span>
          <strong>Reproducible artifacts</strong>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </header>

      <div className="export-options">
        <button type="button" onClick={exportJson}>
          <strong>Provenance JSON</strong>
          <span>736 events · raw math · mappings · chapters</span>
        </button>
        <button type="button" onClick={() => void exportManifest()}>
          <strong>Release manifest</strong>
          <span>SHA-256 hashes · canonical score metadata · release assets</span>
        </button>
        <button type="button" onClick={exportMidi}>
          <strong>Musicalized MIDI</strong>
          <span>lead · bass · halo · drone · transient approximation</span>
        </button>
        <button
          type="button"
          disabled={rendering !== null || fullRenderBlocked}
          onClick={() => void exportWav('raw')}
        >
          <strong>{rendering === 'raw' ? 'Rendering RAW…' : 'RAW WAV'}</strong>
          <span>offline continuous-frequency sonification · PCM16 + QC</span>
        </button>
        <button
          type="button"
          disabled={rendering !== null || fullRenderBlocked}
          onClick={() => void exportWav('musicalized')}
        >
          <strong>{rendering === 'musicalized' ? 'Rendering music…' : 'Musicalized WAV'}</strong>
          <span>offline Tone.js synthesis + reverb tail · PCM16 + QC</span>
        </button>
      </div>

      <div className={`render-budget render-budget--${memory.risk.level}`}>
        <div>
          <span>FULL WAV MEMORY ADVISORY</span>
          <strong>{memory.risk.level.toUpperCase()}</strong>
        </div>
        <p>
          PCM buffers alone are estimated at about{' '}
          {formatBinaryBytes(memory.musicalizedBudget.estimatedWithSafetyBytes)} including a conservative
          fixed safety allowance; synthesis/runtime overhead is not exactly predictable.
          {memory.deviceMemoryGb ? ` Browser reports ~${memory.deviceMemoryGb} GB device memory.` : ' Browser does not expose device memory.'}
        </p>
        {memory.risk.level === 'high' ? (
          <label>
            <input
              type="checkbox"
              checked={allowHighRiskRender}
              onChange={(event) => setAllowHighRiskRender(event.currentTarget.checked)}
            />
            <span>Allow full WAV rendering on this constrained device</span>
          </label>
        ) : null}
      </div>

      <details className="audio-diagnostic">
        <summary>Technical audio diagnostic</summary>
        <p>
          Renders only the opening 2 seconds in RAW and MUSICALIZED modes through the real browser
          offline-audio graph, then checks sample QC and the encoded PCM16 RIFF structure.
        </p>
        <button
          type="button"
          disabled={diagnosticRunning || rendering !== null}
          onClick={() => void runShortDiagnostic()}
        >
          {diagnosticRunning ? 'Running diagnostic…' : 'Run short WAV diagnostic'}
        </button>
        {diagnostics ? (
          <div className="audio-diagnostic__results" aria-label="Short WAV diagnostic results">
            {diagnostics.map((result) => (
              <div key={result.mode}>
                <strong>{result.mode.toUpperCase()} PASS</strong>
                <span>{result.durationSeconds.toFixed(2)} s</span>
                <span>{result.peakDbfs.toFixed(2)} dBFS peak</span>
                <span>{formatBinaryBytes(result.waveBytes)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </details>

      <p>
        The release manifest hashes canonical source inputs and static assets for submission verification.
        MIDI stores musical event/control data, not the rendered Tone.js sound.
        WAV is rendered offline from the same deterministic score. Technical QC checks samples,
        not perceived loudness or artistic quality. JSON remains the canonical reconstruction record.
      </p>

      {audioQc ? (
        <div className={`audio-qc audio-qc--${audioQc.assessment.status}`}>
          <header>
            <span>{audioQc.mode.toUpperCase()} AUDIO QC</span>
            <strong>{audioQc.assessment.status.toUpperCase()}</strong>
          </header>
          <dl>
            <div><dt>Peak</dt><dd>{audioQc.metrics.peakDbfs.toFixed(2)} dBFS</dd></div>
            <div><dt>RMS</dt><dd>{audioQc.metrics.rmsDbfs.toFixed(1)} dBFS</dd></div>
            <div><dt>Crest</dt><dd>{audioQc.metrics.crestFactorDb.toFixed(1)} dB</dd></div>
            <div><dt>DC</dt><dd>{audioQc.metrics.dcOffset.toFixed(5)}</dd></div>
            <div><dt>Rate</dt><dd>{audioQc.metrics.sampleRate} Hz</dd></div>
            <div><dt>Duration</dt><dd>{audioQc.metrics.durationSeconds.toFixed(2)} s</dd></div>
          </dl>
          {audioQc.assessment.issues.length > 0 ? (
            <ul>
              {audioQc.assessment.issues.map((issue) => <li key={issue}>{issue}</li>)}
            </ul>
          ) : (
            <p>No technical release warnings. Subjective listening review is still required.</p>
          )}
        </div>
      ) : null}

      {status ? <output aria-live="polite">{status}</output> : null}
    </section>
  );
}
