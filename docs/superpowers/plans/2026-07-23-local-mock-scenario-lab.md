# Local Mock Scenario Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Local Mock-only Scenario Lab that loads deterministic task states for front-end acceptance without changing the real Agent Gateway contract.

**Architecture:** Scenario fixtures and reset behavior live behind an optional Local Mock capability, separate from the generic `AgentGateway`. The runtime hook safely detects that optional capability and refreshes the normal task, queue, audit, and event projections. `WorkspacePanel` renders the controls only in the `PROTOCOL` workspace when the active transport is `local-mock`.

**Tech Stack:** React 19, TypeScript, Vitest, Local Mock Agent Gateway, lucide-react.

## Global Constraints

- Scenario controls appear only when `transport === 'local-mock'`.
- `AgentGateway`, HTTP adapter, SSE adapter, and Contract v1 remain unchanged.
- Scenarios must use business-neutral input and the existing generic task state model.
- Existing task actions must keep their normal validity rules after a scenario loads.
- Do not create a git commit unless the user explicitly requests one.

---

### Task 1: Define deterministic Local Mock scenario fixtures

**Files:**

- Create: `src/services/local-mock-scenarios.ts`
- Create: `tests/services/local-mock-scenarios.test.ts`

**Interfaces:**

- Produces: `LocalMockScenario`, `localMockScenarioOptions`, and `createLocalMockScenarioState(scenario)`.
- Consumes: `TaskSnapshot`, `AgentEvent`, `AuditRecord`, and `QueueSnapshot` from `src/domain/agent-contract.ts`.

- [ ] **Step 1: Write failing fixture tests**

```ts
import { describe, expect, it } from 'vitest'
import { createLocalMockScenarioState, localMockScenarioOptions } from '../../src/services/local-mock-scenarios'

describe('local mock scenarios', () => {
  it.each(['queued', 'running', 'paused', 'waiting_approval', 'completed', 'failed', 'cancelled'] as const)('creates a deterministic %s fixture', (scenario) => {
    const state = createLocalMockScenarioState(scenario)
    expect(state.activeTask.status).toBe(scenario)
    expect(state.events.length).toBeGreaterThan(0)
    expect(state.auditRecords[0].type).toBe('SCENARIO LOADED')
  })

  it('keeps the queue scenario visible in queue state', () => {
    const state = createLocalMockScenarioState('queued')
    expect(state.queue.tasks).toHaveLength(1)
    expect(localMockScenarioOptions).toHaveLength(7)
  })
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm.cmd test -- --run tests/services/local-mock-scenarios.test.ts`

Expected: failure because `local-mock-scenarios.ts` does not exist.

- [ ] **Step 3: Implement business-neutral fixtures**

```ts
export type LocalMockScenario = 'queued' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'

export const localMockScenarioOptions = [
  { id: 'queued', label: 'QUEUED' },
  { id: 'running', label: 'RUNNING' },
  { id: 'paused', label: 'PAUSED' },
  { id: 'waiting_approval', label: 'APPROVAL' },
  { id: 'completed', label: 'COMPLETE' },
  { id: 'failed', label: 'FAILED' },
  { id: 'cancelled', label: 'CANCELLED' },
] as const

export function createLocalMockScenarioState(scenario: LocalMockScenario): LocalMockScenarioState {
  // Return a stable active task, ordered events, audit record, and queue snapshot for the requested state.
}
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm.cmd test -- --run tests/services/local-mock-scenarios.test.ts`

Expected: 8 assertions pass.

### Task 2: Add the optional Local Mock scenario capability

**Files:**

- Modify: `src/services/mock-agent-gateway.ts`
- Create: `src/services/local-mock-scenario-capability.ts`
- Modify: `tests/services/mock-agent-gateway.test.ts`

**Interfaces:**

- Consumes: `LocalMockScenario` and `LocalMockScenarioState` from `local-mock-scenarios.ts`.
- Produces: `LocalMockScenarioCapability` with `loadScenario(scenario): Promise<TaskSnapshot>`.
- The generic `AgentGateway` interface remains untouched.

- [ ] **Step 1: Write failing Gateway behavior test**

```ts
it('replaces Local Mock projections when a scenario is loaded', async () => {
  const gateway = new MockAgentGateway()
  const loaded = await gateway.loadScenario('failed')
  expect(loaded.status).toBe('failed')
  expect((await gateway.getQueue()).tasks).toEqual([])
  expect((await gateway.listTaskEvents(loaded.id)).at(-1)?.type).toBe('agent.failed')
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm.cmd test -- --run tests/services/mock-agent-gateway.test.ts`

Expected: failure because `loadScenario` does not exist.

- [ ] **Step 3: Implement the optional capability and Gateway reset**

```ts
export interface LocalMockScenarioCapability {
  loadScenario: (scenario: LocalMockScenario) => Promise<TaskSnapshot>
}

export function getLocalMockScenarioCapability(value: unknown): LocalMockScenarioCapability | null {
  return typeof value === 'object' && value !== null && 'loadScenario' in value && typeof value.loadScenario === 'function'
    ? value as LocalMockScenarioCapability
    : null
}
```

