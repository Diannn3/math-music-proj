import { useState } from 'react';
import type { CanonicalScore } from '../composition';
import { analyzeAudioBuffer, assessAudioRelease, type AudioReleaseAssessment, type AudioReleaseMetrics } from '../audio';
import {
  downloadBytes,
  downloadText,
  scoreToMidiBytes,
  scoreToProvenanceJson,
  renderScoreOffline,
  audioBufferToWaveBytes,
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

export default function ExportPanel({ score, onClose }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [rendering, setRendering] = useState<'raw' | 'musicalized' | null>(null);
  const [audioQc, setAudioQc] = useState<AudioQc | null>(null);

  const exportJson = () => {
    downloadText(
      scoreToProvenanceJson(score),
      'BIFURCATE-provenance.json',
      'application/json',
    );
    setStatus('Provenance JSON exported.');
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
    if (rendering) return;

    try {
      setRendering(mode);
      setStatus(`Rendering ${mode} audio offline…`);
      const buffer = await renderScoreOffline(score, mode);
      const metrics = analyzeAudioBuffer(buffer);
      const expectedDuration = score.durationSeconds + (mode === 'musicalized' ? 3 : 0.5);
      const assessment = assessAudioRelease(metrics, expectedDuration);

      setAudioQc({ mode, metrics, assessment });

      if (assessment.status === 'fail') {
        setStatus(`${mode} WAV failed technical QC and was not downloaded.`);
        return;
      }

      const bytes = audioBufferToWaveBytes(buffer);
      downloadBytes(bytes, `BIFURCATE-${mode}.wav`, 'audio/wav');
      setStatus(
        `${mode === 'raw' ? 'Raw' : 'Musicalized'} WAV exported · `
        + `peak ${metrics.peakDbfs.toFixed(2)} dBFS · RMS ${metrics.rmsDbfs.toFixed(1)} dBFS.`,
      );
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setRendering(null);
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
        <button type="button" onClick={exportMidi}>
          <strong>Musicalized MIDI</strong>
          <span>lead · bass · halo · drone · transient approximation</span>
        </button>
        <button type="button" disabled={rendering !== null} onClick={() => void exportWav('raw')}>
          <strong>{rendering === 'raw' ? 'Rendering RAW…' : 'RAW WAV'}</strong>
          <span>offline continuous-frequency sonification · PCM16 + QC</span>
        </button>
        <button type="button" disabled={rendering !== null} onClick={() => void exportWav('musicalized')}>
          <strong>{rendering === 'musicalized' ? 'Rendering music…' : 'Musicalized WAV'}</strong>
          <span>offline Tone.js synthesis + reverb tail · PCM16 + QC</span>
        </button>
      </div>

      <p>
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
