# Presentation Guide

## Presenter preflight

Before the audience enters:

1. Use a Chromium-, Firefox-, or WebKit-family browser already verified by the project CI.
2. Connect venue audio and confirm both RAW sine output and MUSICALIZED output are audible.
3. Load the app once before going fullscreen so WebGL and audio assets are warm.
4. Click **Begin**, then pause. While playback is active the app requests a screen wake lock when the browser supports it; denial is harmless.
5. Keep the browser zoom at 100% and use the visible **Fullscreen** control or the `F` key.
6. Export provenance JSON, MIDI, RAW WAV, and MUSICALIZED WAV before the session.
7. Keep the deterministic poster and a screen recording available as visual fallbacks.
8. Verify the period-3 jump with presentation key `6`.

The presenter should never depend on venue internet after the application has loaded.

---

## Recommended live flow

### 1. Introduction — 30–45 seconds

Show:

```text
x[n+1] = r * x[n] * (1 - x[n])
```

Explain only:

- `x[n]` is the current state
- `r` controls the system
- every main audible event comes from an orbit value
- the plot and sound use the same event

Do not front-load the entire theory.

---

## 2. Play the artwork — 3:50

Recommended:

- fullscreen
- start in the intended performance mode
- avoid narrating over the piece

Let the audience experience:

1. one state
2. two
3. four
4. longer period-doubling cycles
5. irregular chaotic motion
6. the period-3 window
7. chaos returning
8. musical layers falling away into RAW

The period-3 island should be allowed to surprise the room.

---

## 3. Explain the reveal — 30 seconds

Seek to:

```text
VI. Island
r = 3.83
2:30
bar 61
```

Point out:

- active branches collapse to three
- period detector says 3
- Lyapunov estimate becomes negative
- the sound becomes a three-state cycle

Core lesson:

> increasing `r` does not mean chaos simply increases forever.

---

## 4. RAW vs MUSICALIZED — 30–60 seconds

At one fixed score position:

1. play RAW
2. switch to MUSICALIZED
3. open Mapping Inspector

Explain:

```text
MATHEMATICAL
→ TRANSFORM
→ ARTISTIC
```

Example:

```text
x[n]
→ continuous frequency
→ RAW sound
```

versus:

```text
x[n]
→ scale bucket
→ D-minor-pentatonic note
→ FM synthesis / bass / halo / effects
```

This is the strongest anti-hallucination demonstration.

---

## 5. Math Lens — 30–60 seconds

Open Math Lens.

### Cobweb

Show the iterate path:

```text
current x
→ logistic curve
→ identity line y = x
→ next x
```

### Lyapunov strip

Compare:

- `r = 3.72`
- `r = 3.83`
- `r = 3.9`

Emphasize the Lyapunov sign and detected period rather than raw `r`.

---

## 6. Explore Mode — 60 seconds

Useful presets:

| Label | r |
| --- | ---: |
| period 2 | 3.2 |
| period 4 | 3.5 |
| cascade | 3.568 |
| chaos | 3.72 |
| period 3 | 3.83 |
| chaos | 3.9 |
| limit | 4.0 |

Audition RAW first when teaching the mathematics.

Then use MUSICALIZED for the artistic contrast.

---

## 7. Closing line

Recommended:

> Deterministic does not mean predictable.

Then clarify:

> The system is deterministic; "chaos" here does not mean random noise.

---

# Classroom fallback package

Before presenting, export:

- provenance JSON
- musicalized MIDI
- RAW WAV
- MUSICALIZED WAV

Also keep:

- a screenshot of the bifurcation field
- a screen recording if available

If browser audio fails on venue hardware, WAV is the primary fallback.

If WebGL fails, the audio and mathematical explanation can continue from exported assets and static screenshots.

---

# Keyboard shortcuts

| Key | Use during presentation |
| --- | --- |
| Space | play/pause |
| R | RAW |
| M | MUSICALIZED |
| 1–8 | jump to the start of macro chapters I–VIII |
| E | Explore |
| L | Math Lens |
| P | Performance / Instrument |
| ? or / | interpretation guide |
| F | fullscreen |

Macro chapter keys are derived from the canonical score timeline, not duplicated timestamps. In particular, `6` seeks to **VI. Island**, bar 61, 2:30, `r = 3.83`.

---

# Time-constrained versions

## 90-second explanation

1. Show the equation and state that the same deterministic events drive sound and visualization.
2. Use `2`, `3`, then `5` to contrast short periodic cycles with chaos.
3. Use `6` for the period-3 reveal.
4. Switch RAW → MUSICALIZED at the same position.
5. Close with: **deterministic does not mean predictable**.

## 5-minute demo

1. 30 seconds — equation + shared event-stream rule.
2. 90 seconds — selected RAW portraits using keys `1`, `2`, `3`, `5`, `6`.
3. 60 seconds — RAW vs MUSICALIZED A/B.
4. 60 seconds — Math Lens at `r = 3.83`.
5. 60 seconds — Explore Mode and mapping inspector.
6. 30 seconds — integrity statement and closing line.

---

# What not to say

Avoid:

> "These notes are hidden inside the equation."

Use:

> "The equation generates the states; I chose a transparent mapping that turns those states into pitch."

Avoid:

> "At high r everything is chaotic."

Use:

> "The broad region contains chaotic behavior and periodic windows, including this period-3 island."

Avoid:

> "This is random music."

Use:

> "The source system is deterministic, although chaotic trajectories can be highly sensitive and difficult to predict."
