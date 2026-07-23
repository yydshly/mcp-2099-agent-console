# Agent Platform Frontend Contract Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move frontend task behavior behind a business-neutral contract runtime so the current Local Mock and future HTTP/SSE backend use the same task, agent, event, and result interfaces.

**Architecture:** Add a domain layer that mirrors `contracts/agent-platform/v1`, a transport-agnostic `AgentGateway`, an event-stream interface, and a pure task reducer. Retain the current visual UI and Local Mock behavior initially, but make the Mock an adapter rather than a page-owned simulation implementation.

**Tech Stack:** React 19, TypeScript 6, Vitest 4, existing Vite app, Agent Platform Contract v1.

## Global Constraints

- Contract files in `contracts/agent-platform/v1/` remain the source of truth.
- Generic frontend types must not contain customer, order, ticket, lead, CRM, or other business-specific fields.
- UI components must consume task snapshots and derived view state, not transport or timer state directly.
- Local Mock remains available as the default adapter until a backend URL and identity model are supplied.
- The new runtime must not alter WebGL rendering behavior or current visual theme behavior.
- No new external state-management or HTTP dependency is required.

---

## File structure

```text
src/domain/
  agent-contract.ts              Contract-aligned TypeScript types and enums
  task-reducer.ts                Pure snapshot and event transition functions

src/services/
  agent-gateway.ts               Transport-neutral interface and error type
  mock-agent-gateway.ts          Contract-conforming Local Mock adapter
  event-stream.ts                Subscription interface and in-memory stream

src/hooks/
  use-agent-task-runtime.ts      React lifecycle, snapshot, event, and action orchestration

tests/domain/
  task-reducer.test.ts           Ordered event, duplicate, gap, and state transition tests
tests/services/
  mock-agent-gateway.test.ts     Command, snapshot, and event contract tests
```

Existing files to migrate only after the runtime tests pass:

```text
src/domain/agent.ts
src/services/agentAdapter.ts
src/hooks/useAgentSimulation.ts
src/pages/NeuralNetPage.tsx
```

## Task 1: Add contract-aligned domain types

**Files:**
- Create: `src/domain/agent-contract.ts`
- Test: `tests/domain/task-reducer.test.ts`

**Interfaces:**
- Produces: `TaskStatus`, `AgentRunStatus`, `TaskSnapshot`, `AgentRun`, `AgentEvent`, `TaskResult`, `CreateTaskCommand`, and `TaskActionCommand`.
- Consumes: Contract v1 definitions only.

- [ ] Define status unions exactly as Contract v1.

```ts
export type TaskStatus = 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'
export type AgentEventType =
  | 'task.created'
  | 'task.status_changed'
  | 'agent.started'
  | 'agent.progressed'
  | 'agent.completed'
  | 'agent.failed'
  | 'approval.required'
  | 'result.ready'
```

- [ ] Keep `input`, `payload`, and `data` as `Record<string, unknown>` at platform boundaries.
- [ ] Add a `TaskEventGap` type containing `taskId`, `expectedSequence`, and `receivedSequence`.
- [ ] Write type-level fixture data in the reducer test that contains no business fields.
- [ ] Run: `npm.cmd test -- tests/domain/task-reducer.test.ts`

Expected: PASS after types compile and the first reducer test imports them.

## Task 2: Build a pure task event reducer

**Files:**
- Create: `src/domain/task-reducer.ts`
- Modify: `tests/domain/task-reducer.test.ts`

**Interfaces:**
- Consumes: `TaskSnapshot`, `AgentEvent`, and `TaskEventGap` from `agent-contract.ts`.
- Produces: `applyTaskEvent(snapshot, event)`, `getEventDisposition(snapshot, event)`, and `replaceTaskSnapshot(snapshot)`.

- [ ] Test a fresh event with sequence `1` changes the task snapshot.
- [ ] Test an event with the same event ID is ignored.
- [ ] Test a sequence greater than `lastSequence + 1` returns `gap` and does not mutate the snapshot.
- [ ] Test `approval.required` changes task status to `waiting_approval`.
- [ ] Test `result.ready` attaches a `TaskResult` and changes status to `completed`.
- [ ] Implement the reducer with no React imports, no timers, and no network calls.
- [ ] Run: `npm.cmd test -- tests/domain/task-reducer.test.ts`

Expected: PASS with all ordering and state-transition cases.

## Task 3: Define gateway and event-stream boundaries

**Files:**
- Create: `src/services/agent-gateway.ts`
- Create: `src/services/event-stream.ts`
- Test: `tests/services/mock-agent-gateway.test.ts`

**Interfaces:**

