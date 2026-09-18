# Feature Branch History

The repository was intentionally developed as cumulative feature branches.

Each branch starts from the previously completed feature so it represents a runnable checkpoint.

| Branch | Feature |
| --- | --- |
| `feature/00-project-scaffold` | Astro/React/TypeScript scaffold |
| `feature/01-math-core` | logistic map, Lyapunov, period detection/classification |
| `feature/02-score-engine` | canonical 92-bar / 736-event score |
| `feature/03-raw-audio` | continuous-frequency RAW Tone.js engine |
| `feature/04-bifurcation-visualization` | worker-driven WebGL bifurcation field |
| `feature/05-audio-visual-sync` | audio-clock synchronized active point |
| `feature/06-musicalized-audio` | lead/bass/halo/drone/transient arrangement |
| `feature/07-mode-comparison` | same-position RAW ↔ MUSICALIZED A/B |
| `feature/08-mapping-inspector` | mathematical / transform / artistic trace |
| `feature/09-orbit-history` | local time-order orbit trace |
| `feature/10-chapter-navigation` | score-form navigation and exact chapter seeks |
| `feature/11-math-lens` | cobweb and Lyapunov views |
| `feature/12-explore-mode` | independent fixed-r portrait audition |
| `feature/13-export-system` | provenance JSON and MIDI |
| `feature/14-offline-wav` | Tone.Offline RAW/MUSICALIZED WAV |
| `feature/15-accessibility-performance` | adaptive density, reduced motion, keyboard, worker safeguards |
| `feature/16-cinematic-storytelling` | mathematical chapter cues and regime treatment |
| `feature/17-raw-coda` | four-bar deconstruction back to RAW |
| `feature/18-ci-verification` | unit/diagnostic/build GitHub Actions gate |
| `feature/19-browser-smoke-tests` | Playwright production-browser verification |
| `feature/20-project-documentation` | durable architecture/integrity/presentation documentation |

## Verification milestone

`feature/18-ci-verification` was the first cumulative branch to pass:

- dependency install
- all Vitest suites
- Astro diagnostics
- production build

`feature/19-browser-smoke-tests` additionally passes:

- Playwright Chromium installation
- production preview startup
- WebGL bifurcation-field boot
- Math Lens interaction
- Web Audio unlock
- RAW/MUSICALIZED switch
- period-3 chapter seek
- Explore Mode
- provenance JSON download
- MIDI download

## Branch policy

No branch should be described as complete until its feature-specific checks pass.

No automatic merge into `main` is part of this development workflow.

The user/maintainer can review checkpoints independently before choosing a merge strategy.
