# BIFURCATE Submission Checklist

Use this checklist for any classroom, exhibit, portfolio, or competition submission.

## 1. Source integrity

- [ ] Submission is based on a named Git commit or branch head.
- [ ] Normal CI is green on that exact commit.
- [ ] Independent Python math verification passes.
- [ ] Vitest passes.
- [ ] Astro diagnostics pass.
- [ ] Production build passes.
- [ ] Chromium desktop passes.
- [ ] Firefox desktop passes.
- [ ] WebKit desktop passes.
- [ ] mobile Chromium passes.
- [ ] mobile WebKit passes.

## 2. Canonical mathematical contract

- [ ] Equation is `x[n+1] = r*x[n]*(1-x[n])`.
- [ ] `x0 = 0.2`.
- [ ] canonical burn-in = 4096.
- [ ] 92 bars.
- [ ] 96 BPM.
- [ ] 230 seconds.
- [ ] 736 primary events.
- [ ] period-3 window is represented at r = 3.83.
- [ ] RAW and MUSICALIZED use the same event IDs/data.
- [ ] chaos is never described as randomness.

## 3. Release manifest

Run:

`python scripts/generate_release_manifest.py`

Then verify:

`git diff --exit-code -- public/bifurcate-release-manifest.json`

The manifest must contain:

- [ ] schema `bifurcate.release-manifest.v1`
- [ ] SHA-256 as the hash algorithm
- [ ] canonical score metadata
- [ ] canonical segment summary
- [ ] package-lock hash
- [ ] independent math fixture hash
- [ ] math/score/mapping/audio/visual source hashes
- [ ] static poster/social/favicon/manifest hashes

Do not manually edit the generated release manifest.

## 4. Exported artifacts

From the app Export panel:

- [ ] export provenance JSON
- [ ] export release manifest
- [ ] export musicalized MIDI
- [ ] run short WAV diagnostic
- [ ] export RAW WAV on a capable desktop
- [ ] export MUSICALIZED WAV on a capable desktop
- [ ] record technical QC results

Remember:

- MIDI is event/control data, not rendered Tone.js audio.
- technical QC is not a substitute for listening review.
- a high-memory warning should not be bypassed casually on a constrained device.

## 5. Listening review

Listen to the complete WAV on:

- [ ] headphones
- [ ] laptop speakers
- [ ] phone speaker
- [ ] intended presentation speakers, if available

Check:

- [ ] RAW periodicity is audible at period 1 / 2 / 4
- [ ] chaotic sections are not represented merely by loudness
- [ ] period-3 window is perceptibly calmer/ordered
- [ ] musical layers do not hide the orbit lead
- [ ] coda audibly strips back toward RAW
- [ ] no clipping/clicks/dropouts
- [ ] final level is appropriate for the room

## 6. Visual review

- [ ] Performance view matches release baseline.
- [ ] Instrument view matches release baseline.
- [ ] active mathematical markers are hidden during camera transitions.
- [ ] reduced-motion preference leaves the data legible.
- [ ] no dangerous full-screen flashing.
- [ ] mobile layout has no horizontal overflow.
- [ ] no-WebGL fallback is meaningful rather than blank.

## 7. Accessibility/comprehension

- [ ] “How to read this” guide opens.
- [ ] help shortcut works after interactive hydration.
- [ ] keyboard focus is visible.
- [ ] playback progress exposes semantic ARIA values.
- [ ] reduced motion is respected.
- [ ] artistic choices are labeled as artistic.
- [ ] presenter notes are not presented as mathematical evidence.

## 8. Presentation resilience

Keep offline copies of:

- [ ] `bifurcate-poster.png`
- [ ] RAW WAV
- [ ] MUSICALIZED WAV
- [ ] provenance JSON
- [ ] release manifest
- [ ] MIDI
- [ ] presentation runbook

Verify Presenter mode:

- [ ] open `?presenter=1`
- [ ] cue at 0:00 = equilibrium
- [ ] cue at 2:30 = period-3 island
- [ ] cue at 3:00 = return to chaos
- [ ] D toggles the private cue sheet

## 9. External host

Do **not** claim an external deployment is verified just because it returned HTTP 200.

A host is verified only after the manual workflow:

`Verify external release candidate`

passes against the exact HTTPS URL.

The workflow checks:

- non-empty BIFURCATE HTML
- security headers
- static assets
- live browser interaction
- RAW audio unlock
- period-3 navigation
- Explore
- JSON/MIDI export
- no-JS fallback

## 10. Submission copy

Before submitting, ensure the description distinguishes:

**Mathematics**
- logistic-map equation
- orbit values
- detected periodicity
- finite Lyapunov estimate

**Transformation**
- continuous-frequency RAW mapping
- pitch buckets / delta-derived controls

**Artistic composition**
- D-minor pentatonic choice
- instruments
- bass/halo/drone
- effects
- chapter arrangement
- final coda

## Final gate

A release is ready only when the answer to all three questions is yes:

1. Can the mathematics be independently reconstructed?
2. Can the artistic mapping be explained without pretending it is inherent in the equation?
3. Can the project still be presented truthfully if the live demo fails?
