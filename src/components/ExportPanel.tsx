import { useState } from 'react';
import type { CanonicalScore } from '../composition';
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

export default function ExportPanel({ score, onClose }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [rendering, setRendering] = useState<'raw' | 'musicalized' | null>(null);

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
      const bytes = audioBufferToWaveBytes(buffer);
      downloadBytes(bytes, `BIFURCATE-${mode}.wav`, 'audio/wav');
      setStatus(`${mode === 'raw' ? 'Raw' : 'Musicalized'} WAV exported.`);
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
          <span>offline continuous-frequency sonification · PCM16</span>
        </button>
        <button type="button" disabled={rendering !== null} onClick={() => void exportWav('musicalized')}>
          <strong>{rendering === 'musicalized' ? 'Rendering music…' : 'Musicalized WAV'}</strong>
          <span>offline Tone.js synthesis + reverb tail · PCM16</span>
        </button>
      </div>

      <p>
        MIDI stores musical event/control data, not the rendered Tone.js sound.
        WAV is rendered offline from the same deterministic score. JSON remains the canonical reconstruction record.
      </p>
      {status ? <output aria-live="polite">{status}</output> : null}
    </section>
  );
}
