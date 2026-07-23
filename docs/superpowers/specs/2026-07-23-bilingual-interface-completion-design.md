+# Bilingual Interface Completion Design

## Goal

Complete the MCP-2099 bilingual presentation layer for all remaining front-end-owned panels without translating dynamic runtime payloads or protocol identifiers.

## Scope

Translate the remaining static UI owned by the front end:

- Interface, Protocol, and Logs workspace panels.
- Mission timeline and result card.
- Mission history drawer.
- Left information panel and right telemetry headings.
- Command palette labels and empty states.
- Static labels in approval flow.

Do not translate task objectives, audit record messages, profile/schema values, task IDs, artifact names, raw API errors, or protocol identifiers.

## Architecture

Reuse the existing locale dictionary, context, and provider. Components consume `useLocaleText()` only for static labels. Known display-state labels are mapped through dictionary keys; externally supplied values continue to render directly.

## UX

A Chinese locale should no longer expose large English-only static surfaces after the initial workflow path. Where a panel mixes static structure and runtime data, only the structure changes language. Visual layout, labels length, color state, keyboard behavior, and WebGL rendering are unchanged.

## Testing

- Extend locale lookup tests for representative workspace, timeline, and result labels.
- Run complete tests, lint, and production build.

## Constraints

- No dependencies or Agent Contract changes.
- Preserve current light/dark visual contrast.
- Do not change runtime behavior, state transitions, or adapter interactions.
- Do not use Git commands, commits, branches, or worktree changes.

