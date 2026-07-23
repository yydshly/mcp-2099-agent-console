+# Bilingual Interface Design

## Goal

Provide a complete English and Simplified Chinese presentation layer for the MCP-2099 front end while keeping protocol identifiers, task IDs, profile IDs, and raw runtime payloads stable.

## Scope

Translate front-end-owned navigation, controls, panel headings, status descriptions, forms, confirmation copy, empty states, and operator feedback. The current English console presentation remains the default.

Do not translate:

- MCP-2099 branding and protocol names.
- Task IDs, request IDs, profile IDs, artifact names, and server-provided raw values.
- Generic business fields without a profile-provided display translation.

## Architecture

A locale module provides a `Locale` union, a persisted `useLocale` hook, and a typed translation dictionary. Components use a compact `t(key)` lookup for UI-owned static text.

The page provides locale state to the navigation switcher and selected high-traffic overlays. Existing machine identifiers remain direct values. Dynamic state labels use a mapping layer only when the label is a known front-end enum.

## Options Considered

### Translate every string immediately

Maximum coverage but requires rewriting every large legacy component, increasing visual regression risk.

### Translate navigation and all active operator workflows first

Covers the primary interaction path: navigation, dispatch, task controls, queue, approval, result actions, confirmations, runtime status, and status bar. Remaining descriptive legacy copy stays English until incrementally migrated.

This is selected because it makes the system usable in Chinese now without a risky rewrite.

### Use browser-native page translation

No code work but inconsistent terminology and unsuitable for product use.

## UX

- The navigation includes a compact `EN / 中文` toggle next to existing visual controls.
- Selection persists in `localStorage` under `mcp2099.locale`.
- English remains the default when no saved selection exists.
- The switch updates visible labels immediately without reloading or changing agent runtime state.
- Chinese translation uses concise operator language, not verbose prose.

## Integration Boundary

A later backend may send locale-aware profile display metadata. Until then, profiles and backend payloads render as received. Local profile extension components may opt into the locale hook for their own front-end copy.

## Testing

- Test locale validation, default fallback, and dictionary lookup.
- Test persistence-safe locale initialization without browser storage access.
- Run all tests, lint, and production build.

## Constraints

- No new dependencies.
- No Agent Contract v1 changes.
- Preserve accessibility labels in the active locale.
- Do not use Git commands, commits, branches, or worktree changes for this task.

