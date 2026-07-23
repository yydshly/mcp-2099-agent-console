# P1 scene hardening design

## Goal

Finish front-end P1 quality work: ensure every high-frequency WebGL layer follows the existing quality profile, make both theme directions share one transition rhythm, and validate remaining responsive breakpoints.

## Decisions

- Reuse `auto`, `eco`, and `cinema`; do not introduce another operator control.
- Apply `lowPower` to decorative fragments, background particles, and wire-sphere tessellation in addition to the core and orbit particles.
- Use a shared theme transition rate and shared timing window for both directions.
- Preserve reduced-motion behavior, visibility pause, adaptive DPR, context recovery, and runtime recovery as existing safeguards.

## Verification

Run unit tests, lint, production build, then inspect `1024x768`, `768x1024`, and phone landscape for overflow and panel clipping.