`MockAgentGateway.loadScenario` clears pending timers, replaces the in-memory task, queue, events, audit records, request index, and active sequence with fixture data, then publishes the fixture events in order. It returns a clone of the active fixture task.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm.cmd test -- --run tests/services/mock-agent-gateway.test.ts`

Expected: all Mock Gateway tests pass.

### Task 3: Refresh runtime projections through the optional capability

**Files:**

- Modify: `src/hooks/use-agent-task-runtime.ts`
- Modify: `src/hooks/useAgentSimulation.ts`
- Modify: `tests/hooks/use-agent-task-runtime.test.ts`

**Interfaces:**

- Consumes: `getLocalMockScenarioCapability(gateway)`.
- Produces: `loadScenario(scenario): Promise<void> | null` from `useAgentSimulation`.
- Uses `gateway.listTasks`, `gateway.getQueue`, `gateway.listAuditRecords`, and `gateway.listTaskEvents` after loading.

- [ ] **Step 1: Write failing runtime test**

```ts
it('refreshes active task, queue, audit, and events after a local scenario load', async () => {
  const { result } = renderHook(() => useAgentTaskRuntime({ gateway, eventStream: gateway.eventStream }))
  await waitFor(() => expect(result.current.connectionState).toBe('connected'))
  await act(async () => result.current.loadScenario?.('paused'))
  expect(result.current.activeTask?.status).toBe('paused')
  expect(result.current.queue.tasks).toEqual([])
  expect(result.current.auditRecords[0].type).toBe('SCENARIO LOADED')
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm.cmd test -- --run tests/hooks/use-agent-task-runtime.test.ts`

Expected: failure because the runtime does not expose `loadScenario`.

- [ ] **Step 3: Implement projection refresh**

```ts
const loadScenario = useCallback(async (scenario: LocalMockScenario) => {
  const capability = getLocalMockScenarioCapability(gateway)
  if (!capability) return
  const snapshot = await capability.loadScenario(scenario)
  projections.current.clear()
  const [tasks, queueSnapshot, auditSnapshot, events] = await Promise.all([
    gateway.listTasks(), gateway.getQueue(), gateway.listAuditRecords(), gateway.listTaskEvents(snapshot.id),
  ])
  tasks.forEach(replaceSnapshot)
  setQueue(queueSnapshot)
  setAuditRecords(auditSnapshot)
  setTaskEvents(events)
  setActiveTaskId(snapshot.id)
}, [gateway, replaceSnapshot])
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm.cmd test -- --run tests/hooks/use-agent-task-runtime.test.ts`

Expected: the runtime test passes and remote-style gateways expose no loader.

### Task 4: Render the Protocol Workspace Scenario Lab

**Files:**

- Modify: `src/components/layout/WorkspacePanel.tsx`
- Modify: `src/pages/NeuralNetPage.tsx`
- Modify: `src/styles/panels.css`
- Create: `tests/components/WorkspacePanel.test.tsx`

**Interfaces:**

- Consumes: `transport`, `loadScenario`, `localMockScenarioOptions`.
- Produces: a local-only `SCENARIO LAB` control card.

- [ ] **Step 1: Write failing panel tests**

```tsx
it('shows Scenario Lab only for Local Mock transport', () => {
  render(<WorkspacePanel view="protocol" transport="local-mock" onLoadScenario={vi.fn()} {...props} />)
  expect(screen.getByRole('heading', { name: 'SCENARIO LAB' })).toBeInTheDocument()

  rerender(<WorkspacePanel view="protocol" transport="remote" onLoadScenario={null} {...props} />)
  expect(screen.queryByRole('heading', { name: 'SCENARIO LAB' })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm.cmd test -- --run tests/components/WorkspacePanel.test.tsx`

Expected: failure because `onLoadScenario` and Scenario Lab markup do not exist.

- [ ] **Step 3: Implement a compact, accessible control card**

```tsx
{view === 'protocol' && transport === 'local-mock' && onLoadScenario && (
  <section className="scenario-lab" aria-labelledby="scenario-lab-title">
    <div><span id="scenario-lab-title">SCENARIO LAB</span><small>LOCAL UI ACCEPTANCE ONLY</small></div>
    <p>Load a deterministic runtime state without contacting a business service.</p>
    <div>{localMockScenarioOptions.map((scenario) => (
      <button type="button" key={scenario.id} onClick={() => void onLoadScenario(scenario.id)}>{scenario.label}</button>
    ))}</div>
  </section>
)}
```

Pass the loader from `NeuralNetPage` through `WorkspacePanel`, record `SCENARIO LOADED` in the existing audit stream, and disable buttons while a scenario load is pending.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run: `npm.cmd test -- --run tests/components/WorkspacePanel.test.tsx`

Expected: Local Mock renders seven scenario controls; remote renders none.

### Task 5: Complete regression and browser acceptance

**Files:**

- Modify: `docs/superpowers/specs/2026-07-23-local-mock-scenario-lab-design.md`

**Interfaces:**

- Consumes: all Scenario Lab behavior.
- Produces: recorded verification scope in the design document.

- [ ] **Step 1: Run automated regression**

Run: `npm.cmd test -- --run`

Expected: all tests pass.

- [ ] **Step 2: Run static and production checks**

Run: `npm.cmd run lint`

Expected: zero warnings.

Run: `npm.cmd run build`

Expected: TypeScript and Vite production build succeed; the existing Three.js chunk-size advisory may remain.

- [ ] **Step 3: Perform browser acceptance**

Check each scenario in the `PROTOCOL` workspace for dark and light themes. Confirm that `MISSION TRACE`, left status, task log, right telemetry, bottom status, queue, and history all agree. Confirm that the Scenario Lab is absent when `VITE_AGENT_TRANSPORT=remote`.

- [ ] **Step 4: Record completion criteria**

Append a concise verification note to the design document listing all seven accepted scenarios and the remote-hidden check.
