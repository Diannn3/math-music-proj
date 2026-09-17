import type { MathMusicEvent } from '../composition';

type AudioMode = 'raw' | 'musicalized';

type Props = {
  event: MathMusicEvent;
  mode: AudioMode;
};

function signed(value: number, digits = 6): string {
  const formatted = Math.abs(value).toFixed(digits);
  return `${value >= 0 ? '+' : '−'}${formatted}`;
}

function stateLabel(event: MathMusicEvent): string {
  if (event.regime === 'periodic') return event.detectedPeriod ? `periodic · p≈${event.detectedPeriod}` : 'periodic';
  if (event.regime === 'chaotic') return 'chaotic';
  return 'transition / unresolved';
}

export default function MappingInspector({ event, mode }: Props) {
  const layerFlags = [
    event.musical.bassTrigger ? 'bass' : null,
    event.musical.haloTrigger ? 'halo' : null,
    event.globalIndex % 8 === 0 ? 'D/A drone' : null,
    event.musical.transientTrigger ? 'jump transient' : null,
  ].filter(Boolean).join(' · ') || 'lead only';

  return (
    <section className="mapping-inspector" aria-label="Current mathematical-to-audio mapping">
      <header className="mapping-inspector__header">
        <div>
          <span className="mapping-kicker">TRACE</span>
          <strong>How this event becomes sound</strong>
        </div>
        <span className={`mode-chip mode-chip--${mode}`}>{mode === 'raw' ? 'RAW' : 'MUSICALIZED'}</span>
      </header>

      <div className="mapping-columns">
        <article>
          <span className="mapping-category">01 · Mathematical source</span>
          <dl>
            <div><dt>event</dt><dd>n = {event.globalIndex}</dd></div>
            <div><dt>parameter</dt><dd>r = {event.r.toFixed(4)}</dd></div>
            <div><dt>state</dt><dd>x[n] = {event.x.toFixed(6)}</dd></div>
            <div><dt>local change</dt><dd>Δx = {signed(event.delta)}</dd></div>
            <div><dt>Lyapunov</dt><dd>λ ≈ {Number.isFinite(event.lambda) ? event.lambda.toFixed(4) : '−∞'}</dd></div>
            <div><dt>regime</dt><dd>{stateLabel(event)}</dd></div>
          </dl>
        </article>

        <article>
          <span className="mapping-category">02 · Sonification transform</span>
          <dl>
            <div><dt>raw formula</dt><dd>110 × 2^(4x)</dd></div>
            <div><dt>raw result</dt><dd>{event.raw.frequencyHz.toFixed(2)} Hz</dd></div>
            <div><dt>quantizer</dt><dd>⌊15x⌋ → bucket {event.musical.bucket + 1}</dd></div>
            <div><dt>scale</dt><dd>D minor pentatonic</dd></div>
            <div><dt>mapped note</dt><dd>{event.musical.note} · MIDI {event.musical.midi}</dd></div>
            <div><dt>selected output</dt><dd>{mode === 'raw' ? 'continuous frequency' : 'quantized note'}</dd></div>
          </dl>
        </article>

        <article>
          <span className="mapping-category">03 · Artistic layer</span>
          <dl>
            <div><dt>velocity</dt><dd>{event.musical.velocity.toFixed(3)} from |Δx|</dd></div>
            <div><dt>pan</dt><dd>{event.musical.pan > 0 ? 'right' : event.musical.pan < 0 ? 'left' : 'center'} · {event.musical.pan.toFixed(2)}</dd></div>
            <div><dt>articulation</dt><dd>{event.musical.articulation}</dd></div>
            <div><dt>arrangement</dt><dd>{layerFlags}</dd></div>
            <div><dt>mapping version</dt><dd>{event.source.mappingVersion}</dd></div>
            <div><dt>mode note</dt><dd>{mode === 'raw' ? 'artistic layers muted' : 'artistic layers active'}</dd></div>
          </dl>
        </article>
      </div>
    </section>
  );
}
