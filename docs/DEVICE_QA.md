# Device and Browser QA

Automated Playwright projects cover:

- Desktop Chromium
- Desktop Firefox
- Desktop WebKit
- Pixel-style mobile Chromium
- iPhone-style mobile WebKit

These tests are necessary but do not replace real-device checks for Web Audio, WebGL, memory pressure, and speaker translation.

## Core compatibility contract

Every supported browser should preserve:

- mathematical score/event identity
- RAW/MUSICALIZED distinction
- transport controls
- chapter navigation in Instrument view
- Math Lens
- Explore Mode
- provenance JSON and MIDI export
- semantic mathematical readouts

If WebGL scatterplot initialization fails, the app must show the explicit visual fallback rather than a blank stage.

## Real-device matrix

Before v1 release, manually record results for:

| Platform | Browser | Performance view | Audio | WebGL | Explore | WAV | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Windows laptop | Chrome | | | | | | |
| Windows laptop | Firefox | | | | | | |
| macOS | Safari | | | | | | |
| iPhone | Safari | | | | | | |
| Android phone | Chrome | | | | | | |
| presentation display/device | available browser | | | | | | |

## Things automation cannot fully simulate

Check explicitly:

- audio begins only after the user's gesture
- speaker output is loud enough without harshness
- screen lock/backgrounding does not leave the Transport in a confusing state
- portrait/landscape transitions do not create horizontal overflow
- touch sliders remain easy to control
- fullscreen availability differs by browser/device
- WebGL context survives orientation and tab switches
- a 230-second offline WAV render does not exceed practical device memory

## Failure policy

A missing enhanced capability should degrade clearly:

- WebGL failure → mathematical visual fallback
- fullscreen unavailable → remain in normal Performance view
- full WAV render too expensive → retain JSON/MIDI and recommend desktop render
- reduced-motion preference → suppress cinematic transitions without changing data

Do not hide a compatibility failure behind a generic loading state.
