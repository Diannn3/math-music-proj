type Props = {
  onClose: () => void;
};

export default function InterpretationGuide({ onClose }: Props) {
  return (
    <aside className="interpretation-guide" aria-labelledby="interpretation-guide-title">
      <header>
        <div>
          <span className="guide-kicker">HOW TO READ + LISTEN</span>
          <h2 id="interpretation-guide-title">The picture and the sound are the same mathematical events.</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close interpretation guide">Close</button>
      </header>

      <ol>
        <li>
          <strong>Horizontal position = r</strong>
          <span>The control parameter moves from ordered behavior toward increasingly complex behavior.</span>
        </li>
        <li>
          <strong>Vertical position = x[n]</strong>
          <span>Each lit point is the current logistic-map state produced by the equation.</span>
        </li>
        <li>
          <strong>RAW = direct continuous pitch</strong>
          <span>The current mathematical value controls frequency without forcing notes into a musical scale.</span>
        </li>
        <li>
          <strong>MUSICALIZED = explicit artistic mapping</strong>
          <span>The same events are quantized and arranged into a D-minor pentatonic musical layer.</span>
        </li>
      </ol>

      <div className="interpretation-guide__truth">
        <strong>Important:</strong>
        <span>The scale, instrumentation, and arrangement are compositional choices. They are not hidden properties of the logistic map.</span>
      </div>

      <dl className="interpretation-guide__keys" aria-label="Keyboard shortcuts">
        <div><dt>Space</dt><dd>play / pause</dd></div>
        <div><dt>R</dt><dd>raw</dd></div>
        <div><dt>M</dt><dd>musicalized</dd></div>
        <div><dt>P</dt><dd>performance / instrument</dd></div>
        <div><dt>L</dt><dd>math lens</dd></div>
        <div><dt>E</dt><dd>explore</dd></div>
        <div><dt>F</dt><dd>fullscreen</dd></div>
      </dl>
    </aside>
  );
}
