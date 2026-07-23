+# Result Action Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make result-card actions visibly transition through submitting, submitted, and retryable failure states without claiming that the underlying business operation has completed.

**Architecture:** Keep UI request state local to `MissionResultPanel`, reset it only when the active result task changes, and use a small pure state helper for deterministic state transitions. Preserve the existing fire-and-forget audit function while exposing a promise-returning audit adapter solely for result actions, so the panel can render an honest acknowledgement or retry state.

**Tech Stack:** React 19, TypeScript, Vitest, CSS custom properties.

## Global Constraints

- Do not change Agent Contract v1 schemas or task lifecycle semantics.
- `REQUESTED` means the current front-end adapter accepted the result-action request; it never means the remote business workflow completed.
- No new npm dependencies.
- Keep Local Mock and Remote adapter copy distinct and accessible through visible feedback.
- Do not use Git commands or create commits for this workspace task.

---

### Task 1: Define pure result-action state transitions

**Files:**
- Create: `src/ui/result-action-state.ts`
- Create: `tests/ui/result-action-state.test.ts`

**Interfaces:**
- Produces: `ResultActionStatus = 'idle' | 'requesting' | 'requested' | 'failed'`
- Produces: `getResultActionStatus(state: ReadonlyMap<string, ResultActionStatus>, actionId: string): ResultActionStatus`
- Produces: `setResultActionStatus(state: ReadonlyMap<string, ResultActionStatus>, actionId: string, status: ResultActionStatus): Map<string, ResultActionStatus>`

- [ ] **Step 1: Write the failing transition test**

```ts
import { describe, expect, it } from 'vitest'
import { getResultActionStatus, setResultActionStatus } from '../../src/ui/result-action-state'

describe('result action state', () => {
  it('defaults missing actions to idle and updates immutably', () => {
    const initial = new Map<string, 'idle' | 'requesting' | 'requested' | 'failed'>()
    const requesting = setResultActionStatus(initial, 'export', 'requesting')

    expect(getResultActionStatus(initial, 'export')).toBe('idle')
    expect(getResultActionStatus(requesting, 'export')).toBe('requesting')
    expect(initial).not.toBe(requesting)
  })
})
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm.cmd test -- tests/ui/result-action-state.test.ts`
Expected: FAIL because `src/ui/result-action-state.ts` does not exist.

- [ ] **Step 3: Implement the state helper**

```ts
export type ResultActionStatus = 'idle' | 'requesting' | 'requested' | 'failed'

export function getResultActionStatus(state: ReadonlyMap<string, ResultActionStatus>, actionId: string): ResultActionStatus {
  return state.get(actionId) ?? 'idle'
}

export function setResultActionStatus(
  state: ReadonlyMap<string, ResultActionStatus>,
  actionId: string,
  status: ResultActionStatus,
): Map<string, ResultActionStatus> {
  const next = new Map(state)
  next.set(actionId, status)
  return next
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm.cmd test -- tests/ui/result-action-state.test.ts`
Expected: PASS with one test.

### Task 2: Add an awaitable audit adapter

**Files:**
- Modify: `src/hooks/useAgentSimulation.ts`

**Interfaces:**
- Consumes: `runtime.recordAudit(input): Promise<AuditRecord>`
- Produces: `recordAuditAsync(type: string, message: string, tone?: AuditTone): Promise<AuditRecord>`
- Preserves: `recordAudit(...): void` for existing non-blocking calls.

- [ ] **Step 1: Add the dedicated asynchronous adapter**

```ts
const recordAuditAsync = useCallback(
  (type: string, message: string, tone: import('../domain/agent-contract').AuditTone = 'info') =>
    runtime.recordAudit({ requestId: requestId(), type, message, tone, taskId: runtime.activeTask?.id }),
  [runtime],
)
```

- [ ] **Step 2: Return the adapter without changing existing callers**

```ts
return {
  // existing properties
  recordAudit,
  recordAuditAsync,
  // remaining existing properties
}
```

- [ ] **Step 3: Run the TypeScript build**

Run: `npm.cmd run build`
Expected: PASS; no existing `recordAudit` call becomes blocking.

### Task 3: Render request and retry states on result actions