```ts
export interface AgentGateway {
  listProfiles(): Promise<AgentProfile[]>
  createTask(command: CreateTaskCommand): Promise<TaskSnapshot>
  getTask(taskId: string): Promise<TaskSnapshot>
  listTasks(): Promise<TaskSnapshot[]>
  actOnTask(taskId: string, command: TaskActionCommand): Promise<TaskSnapshot>
}

export interface EventStream {
  subscribe(taskId: string, onEvent: (event: AgentEvent) => void, onGap: (gap: TaskEventGap) => void): () => void
}
```

- [ ] Create `AgentGatewayError` with stable `code`, `message`, and optional `retryAfterMs` fields.
- [ ] Create `InMemoryEventStream` with subscribe, publish, and unsubscribe behavior.
- [ ] Test that unsubscribed listeners receive no further events.
- [ ] Run: `npm.cmd test -- tests/services/mock-agent-gateway.test.ts`

Expected: PASS with event stream lifecycle coverage.

## Task 4: Adapt Local Mock to Contract v1

**Files:**
- Create: `src/services/mock-agent-gateway.ts`
- Modify: `src/services/agentAdapter.ts`
- Modify: `tests/services/mock-agent-gateway.test.ts`

**Interfaces:**
- Consumes: `AgentGateway`, `EventStream`, domain types, and the customer-refund fixture only through a fixture loader.
- Produces: A default Local Mock that emits Contract v1 snapshots and events.

- [ ] Test `createTask` rejects a missing `requestId` with `AgentGatewayError('INVALID_COMMAND')`.
- [ ] Test `createTask` returns a `queued` snapshot with profile ID and generic input preserved.
- [ ] Test duplicate `requestId` returns the original task snapshot.
- [ ] Test `approve`, `reject`, `cancel`, and `retry` enforce allowed generic task transitions.
- [ ] Test emitted events have strictly increasing sequence values for one task.
- [ ] Implement fixture selection as data lookup; do not import business fields into generic task types.
- [ ] Run: `npm.cmd test -- tests/services/mock-agent-gateway.test.ts`

Expected: PASS with command idempotency, state transition, and event-order coverage.

## Task 5: Add a React task runtime hook

**Files:**
- Create: `src/hooks/use-agent-task-runtime.ts`
- Modify: `src/hooks/useAgentSimulation.ts`
- Test: `tests/hooks/use-agent-task-runtime.test.tsx`

**Interfaces:**
- Consumes: `AgentGateway`, `EventStream`, and pure reducer functions.
- Produces: `useAgentTaskRuntime({ gateway, eventStream })` with `createTask`, `actOnTask`, `refreshTask`, `activeTask`, `tasks`, `connectionState`, and `lastError`.

- [ ] Test task creation calls the injected gateway and stores its snapshot.
- [ ] Test a duplicate event does not produce another state change.
- [ ] Test a sequence gap triggers `gateway.getTask(taskId)` and replaces the stale snapshot.
- [ ] Test cleanup unsubscribes on task switch and component unmount.
- [ ] Keep `useAgentSimulation` as a compatibility wrapper only until UI migration is complete.
- [ ] Run: `npm.cmd test -- tests/hooks/use-agent-task-runtime.test.tsx`

Expected: PASS with lifecycle and reconnection behavior covered.

## Task 6: Prepare the UI migration boundary

**Files:**
- Modify: `src/pages/NeuralNetPage.tsx`
- Modify: `src/domain/agent.ts`
- Test: existing page or integration test location chosen after current component test conventions are inspected.

**Interfaces:**
- Consumes: `useAgentTaskRuntime` view data.
- Produces: A page that receives mission trace, queue, result, history, and logs from task snapshots rather than direct simulation phases.

- [ ] First map all current component props that depend on `useAgentSimulation`.
- [ ] Create an explicit view-model mapper from `TaskSnapshot` to existing UI props.
- [ ] Preserve current visual components and labels during the first migration.
- [ ] Display `LOCAL MOCK` while `MockAgentGateway` is active.
- [ ] Do not make this task until Tasks 1-5 are green and the view-model mapping has been reviewed separately.

## Phase 2 review gate

- `npm.cmd run validate:contracts` passes.
- New domain, service, and hook tests pass.
- Existing production build passes.
- Existing UI can run on `MockAgentGateway` without direct dependency on timer-driven simulation state.
- No customer-refund field appears in generic frontend domain or generic UI code.

## Deferred work

- HTTP implementation of `AgentGateway`.
- SSE implementation of `EventStream`.
- Schema-driven task form and result renderer.
- Conversion of every page panel to contract-derived view models.
- Backend service and business-system adapters.
