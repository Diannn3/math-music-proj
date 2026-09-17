# BIFURCATE — Hearing the Logistic Map

An audiovisual composition and interactive mathematical instrument based on the logistic map:

\[
x_{n+1}=r x_n(1-x_n)
\]

The implementation deliberately separates **raw sonification** from **musicalized composition**, and drives audio and visualization from the same deterministic event stream.

## Development workflow

Features are developed cumulatively on sequential feature branches:

- `feature/00-project-scaffold`
- `feature/01-math-core`
- `feature/02-score-engine`
- `feature/03-raw-audio`
- …

## Local development

```bash
npm install
npm run dev
```

## Research guardrails

- `r` is not itself a chaos meter.
- Deterministic chaos is not the same as randomness.
- Raw sonification and musicalized output remain separately inspectable.
- Musical scale, orchestration, and effects are explicit artistic choices.
- MIDI is event/control data, not rendered audio.
