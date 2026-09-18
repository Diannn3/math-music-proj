# BIFURCATE — Hearing the Logistic Map

**BIFURCATE** is a deterministic audiovisual composition and interactive mathematical instrument built from the logistic map:

```text
x[n+1] = r * x[n] * (1 - x[n])
```

The project follows one equation from stable equilibrium through period doubling, chaos, a period-3 window where order returns, and finally the `r = 4` regime. Every primary sound event and every highlighted visual state comes from the same canonical event stream.

The project deliberately distinguishes:

- **RAW sonification** — continuous-frequency representation of the orbit.
- **MUSICALIZED composition** — an explicitly artistic interpretation of the same events.

It never claims that the chosen scale, harmony, timbre, bass, drone, or effects are inherent properties of the logistic map.

## Current status

The cumulative implementation is fully verified through:

`feature/20-project-documentation`

Its parent `feature/19-browser-smoke-tests` introduced the production-browser suite; feature 20 inherits that suite and also passes it.

The CI pipeline verifies:

- Vitest unit/invariant suites
- Astro + TypeScript diagnostics
- production build
- Chromium/Playwright runtime smoke tests
- WebGL stage boot
- Web Audio unlock and RAW/MUSICALIZED switching
- period-3 chapter seeking
- Explore Mode
- JSON and MIDI downloads

No feature branches have been merged into `main` automatically.

---

## Canonical composition

| Section | Bars | Time | `r` | Reference behavior |
| --- | ---: | ---: | ---: | --- |
| I. Equilibrium | 8 | 0:00–0:20 | 2.8 | period 1 |
| II. Split | 12 | 0:20–0:50 | 3.2 | period 2 |
| III. Four | 12 | 0:50–1:20 | 3.5 | period 4 |
| IV. Cascade A | 4 | 1:20–1:30 | 3.55 | approx. period 8 |
| IV. Cascade B | 4 | 1:30–1:40 | 3.568 | approx. period 16 |
| IV. Cascade C | 4 | 1:40–1:50 | 3.5698 | high finite period near accumulation |
| V. Break | 16 | 1:50–2:30 | 3.72 | chaotic reference orbit |
| VI. Island | 12 | 2:30–3:00 | 3.83 | period-3 window |
| VII. Return | 12 | 3:00–3:30 | 3.9 | chaotic reference orbit |
| VIII. Limit | 8 | 3:30–3:50 | 4.0 | chaotic; coda returns to RAW |

Global form:

- **96 BPM**
- **4/4**
- **92 bars**
- **230 seconds**
- **736 primary eighth-note events**
- canonical initial state `x0 = 0.2`
- canonical burn-in: **4096 iterations**

The `r` value is fixed inside each orbit portrait. The cascade uses three fixed-`r` subchapters rather than pretending that a continuously changing parameter is the same dynamical system as a standard fixed-parameter logistic orbit.

---

## RAW sonification

Each `x` in `[0, 1]` maps to continuous frequency:

```text
f = 110 * 2^(4x)
```

giving:

- `x = 0` → 110 Hz
- `x = 0.25` → 220 Hz
- `x = 0.5` → 440 Hz
- `x = 0.75` → 880 Hz
- `x = 1` → 1760 Hz

RAW mode uses:

- fixed eighth-note timing
- nearly constant velocity
- centered stereo
- simple sine synthesis
- no scale quantization
- no bass
- no halo
- no drone
- no artistic transient layer

This makes short periodic orbits directly audible as repeated pitch cycles.

---

## MUSICALIZED composition

The same orbit values are quantized to a 15-note **D minor pentatonic** palette spanning D3–C6.

Artistic layers:

- FM orbit lead
- derived bass
- sparse harmonic halo
- D/A tonal anchor
- pink-noise accents on large orbit jumps
- velocity derived from `|Δx|`
- gentle pan derived from the sign of `Δx`
- regime-aware synthesis/reverb

The final four bars of `r = 4` deliberately deconstruct the musicalized arrangement:

1. transient layer removed
2. halo removed
3. bass removed
4. drone removed

At the same time, the FM lead crossfades to the RAW continuous-frequency sine representation.

---

## Visualization

The bifurcation diagram is the stage, not decorative background.

Primary visual semantics:

- horizontal coordinate → `r`
- vertical coordinate → `x`
- vertical playhead → active parameter
- bright event point → current sounded state
- orbit-history inset → temporal visitation order
- regime color treatment → period/Lyapunov classification, **not raw `r`**

Adaptive point tiers:

- **High:** 393,216 points
- **Medium:** 131,072 points
- **Low:** 49,152 points

Changing quality changes rendering density only. It does not alter the score or canonical mathematical state.

---

## Experience modes

### Performance

The default view is a cinematic presentation surface: the plot camera deterministically frames the active chapter's `r` region while the mathematical data remain unchanged. Only a minimal playback/mode HUD stays on-screen.

### Instrument

The scientific workbench exposes chapter navigation, RAW/MUSICALIZED A/B controls, Math Lens, Explore Mode, mapping provenance, state readouts, and exports.

### RAW ↔ MUSICALIZED comparison

Switch representations without regenerating the score or losing transport position.

### Math Lens

Shows:

- logistic cobweb plot
- finite numerical Lyapunov curve
- current `λ`
- detected period

### Explore Mode

Choose `r` and `x0`, generate a short fixed-`r` portrait, inspect its classification, and audition it independently of the canonical performance Transport.

### Export

Exports:

- canonical provenance JSON
- multi-track MIDI
- RAW offline WAV
- MUSICALIZED offline WAV

See `docs/ARCHITECTURE.md` and `docs/MATHEMATICAL_INTEGRITY.md` for exact semantics.

---

## Technology

- Astro 7
- React 19
- TypeScript 6
- Tone.js 15
- regl-scatterplot / regl
- Web Workers
- @tonejs/midi
- Vitest
- Playwright

---

## Local development

Requirements:

- Node.js 22+

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

Unit tests:

```bash
npm test
```

Astro diagnostics:

```bash
npm run check
```

Production build:

```bash
npm run build
```

Browser smoke suite:

```bash
npm run test:e2e
```

The E2E command builds production output first and then runs Playwright against `astro preview`.

---

## Keyboard controls

When focus is not inside an interactive control:

| Key | Action |
| --- | --- |
| Space | Play / pause |
| R | RAW mode |
| M | MUSICALIZED mode |
| E | Explore Mode |
| L | Math Lens |
| P | Performance / Instrument view |
| F | Fullscreen |

Reduced-motion preference is honored.

---

## Repository layout

```text
src/
├─ math/          logistic dynamics, Lyapunov, period detection
├─ composition/   chapters, mappings, canonical score, explore portraits
├─ audio/         raw/musical engines, arrangement, coda, auditioner
├─ visual/        bifurcation field, orbit history, Math Lens
├─ workers/       bifurcation point generation
├─ export/        provenance, MIDI, WAV, offline audio
├─ components/    React experience UI
├─ styles/        visual system / accessibility
└─ tests/         deterministic unit and invariant tests

e2e/              Playwright production-browser smoke tests
docs/             architecture, integrity, presentation, branch history
.github/workflows CI verification
```

---

## Mathematical integrity

Core rules:

1. `r` is **not** used as a direct chaos meter.
2. Deterministic chaos is not called randomness.
3. Period detection is a finite numerical classifier, not a mathematical proof.
4. Lyapunov values are finite numerical estimates except where a known theoretical reference is explicitly stated.
5. Quantization and arrangement are labeled artistic.
6. RAW and MUSICALIZED share the same mathematical event identity.
7. The visualization uses the same event data as audio.
8. MIDI is not audio.
9. Continuous RAW frequencies cannot be represented exactly by ordinary semitone MIDI; the coda MIDI track is explicitly labeled an approximation.
10. Provenance JSON is the canonical reconstruction artifact.

Read: **[Mathematical Integrity](docs/MATHEMATICAL_INTEGRITY.md)**

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Mathematical Integrity](docs/MATHEMATICAL_INTEGRITY.md)
- [Presentation Guide](docs/PRESENTATION.md)
- [Audio Review](docs/AUDIO_REVIEW.md)
- [Device QA](docs/DEVICE_QA.md)
- [Performance and Visual Regression](docs/PERFORMANCE.md)
- [Feature Branch History](docs/BRANCH_HISTORY.md)

---

## Development principle

> The goal is not to decorate music with mathematics.  
> The goal is to make the mathematics perceptible, then show exactly where composition transforms it into art.
