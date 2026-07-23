# Runtime Recovery Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present stable, localized recovery guidance for Agent Gateway failures while retaining the last valid task snapshot.

**Architecture:** A pure UI-boundary mapper converts normalized gateway errors into translation keys. The existing runtime banner consumes the mapper and remains the sole application-level recovery surface; runtime state ownership remains unchanged.

**Tech Stack:** React 19, TypeScript, Vitest, existing locale provider.

## Global Constraints

- Do not expose raw gateway messages as the primary operator-facing failure explanation.
- Preserve active task, queue, audit, and result snapshots during failures.
- Keep task retry in the task panel and connection recovery in the runtime banner.

---

### Task 1: Normalize runtime failure presentation

**Files:**
- Create: `src/ui/runtime-error-presentation.ts`
- Create: `tests/ui/runtime-error-presentation.test.ts`

**Interfaces:**
- Produces: `getRuntimeErrorPresentation(error: Error | null): RuntimeErrorPresentation`
- Consumes: `AgentGatewayError.code`

- [ ] Map timeout, network, permission, task-failed, and unknown errors to title/detail translation keys.
- [ ] Test each map result without rendering React.

### Task 2: Render normalized recovery guidance

**Files:**
- Modify: `src/components/layout/RuntimeStatusBanner.tsx`
- Modify: `src/ui/locale-core.ts`

**Interfaces:**
- Consumes: `getRuntimeErrorPresentation` and locale translation keys.

- [ ] Render localized normalized details for offline and interrupted states.
- [ ] Localize the dismiss action aria label.
- [ ] Keep retry disabled only while browser connectivity is unavailable.

### Task 3: Verify the front-end contract

**Files:**
- Test: `tests/ui/runtime-error-presentation.test.ts`

- [ ] Run targeted UI tests, full test suite, lint, and production build.
