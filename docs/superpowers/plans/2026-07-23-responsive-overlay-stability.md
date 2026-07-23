+# Responsive Overlay Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure MCP-2099 remains readable and operable at tablet, mobile, and low-height viewports in both locales.

**Architecture:** Add a narrow, late CSS override layer in `src/styles/panels.css`. It constrains existing shells with dynamic viewport units and reorders controls through responsive visibility rather than changing component state.

**Tech Stack:** CSS, React/Vite validation.

## Global Constraints

- No dependencies, contract changes, or runtime behavior changes.
- Preserve light/dark theme contrast and current z-index ordering.
- Keep task creation and locale controls available on narrow navigation.
- Do not use Git commands or create commits.

---

### Task 1: Stabilize navigation and modal bounds

**Files:**
- Modify: `src/styles/panels.css`

**Interfaces:**
- Produces responsive rules for `.locale-toggle`, `.top-navigation`, `.operation-confirm-gate`, and `.approval-gate`.

- [ ] At widths below 980px, hide visual mode before task creation and retain the locale switcher.
- [ ] At widths below 720px, wrap or simplify navigation controls without hiding the language or task creation entry.
- [ ] Bound confirmation and approval content with `max-height: calc(100dvh - ...)`, scrolling, and mobile-safe padding.

### Task 2: Prevent panel collisions and low-height clipping

**Files:**
- Modify: `src/styles/panels.css`

**Interfaces:**
- Produces breakpoint-specific stacked result/timeline panels and safe drawer regions.

- [ ] At mobile width, stack timeline and result cards across the full viewport width with non-overlapping bottom offsets.
- [ ] At low height, reduce panel max heights and ensure drawers, task panel, and workspace can scroll internally.
- [ ] Keep bottom status clear of panel content.

### Task 3: Verify build integrity

**Files:**
- Test: existing Vitest suite.

- [ ] Run `npm.cmd test; npm.cmd run lint; npm.cmd run build`.
Expected: all tests pass, lint has no findings, build succeeds. The existing WebGL chunk warning may remain.

## Self-Review

- All changes are scoped to responsive CSS.
- Primary task and language entries remain available.
- No UI state or adapter behavior changes are introduced.

