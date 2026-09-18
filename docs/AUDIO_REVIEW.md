# BIFURCATE Audio Review

Automated audio QC can detect technical faults. It cannot determine whether the composition is successful.

Use this worksheet on exported **RAW WAV** and **MUSICALIZED WAV** before calling an audio master final.

## Pass 1 — Mathematical audibility

Listen to RAW without watching the visualization.

Can you hear the intended structural differences?

- [ ] `r = 2.8`: essentially one stable pitch after burn-in
- [ ] `r = 3.2`: unmistakable two-state alternation
- [ ] `r = 3.5`: recognizable four-state loop
- [ ] cascade: repetition length becomes progressively harder to hold mentally
- [ ] `r = 3.72`: no short repeating loop dominates
- [ ] `r = 3.83`: three-state order clearly returns
- [ ] `r = 3.9`: irregular behavior clearly returns
- [ ] `r = 4`: final RAW material remains intelligible

If these distinctions are unclear, fix the sonification or arrangement before adding more effects.

## Pass 2 — Musical form

Listen to MUSICALIZED without the screen.

Check:

- [ ] equilibrium is intentionally sparse rather than merely empty
- [ ] period 2 and period 4 remain audible under the artistic layers
- [ ] the cascade builds tension without using tempo acceleration as a shortcut
- [ ] chaos becomes structurally richer, not simply louder
- [ ] the period-3 island produces the strongest formal contrast
- [ ] the second chaotic section feels related but not copy-pasted
- [ ] the final four-bar deconstruction toward RAW is clearly audible
- [ ] 3:50 feels justified; no section feels obviously overlong

Write notes by timestamp rather than changing synthesis immediately.

## Pass 3 — Balance and fatigue

Check:

- orbit lead remains the mathematical focus
- bass never masks the orbit lead
- D/A drone is supportive and not fatiguing
- halo is audible but does not smear periodic patterns
- noise transients clarify large changes rather than sounding like unrelated percussion
- chaotic chapters do not become harsh through excessive FM brightness
- reverb does not obscure the period-3 return
- stereo motion is noticeable but comfortable on headphones

## Pass 4 — Translation

Listen at matched perceived level on:

1. good headphones
2. laptop speakers
3. phone speaker
4. classroom / TV / portable speaker if available

For each device note:

- orbit lead clarity
- bass audibility
- drone audibility
- harshness
- period-3 contrast
- coda clarity

Do not compensate for a weak phone speaker by destroying the headphone master. Prefer a balanced compromise.

## Pass 5 — Technical release QC

The Export panel reports:

- sample peak in dBFS
- RMS in dBFS
- crest factor
- DC offset
- sample rate
- duration
- channel count / non-finite sample faults

Important:

- RMS is **not LUFS**
- passing QC does **not** mean the mix is mastered
- the limiter target does not guarantee true-peak compliance after codec conversion
- final loudness decisions must be made by listening

## Decision log

For every mix change record:

```text
timestamp / chapter:
problem heard:
device:
change made:
mathematical consequence:
musical consequence:
retested on:
```

If a change makes the music prettier but obscures the mathematical structure, reject or redesign it.
