# Release Performance and Visual Regression

BIFURCATE treats performance and layout as release behavior, not informal polish.

## CI performance budgets

The current GitHub-runner budgets are defined in:

```text
src/performance/budgets.ts
```

Desktop Chromium:

- heading visible within 3.5 s
- high/selected orbit field ready within 12 s
- Performance → Instrument switch within 750 ms
- workerized Explore portrait update within 1.2 s

Mobile Chromium:

- heading visible within 4 s
- low-tier 49,152-point field ready within 10 s
- Performance → Instrument switch within 900 ms
- no horizontal page overflow

These are **CI regression guardrails**, not claims that every physical device will meet those exact numbers.

If GitHub runner variance repeatedly approaches a budget, profile the code before widening the threshold.

## What must never be traded for speed

Performance degradation should occur in this order:

1. reduce point-cloud density
2. reduce decorative glow/effects
3. reduce optional trail detail

Do not degrade:

- mathematical event values
- audio scheduling accuracy
- active `r,x` identity
- chapter timing
- provenance/export correctness

## Visual regression

Chromium CI stores four release baselines:

```text
e2e/visual-regression.spec.ts-snapshots/
  performance-desktop-chromium-linux.png
  instrument-desktop-chromium-linux.png

e2e/visual-regression.mobile.spec.ts-snapshots/
  performance-mobile-mobile-chromium-linux.png
  instrument-mobile-mobile-chromium-linux.png
```

The WebGL canvas is masked during screenshot comparison. This is intentional:

- dense point-cloud rasterization can vary across GPU/backend implementations
- layout, typography, controls, overlays, readouts and responsive geometry should remain stable
- mathematical renderer correctness is checked separately through WebGL smoke tests, point-count assertions and event-coordinate tests

## Updating baselines

Do not use `--update-snapshots` simply because CI fails.

Update a baseline only when:

1. the visual change is intentional
2. desktop and mobile layouts were reviewed
3. mathematical/readout semantics did not regress
4. the new baseline is generated in the Linux Chromium CI-equivalent environment

Baseline updates should have an explicit commit message explaining the intended visual change.
