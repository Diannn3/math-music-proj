# Architecture

## 1. System contract

BIFURCATE has one governing rule:

```text
mathematical source
      ↓
canonical event stream
     ↙              ↘
audio               visuals
```

Audio and visualization do **not** independently regenerate approximate trajectories.

The canonical performance is serialized conceptually as:

```text
Logistic parameters
→ burn-in
→ orbit
→ classification
→ explicit transforms
→ MathMusicEvent[]
→ playback / visualization / export
```

This is what keeps sound, plotted point, labels, MIDI, and provenance traceable to the same state.

---

## 2. Mathematical layer

Location:

```text
src/math/
```

Responsibilities:

- logistic iteration
- orbit generation
- finite Lyapunov estimate
- finite period detection
- regime classification

The mathematical layer is intentionally free of Tone.js, React, WebGL, and musical theory.

---

## 3. Composition layer

Location:

```text
src/composition/
```

Responsibilities:

- canonical chapter definitions
- score timing constants
- RAW frequency transform
- D-minor-pentatonic mapping
- velocity/pan/articulation transforms
- canonical score generation
- Explore Mode portrait generation
- provenance fields stored per event

The score is generated before playback.

The audio callback never invents the logistic values.

### Event grain

Primary grid:

- 96 BPM
- 4/4
- two primary events per beat
- eight events per bar
- 736 events total

Each `MathMusicEvent` carries enough information to explain itself:

```text
event identity
chapter / segment
r
x_n
x[n-1]
delta
lambda
detected period
regime
bar / beat / time
RAW frequency
musical note / MIDI / velocity / pan / articulation
layer trigger flags
x0 / burn-in / mapping version
```

---

## 4. Audio layer

Location:

```text
src/audio/
```

### RAW engine

`RawAudioEngine`

- Tone Transport scheduling
- sine synth
- continuous frequency from canonical event
- no musical arrangement

### MUSICALIZED engine

`MusicalAudioEngine`

Primary orbit lead:

- `Tone.FMSynth`

Derived artistic layers:

- `Tone.MonoSynth` bass
- `Tone.PolySynth` halo
- `Tone.PolySynth` D/A drone
- `Tone.NoiseSynth` transient

Routing:

```text
lead → panner → reverb ┐
halo ───────→ reverb   │
bass ──────────────────┼→ compressor → limiter → destination
drone ─────────────────┤
transient ──────────────┘
```

### Event timing

Tone's audio clock owns note timing.

Visual event callbacks are scheduled with `Tone.getDraw()` at the same audio-context timestamp.

JavaScript wall-clock timers are not used as the musical scheduler.

---

## 5. RAW coda

Location:

```text
src/audio/coda.ts
```

In the final four bars of the `limit` segment:

- RAW sine mix rises monotonically from 0 toward 1
- FM lead mix falls toward 0
- transient is removed first
- halo second
- bass third
- drone fourth

Live playback, offline WAV, MIDI approximation, tests, UI readout, and provenance consume the same coda policy.

---

## 6. Explore Mode

Explore Mode is deliberately isolated from the canonical Transport.

```text
canonical Transport
      │
      └── paused / position preserved

selected r, x0
      ↓
fixed-r portrait
      ↓
ParameterAuditioner
      ↓
direct AudioContext scheduling
```

Closing Explore restores the canonical performance event from the untouched Transport time.

This prevents exploration from corrupting the 3:50 score.

---

## 7. Visualization

Location:

```text
src/visual/
src/workers/
```

### Bifurcation field

Generated in a Web Worker and rendered with `regl-scatterplot`.

Planned/implemented quality tiers:

| Tier | r samples | retained points/r | total |
| --- | ---: | ---: | ---: |
| high | 4096 | 96 | 393,216 |
| medium | 2048 | 64 | 131,072 |
| low | 1024 | 48 | 49,152 |

The worker transfers `Float32Array` buffers to the main thread.

The worker caps a request at one million points.

### Dynamic overlays

Separate from the static point cloud:

- active `r` line
- active `(r, x)` event marker
- chapter cue
- orbit-history strip
- labels/readouts

## 7.1 Cinematic camera score

Performance Mode uses a deterministic chapter camera score from `src/visual/visualScore.ts`.

The camera changes **presentation framing only**. The bifurcation points, active event values, and score are not recomputed or displaced.

To avoid visually misrepresenting mathematics during a smooth camera transition, the DOM-based active scan line and point temporarily fade out until the WebGL renderer reports that the camera transition has completed.

Instrument Mode resets the scatterplot to the full original camera view.

### Math Lens

- cobweb plot
- finite Lyapunov strip

These are explanatory mathematical views, not audio-reactive decoration.

---

## 8. Rendering-quality policy

Location:

```text
src/visual/quality.ts
```

Quality selection considers:

- viewport width
- device pixel ratio
- hardware concurrency
- reduced-motion preference

Only rendering density changes.

The canonical score and active mathematical coordinates do not.

---

## 9. Export architecture

Location:

```text
src/export/
```

### Provenance JSON

Highest-fidelity reconstruction artifact.

Includes:

- equation
- canonical numerical parameters
- form
- mappings
- chapters
- integrity notes
- every canonical event

### MIDI

Interchange representation of the musicalized arrangement.

Tracks:

1. Orbit Lead
2. Derived Bass
3. Harmonic Halo
4. Artistic Drone
5. Jump Transients approximation
6. RAW Coda nearest-semitone approximation

Ordinary MIDI cannot encode the continuous RAW coda exactly without a more elaborate pitch-bend/MPE representation.

### WAV

`Tone.Offline` renders the score into an `AudioBuffer`.

The project then encodes deterministic 16-bit PCM RIFF/WAVE bytes.

Two masters are available:

- RAW WAV
- MUSICALIZED WAV

---

## 10. React responsibilities

React manages:

- UI state
- transport controls
- mode controls
- panels
- labels/readouts
- current event identity

React does **not** render hundreds of thousands of bifurcation points.

The WebGL renderer owns the dense plot imperatively.

---

## 11. Test architecture

### Vitest

Protects:

- mathematical reference regimes
- score shape/duration
- mapping range/invariants
- Explore portraits
- chapter boundaries
- Math Lens calculations
- visual quality tiers
- WAV encoder
- MIDI/provenance structure
- final coda

### Astro diagnostics

Protects:

- TypeScript integration
- JSX/Astro contracts
- browser/worker/export typing

### Production build

Protects:

- bundling
- dynamic imports
- worker assets
- client-only React island output

### Playwright

Runs against the production preview.

Protects:

- real browser boot
- WebGL stage
- Math Lens
- Web Audio unlock
- RAW/MUSICALIZED switch
- period-3 chapter seek
- Explore Mode
- JSON/MIDI downloads
- absence of browser/page errors in tested flows

---

## 12. Key dependency boundaries

```text
math
 ↓
composition
 ↓
 ├── audio
 ├── visual
 └── export

components
 ├── audio APIs
 ├── visual APIs
 └── export APIs
```

The mathematical layer should never import from downstream presentation layers.

---

## 13. Performance priorities

If resources are constrained, degrade in this order:

1. point-cloud density
2. visual glow/decorative effects
3. trail complexity
4. auxiliary visual detail

Do **not** degrade:

- audio scheduling accuracy
- canonical event values
- chapter timing
- active mathematical coordinate
- integrity readouts
