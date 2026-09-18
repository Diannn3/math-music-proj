# Mathematical Integrity and Anti-Hallucination Contract

This document defines what the project is allowed to claim.

## 1. Mathematical source

The canonical system is:

```text
x[n+1] = r * x[n] * (1 - x[n])
```

Canonical initial condition:

```text
x0 = 0.2
```

For the canonical composition, each orbit portrait uses a fixed `r`.

The project discards **4096 iterations** before collecting canonical performance values.

---

## 2. Finite numerical realization

The browser uses JavaScript `number`, corresponding to IEEE-754 binary64 arithmetic.

Therefore the rendered orbit is a finite numerical realization of the mathematical system. The project must not claim that browser floating-point execution reproduces an infinite exact real-number trajectory.

---

## 3. Period detection

Period detection searches a finite range of candidate periods using a numerical tolerance.

A UI value such as:

```text
period 3
```

means:

> the finite computed orbit tail satisfies the project's numerical period criterion for period 3.

For a chaotic reference state, the UI may say no period was detected within the tested bound. That is not a proof of infinite period.

---

## 4. Lyapunov estimate

For an orbit, the implementation estimates:

```text
lambda_N = (1/N) * sum ln | r * (1 - 2*x[n]) |
```

Typical interpretation:

- `lambda < 0`: attracting periodic behavior
- `lambda > 0`: chaotic behavior
- values near zero: transition behavior requires care

The project does **not** use `r` itself as a chaos score.

At `r = 4`, the known reference value for typical chaotic invariant behavior is:

```text
lambda = ln(2)
```

---

## 5. Why r = 3.83 matters

The period-3 window is central to the artwork.

It demonstrates:

```text
larger r != monotonically more chaos
```

The canonical reference portrait around `r = 3.83` numerically resolves to a stable period-3 cycle for the chosen realization, so the UI returns to a periodic classification there.

---

## 6. RAW sonification claim

The RAW pitch transform is:

```text
f = 110 * 2^(4*x)
```

This transform is a design choice. It is not a unique or physically inherent "sound of the logistic map."

What it preserves clearly:

- ordering of `x`
- normalized state magnitude on a logarithmic pitch axis
- orbit repetition when timing is fixed

What it changes:

- a dimensionless state becomes frequency
- distances are heard through a logarithmic pitch mapping

---

## 7. MUSICALIZED claim

The 15-note D minor pentatonic palette is an artistic constraint.

Allowed:

> The logistic-map state selects a bucket in a D minor pentatonic mapping.

Not allowed:

> The logistic map naturally contains a D minor pentatonic melody.

The same applies to:

- bass
- harmony
- tonal drone
- panning
- FM synthesis
- reverb
- transient noise
- coda orchestration

These are compositional decisions.

---

## 8. Information transformations

### Scale quantization

Many source values map to the same note, so quantization is lossy.

### Velocity mapping

Velocity is derived from `|delta x|`, not directly from absolute `x`.

### Stereo mapping

Pan represents the sign of local change. It does not represent physical space.

### Regime-aware timbre

Timbre responds to the computed regime. It is not itself a mathematical observable of the logistic map.

---

## 9. Visualization claim

The bifurcation field uses logistic-map points.

The active marker is the same canonical event being sounded.

Decorative state treatments may respond to regime, but they must never alter the plotted mathematical coordinate.

No FFT or audio spectrum is allowed to move the mathematical point.

---

## 10. RAW vs MUSICALIZED

RAW and MUSICALIZED are two representations of the **same event identity**.

They are not regenerated trajectories.

This is required for valid A/B comparison.

---

## 11. Explore Mode

Explore Mode creates an independent fixed-`r` portrait.

It must not mutate the canonical score.

Changing `r` during exploration does not rewrite the 3:50 composition.

---

## 12. Coda

The final RAW return is a compositional decision.

The RAW frequency remains mathematically derived, but these are artistic:

- the four-bar duration
- the order of layer removal
- the crossfade curve

---

## 13. MIDI limitations

MIDI is event/control data. It is not the Tone.js audio.

The RAW coda uses arbitrary continuous frequencies. The ordinary MIDI export therefore labels its representation:

```text
RAW Coda (nearest-semitone approximation)
```

It must not be presented as a lossless RAW export.

The RAW WAV is the correct rendered-audio representation.

---

## 14. Provenance hierarchy

When reconstructing the piece, prioritize:

1. provenance JSON
2. canonical source code and tests
3. this integrity document
4. MIDI
5. screenshots/video
6. verbal descriptions

---

## 15. Claims to reject

Do not say:

- "higher r always means more chaos"
- "chaos is random"
- "the equation naturally chose D minor"
- "the logistic map contains a hidden finished song"
- "the MIDI is the sound"
- "period detection proves the mathematical orbit has that period forever"
- "the visualization listens to FFT and therefore represents the equation"
- "musical beauty validates the scientific sonification"

---

## 16. Reproducibility minimum

A reconstruction must preserve at least:

- equation
- `x0`
- `r`
- burn-in
- event count
- numerical precision context
- tempo/event grid
- RAW transform
- musical mapping version
- chapter form

The provenance JSON preserves these for the canonical work.


## 17. Independent numerical verification

The release pipeline does not rely only on the TypeScript implementation testing itself.

A separate Python 3.12 verifier lives at:

```text
scripts/verify_math.py
```

It independently implements:

- logistic iteration
- canonical burn-in
- finite Lyapunov estimation
- finite period search
- regime classification

Frozen references live at:

```text
fixtures/canonical-math-reference.json
```

The fixture stores, for every canonical segment:

- `r`
- detected period
- finite Lyapunov estimate
- a post-burn-in orbit prefix
- the score-facing orbit prefix

CI runs the Python verifier first. Vitest then regenerates the same cases through the TypeScript implementation and compares them with the frozen fixture.

This is deliberately a cross-implementation consistency check, not a proof about the infinite mathematical system.

Special analytical sanity checks include:

- the `r = 2.8` attracting fixed point against `1 - 1/r`
- the finite `r = 4` Lyapunov estimate against the known `ln(2)` reference within a documented finite-sample tolerance
