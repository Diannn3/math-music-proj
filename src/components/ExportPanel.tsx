import { useState } from 'react';
import type { CanonicalScore } from '../composition';
import {
  downloadBytes,
  downloadText,
  scoreToMidiBytes,
  scoreToProvenanceJson,
} from '../export';

type Props = {
  score: CanonicalScore;
  onClose: () => void;
};

export default function ExportPanel({ score, onClose }: Props) {
  const [status, setStatus] = useState<string | null>(null);

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
      </div>

      <p>
        MIDI stores musical event/control data, not the rendered Tone.js sound.
        JSON is the canonical reconstruction record.
      </p>
      {status ? <output aria-live="polite">{status}</output> : null}
    </section>
  );
}
