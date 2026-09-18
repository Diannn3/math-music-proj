# BIFURCATE Presentation Runbook

This runbook is tied to the canonical 92-bar, 230-second score. Do not rewrite the mathematical story ad hoc during a presentation.

## Core sentence

> BIFURCATE uses one deterministic equation to generate the same event stream for both sound and visualization, then lets the audience compare a direct RAW sonification with an explicitly musicalized interpretation.

## Non-negotiable mathematical language

Say:

- deterministic chaos
- finite numerical orbit
- finite Lyapunov estimate
- no low period detected in the tested range
- period-3 window near r = 3.83
- RAW and MUSICALIZED share the same mathematical events

Do **not** say:

- chaos is random
- higher r always means more chaos
- the D-minor pentatonic scale is hidden in the logistic map
- the MIDI file is the rendered sound
- a numerical period detector is a symbolic proof

## Preflight

### 10 minutes before

1. Open the app once and let the bifurcation field finish building.
2. Confirm the stage shows orbit points or the explicit visual fallback.
3. Click **Begin raw sonification** once so Web Audio is unlocked.
4. Pause.
5. Open Instrument view.
6. Verify:
   - II. Split -> r = 3.2000, period 2
   - III. Four -> r = 3.5000, period 4
   - VI. Island -> r = 3.8300, period 3
7. Open Export and run the short RAW + MUSICALIZED WAV diagnostic.
8. Confirm projector scaling and readable text.
9. Confirm speakers are not clipping.
10. Keep the poster image and exported WAV files available offline.

### 2 minutes before

- Reload only if necessary.
- Avoid changing browser zoom after visual alignment is checked.
- Put the browser in fullscreen if supported.
- Close notifications.
- Keep the laptop plugged in.
- Use Performance view for the audience.
- Open presenter cues with `?presenter=1` or press `D` only on the presenter screen.

## Full 3:50 performance cue score

| Time | Chapter | r | What the audience should notice |
| --- | --- | ---: | --- |
| 0:00 | I. Equilibrium | 2.8 | one attracting value / one repeated sonic state |
| 0:20 | II. Split | 3.2 | a two-state cycle |
| 0:50 | III. Four | 3.5 | four-state repetition |
| 1:20 | IV. Cascade | 3.55 -> 3.5698 | longer periodic structure without speeding up tempo |
| 1:50 | V. Break | 3.72 | deterministic irregularity, positive finite Lyapunov estimate |
| 2:30 | VI. Island | 3.83 | **period-3 order returns inside a broader chaotic region** |
| 3:00 | VII. Return | 3.9 | chaos returns |
| 3:30 | VIII. Limit | 4.0 | final high-chaos chapter |
| ~3:40 | Coda | 4.0 | artistic layers strip away until RAW frequency is exposed |

The period-3 window is the narrative centerpiece. Give it room. Do not talk over the entire 2:30 reveal.

## Recommended spoken flow

### Before playback — ~45 seconds

1. Show the equation:
   `x[n+1] = r x[n] (1 - x[n])`.
2. Explain:
   - horizontal position is `r`
   - vertical position is the orbit value `x[n]`
   - every primary sounded event comes from the same orbit data used by the visualization
3. State the A/B distinction:
   - RAW = continuous-frequency mapping
   - MUSICALIZED = explicit scale/instrument/arrangement choices

Then play.

### During playback

Use minimal narration.

Good interventions:

- 0:20: “Two states.”
- 0:50: “Now four.”
- 1:50: “The equation is still deterministic.”
- 2:30: “Order returns.”
- 3:40: stop speaking and let the coda expose RAW.

### After playback — ~90 seconds

Switch to Instrument view and demonstrate:

1. r = 3.2 -> period 2
2. r = 3.5 -> period 4
3. r = 3.72 -> chaotic classification / no low period
4. r = 3.83 -> period 3
5. RAW -> MUSICALIZED at the same chapter

Then open the mapping explanation if asked.

## Short presentation path

If there is not enough time for the full 3:50 performance:

1. Start at I. Equilibrium for 5–8 seconds.
2. Jump to II. Split.
3. Jump to III. Four.
4. Jump to V. Break.
5. Jump to VI. Island and hold it longest.
6. A/B RAW and MUSICALIZED at VI. Island.
7. End at VIII. Limit or explain the coda verbally.

Do not accelerate the canonical piece and call that the original composition. A shortened chapter-jump demo is a separate presentation path.

## Failure ladder

### Level A — full live app

Use the complete synchronized experience.

### Level B — live app, reduced visuals

If WebGL fails but audio works, use the app's explicit mathematical fallback. Explain that the fallback still shows current r, x, lambda, and period.

### Level C — audio fallback

If live Web Audio is unreliable:

- play the pre-exported RAW WAV
- play the pre-exported MUSICALIZED WAV
- use the static poster or app visualization separately

State that the WAVs were rendered offline from the same deterministic score.

### Level D — static fallback

If the browser/projector fails:

- use `public/bifurcate-poster.png`
- show the canonical timeline
- use provenance JSON / MIDI / release manifest as evidence

The project can still be explained truthfully without pretending a failed live renderer worked.

## Presenter mode

Open with:

`?presenter=1`

or press:

`D`

Presenter mode is a private cue sheet. It contains:

- current talking point
- recommended demo action
- fallback line
- next cue
- one-click canonical chapter jumps

Presenter notes are explicitly artistic/presentation metadata. They are not part of the mathematical event stream.

## Submission artifacts to keep on the laptop

- source repository snapshot
- `BIFURCATE-provenance.json`
- `BIFURCATE-release-manifest.json`
- `BIFURCATE-musicalized.mid`
- RAW WAV
- MUSICALIZED WAV
- `bifurcate-poster.png`
- `bifurcate-social.png`
- screenshots of Performance and Instrument views

## Final line option

> The same deterministic equation can produce stable order, successive bifurcations, chaos, and islands of order again. BIFURCATE does not claim the math contains music; it makes the mathematical structure audible, then shows exactly where composition begins.
