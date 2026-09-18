# BIFURCATE Submission Package

## Project title

**BIFURCATE — Hearing the Logistic Map**

## One-sentence description

A deterministic audiovisual composition and interactive instrument that lets an audience hear and see the logistic map move through equilibrium, period doubling, chaos, a period-3 window, and chaos again.

## Short abstract

BIFURCATE begins with the logistic map

```text
x[n+1] = r * x[n] * (1 - x[n])
```

and turns its fixed-parameter orbit values into synchronized sound and visualization. The canonical work is 92 bars at 96 BPM, lasts 230 seconds, and contains 736 primary events generated from the same deterministic mathematical event stream used by the visual stage.

The project presents two deliberately separate interpretations. **RAW** maps each orbit value directly to a continuous frequency, preserving periodic repetition without scale quantization. **MUSICALIZED** uses the same event identity but applies an explicitly artistic D-minor-pentatonic mapping, dynamics, spatialization, synthesis, bass, halo, drone, and effects. A mapping inspector makes that transformation visible instead of presenting compositional decisions as mathematical discoveries.

The central narrative is the return of order near `r = 3.83`: after a chaotic section, the orbit enters a period-3 window and becomes periodic again. This demonstrates why increasing `r` should not be described as a monotonic "chaos amount."

## Mathematical method

Canonical configuration:

- equation: `x[n+1] = r*x[n]*(1-x[n])`
- initial state: `x0 = 0.2`
- burn-in: 4096 iterations
- fixed `r` inside every portrait
- finite period search: up to period 128
- finite Lyapunov estimate from `ln |r(1 - 2x)|`

Canonical narrative values:

| Macro chapter | r | Reference behavior |
| --- | ---: | --- |
| I. Equilibrium | 2.8 | period 1 |
| II. Split | 3.2 | period 2 |
| III. Four | 3.5 | period 4 |
| IV. Cascade | 3.55 / 3.568 / 3.5698 | increasing finite periodicity |
| V. Break | 3.72 | chaotic reference orbit |
| VI. Island | 3.83 | period 3 |
| VII. Return | 3.9 | chaotic reference orbit |
| VIII. Limit | 4.0 | chaotic reference orbit |

These classifications are numerical observations for the implemented finite trajectories. They are not presented as symbolic proofs.

## Sound mappings

### RAW

```text
f = 110 * 2^(4x)
```

So `x ∈ [0,1]` maps continuously from 110 Hz to 1760 Hz.

RAW deliberately removes:

- scale quantization
- bass
- drone
- halo
- compositional transient layer
- stereo movement derived for the artistic version

### MUSICALIZED

The same orbit values are quantized to a 15-note D minor pentatonic palette across three octaves. Further artistic mappings use orbit change `Δx` for velocity, articulation, and restrained spatial motion.

Those choices are labeled **artistic** throughout the interface and provenance export.

## Visual method

The main stage is the bifurcation diagram:

- horizontal coordinate = `r`
- vertical coordinate = orbit state `x`
- active line = current fixed parameter
- active point = exact event currently being represented
- orbit history = visitation order
- state styling = classification / Lyapunov behavior, not raw `r`

Audio and visualization consume the same canonical event identity.

## Interaction

The release includes:

- Performance view
- Instrument view
- RAW ↔ MUSICALIZED A/B
- chapter navigation
- numeric macro chapter hotkeys `1–8`
- Math Lens with cobweb and Lyapunov views
- Explore Mode for independent fixed-`r` portraits
- provenance JSON export
- multitrack MIDI export
- offline RAW and MUSICALIZED WAV rendering
- deterministic static poster/social artwork
- JavaScript-disabled fallback
- reduced-motion support
- screen wake-lock enhancement during playback when supported

## Reproducibility and integrity

The repository verifies the work through independent layers:

1. TypeScript mathematical implementation.
2. Independent Python canonical-reference verifier.
3. Frozen numerical reference fixture.
4. Unit/invariant tests.
5. Astro + TypeScript diagnostics.
6. Production build.
7. Desktop Chromium, Firefox, and WebKit browser tests.
8. Mobile Chromium and mobile WebKit browser tests.
9. Deterministic screenshot regression.
10. Performance budgets.
11. Offline-audio structural and technical QC.
12. Deterministic release-artwork regeneration.

Important semantic rules:

- chaos is not called random;
- `r` is not used as a direct chaos meter;
- finite period detection is not called proof;
- RAW and MUSICALIZED share mathematical event identity;
- musical scale, timbre, harmony, and effects are not claimed to be hidden in the equation;
- MIDI is distinguished from rendered audio.

## Recommended submitted artifacts

Include:

- live web application or verified release-candidate URL
- repository link
- deterministic poster image
- provenance JSON
- musicalized MIDI
- RAW WAV
- MUSICALIZED WAV
- short screen recording
- mathematical-integrity document
- this submission summary

## Presenter fallback hierarchy

If the live application fails:

1. use pre-rendered MUSICALIZED WAV with the screen recording;
2. use RAW WAV to explain direct sonification;
3. use the deterministic bifurcation poster for the visual explanation;
4. use provenance JSON to show exact parameters and event identity;
5. use MIDI only as a symbolic musical export, not as proof of the audio rendering.

## Closing statement

> The equation generates the states. The project makes those states perceptible, then explicitly shows where human composition turns them into music.
