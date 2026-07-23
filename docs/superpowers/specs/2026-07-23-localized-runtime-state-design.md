# Localized runtime state design

## Goal

Complete bilingual presentation for front-end-owned task states and local scenario labels without translating backend business payloads or machine identifiers.

## Boundaries

- Translate display states, task phases, and local scenario fixture labels/details.
- Retain trace codes, identifiers, and backend-provided business payloads.
- Keep mappings in a focused UI module so domain view models remain locale-neutral.

## Verification

Unit tests cover task display-state, agent phase, and scenario translation-key mapping. Full test, lint, and build checks remain required.
