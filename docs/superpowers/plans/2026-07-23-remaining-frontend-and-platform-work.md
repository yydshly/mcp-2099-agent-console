# Remaining Frontend and Platform Work Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the visible frontend quality work, complete the remaining Gateway-driven task surfaces, and leave a clean boundary for a real backend without regressing the current cinematic interface.

**Architecture:** Execute four reviewable workstreams in order: visible state acceptance, responsive/error experience, task-surface data migration, and maintainability/backend adapters. The WebGL scene remains presentation-only; TaskSnapshot, AgentEvent, QueueSnapshot, and Profile contracts remain the data authority.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Vitest 4, Three.js/R3F, Agent Platform Contract v1.

## Global Constraints

- Preserve the current dark visual direction and improved light theme.
- Do not introduce business-specific fields into generic task or UI contracts.
- Keep `MockAgentGateway` available until a real endpoint is configured.
- Every visible panel must have a close path, keyboard focus path, loading state, empty state, and failure state.
- Validate desktop widths 1920, 1366, 1024, 768, and mobile width 390.
- Do not increase the WebGL runtime unless a visual feature explicitly requires it.

---

## Current completion baseline

- Contract v1, JSON Schema, OpenAPI, validation script: complete.
- Profile-schema-driven New Task form: complete.
- Mock Gateway task creation, approval, execution events, pause, resume, cancel, result: complete.
- Dynamic AgentRun mission trace and generic TaskResult panel: complete.
- WebGL lazy loading, adaptive DPR, low-power mode, background pause, context recovery: complete.
- Queue protocol foundation: partial.
- Queue/history/audit page migration: incomplete.
- Multi-size visual acceptance and exception-state acceptance: incomplete.
- Theme CSS consolidation and real HTTP/SSE adapters: incomplete.

### Task 1: Complete visible task-state acceptance

**Files:**
- Modify: `src/domain/task-view-model.ts`
- Modify: `src/components/layout/MissionTimeline.tsx`
- Modify: `src/components/layout/MissionResultPanel.tsx`
- Modify: `src/components/layout/AgentTaskPanel.tsx`
- Modify: `src/components/layout/LeftInfoPanel.tsx`
- Modify: `src/components/layout/BottomStatusBar.tsx`
- Test: `tests/domain/task-view-model.test.ts`

**Interfaces:**
- Consumes: `TaskSnapshot`, `AgentRun[]`, `TaskResult`.
- Produces: one consistent visual mapping for idle, running, paused, waiting approval, completed, failed, and cancelled.

- [ ] Add state-matrix tests asserting label, tone, action availability, and result visibility for every task state.
- [ ] Replace remaining panel-local status decisions with values from `TaskViewModel`.
- [ ] Ensure completed child agents show green `OK`, active agents show `LIVE`, paused agents show `HOLD`, and completed tasks show `READY`.
- [ ] Ensure failed and cancelled states never show a successful result card.
- [ ] Run `npm.cmd test -- tests/domain/task-view-model.test.ts` and expect all state cases to pass.
- [ ] Run `npm.cmd run build` and expect a successful production build.

### Task 2: Add exception and recovery experience

**Files:**
- Modify: `src/domain/agent-contract.ts`
- Modify: `src/hooks/use-agent-task-runtime.ts`
- Modify: `src/components/layout/AgentTaskPanel.tsx`
- Modify: `src/components/layout/WorkspacePanel.tsx`
- Create: `src/components/layout/RuntimeNotice.tsx`
- Test: `tests/domain/task-reducer.test.ts`
- Test: `tests/services/mock-agent-gateway.test.ts`

**Interfaces:**
- Consumes: Gateway errors, connection state, sequence-gap recovery, failed task snapshots.
- Produces: visible retry, reconnecting, offline, permission-denied, timeout, and failed-task states.

- [ ] Add stable error codes `NETWORK_UNAVAILABLE`, `TIMEOUT`, `PERMISSION_DENIED`, and `TASK_FAILED` to the Gateway error boundary.
- [ ] Show a non-blocking runtime notice for reconnecting and offline states.
- [ ] Provide `RETRY CONNECTION` for transport failures and `RETRY TASK` only for retryable task failures.
- [ ] Preserve the last valid TaskSnapshot while reconnecting.
- [ ] Add reducer and Mock Gateway tests for failed, timeout, retry, and sequence-gap recovery.
- [ ] Run the targeted tests, then run the production build.

### Task 3: Finish responsive and theme acceptance

**Files:**
- Modify: `src/index.css`
- Modify: `src/pages/NeuralNetPage.tsx`
- Modify: `src/components/scene/NeuralSceneRuntime.tsx`

**Interfaces:**
- Consumes: viewport size, light/dark theme state, panel visibility.
- Produces: collision-free layout and readable controls at all target widths.