**Files:**
- Modify: `src/components/layout/MissionResultPanel.tsx`
- Modify: `src/pages/NeuralNetPage.tsx`
- Modify: `src/styles/panels.css`

**Interfaces:**
- Consumes: `ResultActionStatus`, `getResultActionStatus`, and `setResultActionStatus`.
- Changes callback: `onAction?: (actionId: string, label: string) => Promise<void>`.
- Produces: result controls with labels `REQUESTING`, `REQUESTED`, and `RETRY ACTION`.

- [ ] **Step 1: Replace the completed-action set with status map state**

```ts
const [actionStates, setActionStates] = useState<Map<string, ResultActionStatus>>(() => new Map())
const [actionFeedback, setActionFeedback] = useState<string | null>(null)

useEffect(() => {
  setActionStates(new Map())
  setActionFeedback(null)
}, [snapshot?.id, snapshot?.result?.title])
```

- [ ] **Step 2: Await the action callback and render failure as retryable**

```ts
const requestAction = async (actionId: string, label: string) => {
  setActionStates((current) => setResultActionStatus(current, actionId, 'requesting'))
  setActionFeedback(null)

  try {
    await onAction?.(actionId, label)
    setActionStates((current) => setResultActionStatus(current, actionId, 'requested'))
  } catch {
    setActionStates((current) => setResultActionStatus(current, actionId, 'failed'))
    setActionFeedback(`${label.toUpperCase()} COULD NOT BE SUBMITTED. RETRY WHEN READY.`)
  }
}
```

- [ ] **Step 3: Use explicit per-status button labels and disabled rules**

```tsx
const status = getResultActionStatus(actionStates, action.id)
const label = status === 'requesting'
  ? 'REQUESTING'
  : status === 'requested'
    ? 'REQUESTED'
    : status === 'failed'
      ? 'RETRY ACTION'
      : action.label

<button
  className={`result-contract-action action-${action.tone ?? 'default'} is-${status}`}
  disabled={status === 'requesting' || status === 'requested'}
  onClick={() => { void requestAction(action.id, action.label) }}
>
  {label}
</button>
```

- [ ] **Step 4: Group multiple dynamic actions and add accessible feedback**

```tsx
<div className="result-actions">
  <div className="result-contract-actions">{/* mapped result actions */}</div>
  <button className="result-export" type="button">{/* existing export control */}</button>
  {actionFeedback && <p className="result-action-feedback" role="status">{actionFeedback}</p>}
</div>
```

- [ ] **Step 5: Make page-level adapter copy truthful**

```tsx
onAction={async (actionId, label) => {
  const message = transport === 'local-mock'
    ? `${label} (${actionId}) was accepted by the Local Mock adapter.`
    : `${label} (${actionId}) request was submitted to the active adapter.`
  await recordAuditAsync('RESULT ACTION REQUESTED', message, 'info')
}}
```

- [ ] **Step 6: Add visual states without changing the visual theme**

```css
.result-contract-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 8px; min-width: 0; }
.result-contract-action.is-requesting { color: var(--accent); }
.result-contract-action.is-requested { color: var(--success); border-color: color-mix(in srgb, var(--success) 62%, transparent); }
.result-contract-action.is-failed { color: var(--danger); border-color: color-mix(in srgb, var(--danger) 70%, transparent); }
.result-action-feedback { grid-column: 1 / -1; margin: 0; color: var(--danger); font: 8px/1.45 var(--font-console); letter-spacing: .06em; }
```

- [ ] **Step 7: Run complete verification**

Run: `npm.cmd test; npm.cmd run lint; npm.cmd run build`
Expected: all tests pass, lint exits with no findings, and Vite build completes. The existing lazy `webgl-runtime` chunk-size warning may remain.

## Self-Review

- Spec coverage: Task 1 provides stable UI state primitives; Task 2 provides promise semantics without changing existing callers; Task 3 supplies visible state, retry behavior, adapter-specific copy, layout support, and accessible feedback.
- Placeholder scan: no incomplete implementation placeholders are present.
- Type consistency: `ResultActionStatus`, `recordAuditAsync`, and the async `onAction` callback have matching signatures throughout.

