+# Bilingual Interface Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate all remaining front-end-owned MCP-2099 panel structure into English and Simplified Chinese.

**Architecture:** Extend the existing typed locale dictionary and consume `useLocaleText()` in display-only components. Dynamic task inputs, event messages, profile metadata, IDs, and adapter data remain untouched.

**Tech Stack:** React 19, TypeScript, Vitest.

## Global Constraints

- No Agent Contract or runtime behavior changes.
- No dependencies.
- Translate static UI only; preserve runtime payloads and machine identifiers.
- Do not run Git commands or create commits.

---

### Task 1: Extend typed locale coverage

**Files:**
- Modify: `src/ui/locale-core.ts`
- Modify: `tests/ui/locale.test.ts`

**Interfaces:**
- Produces workspace, timeline, result, history, telemetry, command, and approval dictionary keys.

- [ ] Add matching English and Chinese keys for each remaining static panel label.
- [ ] Add lookup assertions for workspace and result text.
- [ ] Run: `npm.cmd test -- tests/ui/locale.test.ts`.
Expected: locale dictionary test passes.

### Task 2: Translate workspace and mission surfaces

**Files:**
- Modify: `src/components/layout/WorkspacePanel.tsx`
- Modify: `src/components/layout/MissionTimeline.tsx`
- Modify: `src/components/layout/MissionResultPanel.tsx`
- Modify: `src/components/layout/MissionHistoryDrawer.tsx`

**Interfaces:**
- Consumes: `useLocaleText()`.
- Preserves: task objective, profile IDs, event messages, artifact names, and raw result fields.

- [ ] Replace static headings, buttons, empty states, and known state labels with dictionary lookups.
- [ ] Leave protocol names, IDs, and dynamic values unchanged.

### Task 3: Translate telemetry, command, and approval surfaces

**Files:**
- Modify: `src/components/layout/LeftInfoPanel.tsx`
- Modify: `src/components/layout/RightMetricsPanel.tsx`
- Modify: `src/components/layout/ApprovalGate.tsx`
- Modify: `src/ui/CommandPalette.tsx`
- Modify: `src/pages/NeuralNetPage.tsx`

**Interfaces:**
- Consumes: `useLocaleText()`.
- Changes: Command action labels and descriptions are constructed with the active locale in `NeuralNetPage`.

- [ ] Translate panel-owned labels and command palette chrome.
- [ ] Build command definitions from the active locale without changing command IDs or handlers.
- [ ] Run: `npm.cmd test; npm.cmd run lint; npm.cmd run build`.
Expected: tests pass, lint has no findings, and build succeeds; existing WebGL chunk warning may remain.

## Self-Review

- All scoped panels have a dictionary migration task.
- Dynamic business payloads are explicitly excluded.
- The plan reuses existing locale context and does not affect runtime behavior.