- [ ] At 1920 and 1366 widths, keep the core unobstructed while left status, right metrics, trace, and result panels are visible.
- [ ] At 1024 and 768 widths, collapse secondary telemetry before shrinking primary task controls.
- [ ] At 390 width, use one foreground drawer at a time and keep primary actions above the browser viewport edge.
- [ ] Validate light-theme contrast for every button, input, select, drawer, result, queue, approval, and history surface.
- [ ] Smooth the dark-to-light particle transition by interpolating material color, opacity, and field intensity rather than switching classes abruptly.
- [ ] Respect `prefers-reduced-motion` by disabling nonessential transition bursts.
- [ ] Perform browser screenshots at all target sizes and both themes before accepting the task.

### Task 4: Complete queue, history, and audit migration

**Files:**
- Modify: `contracts/agent-platform/v1/openapi.json`
- Modify: `contracts/agent-platform/v1/schemas/queue-snapshot.schema.json`
- Modify: `contracts/agent-platform/v1/schemas/queue-action.schema.json`
- Create: `contracts/agent-platform/v1/schemas/audit-record.schema.json`
- Modify: `src/services/agent-gateway.ts`
- Modify: `src/services/mock-agent-gateway.ts`
- Modify: `src/hooks/use-agent-task-runtime.ts`
- Modify: `src/pages/NeuralNetPage.tsx`
- Modify: `src/components/layout/MissionQueueDrawer.tsx`
- Modify: `src/components/layout/MissionHistoryDrawer.tsx`
- Modify: `src/components/layout/WorkspacePanel.tsx`
- Test: `tests/services/mock-agent-gateway.test.ts`

**Interfaces:**
- Consumes: `QueueSnapshot`, `QueueActionCommand`, `TaskSnapshot[]`, `AgentEvent[]`, `AuditRecord[]`.
- Produces: Gateway-owned queue ordering, queue hold/resume, task cancellation, history queries, and audit/event displays.

- [ ] Implement one-active-task Mock scheduling with queued automatic dispatch.
- [ ] Implement queue pause/resume and task reprioritization by task ID and queue position.
- [ ] Replace `NeuralNetPage.taskQueue` with QueueSnapshot-derived state.
- [ ] Replace browser-local mission history with Gateway task-history queries while retaining local data only as a migration fallback.
- [ ] Replace task log placeholders with ordered AgentEvent records and operator AuditRecord records.
- [ ] Add tests for queue ordering, hold/resume, cancellation, reprioritization, completion-to-next dispatch, and history filtering.
- [ ] Run contract validation, full tests, and the production build.

### Task 5: Consolidate styles and component boundaries

**Files:**
- Modify: `src/index.css`
- Create: `src/styles/tokens.css`
- Create: `src/styles/themes.css`
- Create: `src/styles/panels.css`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: existing visual values and component classes.
- Produces: centralized color, spacing, elevation, typography, focus, and theme tokens.

- [ ] Move repeated dark/light colors into semantic CSS variables.
- [ ] Merge duplicate late-stage overrides without changing computed styles.
- [ ] Centralize panel dimensions, close-button rules, focus rings, and disabled states.
- [ ] Keep page-specific responsive rules separate from theme rules.
- [ ] Compare before/after screenshots in dark and light themes at 1366 and 390 widths.
- [ ] Run the production build and compare generated CSS size.

### Task 6: Add real backend adapters without changing UI contracts

**Files:**
- Create: `src/services/http-agent-gateway.ts`
- Create: `src/services/sse-event-stream.ts`
- Create: `src/config/runtime-config.ts`
- Modify: `src/pages/NeuralNetPage.tsx`
- Test: `tests/services/http-agent-gateway.test.ts`
- Test: `tests/services/sse-event-stream.test.ts`

**Interfaces:**
- Consumes: Contract v1 HTTP endpoints and SSE AgentEvent stream.
- Produces: runtime-selectable `local-mock` and `remote` transports.

- [ ] Select the transport through an explicit runtime configuration value.
- [ ] Implement HTTP commands and queries with request cancellation and normalized Gateway errors.
- [ ] Implement SSE reconnect using the last received event sequence.
- [ ] Keep bearer-token acquisition outside UI components and outside persisted local task data.
- [ ] Display `LOCAL MOCK` or `REMOTE` visibly in the interface.
- [ ] Run adapter tests, full tests, contract validation, and the production build.

## Execution order and gates

1. Task 1 and Task 3 are the immediate frontend quality gate.
2. Task 2 follows because exception states depend on the accepted visual state model.
3. Task 4 completes the remaining platform-owned presentation surfaces.
4. Task 5 runs after visible behavior stabilizes to avoid repeatedly reorganizing CSS.
5. Task 6 starts only when a backend base URL, authentication mechanism, and SSE endpoint are available.

The project is frontend-ready for demonstration after Tasks 1-4. Production backend readiness additionally requires Task 6 and a backend implementation conforming to Contract v1.
