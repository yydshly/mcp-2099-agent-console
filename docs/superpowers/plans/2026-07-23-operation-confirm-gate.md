+# Operation Confirm Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace repeated second-click destructive actions with one accessible, retryable MCP-2099 confirmation gate.

**Architecture:** `NeuralNetPage` owns one pending operation and executes its asynchronous callback only after confirmation. `OperationConfirmGate` owns only submitting and error presentation; task and queue components emit clear intent through their existing callbacks.

**Tech Stack:** React 19, TypeScript, lucide-react, Vitest, CSS custom properties.

## Global Constraints

- No new dependencies or Agent Contract v1 schema changes.
- A confirmation gate does not mutate runtime state until the operator confirms.
- Failed adapter requests remain retryable and visible.
- Keep the existing console visual language and keyboard scope.
- Do not run Git commands or create commits.

---

### Task 1: Add the reusable confirmation component

**Files:**
- Create: `src/components/layout/OperationConfirmGate.tsx`
- Modify: `src/styles/panels.css`

**Interfaces:**
- Produces: `ConfirmOperation` with `title`, `message`, `confirmLabel`, and `execute(): Promise<void>`.
- Produces: `OperationConfirmGate({ operation, onDismiss, onComplete })`.

- [ ] **Step 1: Render no markup when operation is null**

```tsx
if (!operation) return null
```

- [ ] **Step 2: Render a modal gate with safe initial action**

```tsx
<section className="operation-confirm-gate" role="dialog" aria-modal="true" aria-labelledby="operation-confirm-title">
  <p className="operation-confirm-kicker">OPERATOR CONFIRMATION REQUIRED</p>
  <h2 id="operation-confirm-title">{operation.title}</h2>
  <p>{operation.message}</p>
  <div className="operation-confirm-actions">
    <button autoFocus type="button" onClick={onDismiss}>KEEP TASK</button>
    <button type="button" onClick={() => { void confirm() }}>{operation.confirmLabel}</button>
  </div>
</section>
```

- [ ] **Step 3: Await execute and keep failures retryable**

```ts
const confirm = async () => {
  setSubmitting(true)
  setError(null)
  try {
    await operation.execute()
    onComplete()
  } catch {
    setError('REQUEST FAILED. RETRY WHEN READY.')
  } finally {
    setSubmitting(false)
  }
}
```

### Task 2: Centralize runtime-bound danger operations

**Files:**
- Modify: `src/hooks/useAgentSimulation.ts`
- Modify: `src/pages/NeuralNetPage.tsx`

**Interfaces:**
- Changes: `cancelTask(): Promise<void>`.
- Produces: page state `pendingOperation: ConfirmOperation | null`.

- [ ] **Step 1: Return the runtime action promise from cancelTask**

```ts
const cancelTask = useCallback(() => {
  if (!runtime.activeTask) return Promise.resolve()
  return runtime.actOnTask(runtime.activeTask.id, { requestId: requestId(), action: 'cancel' })
}, [runtime])
```

- [ ] **Step 2: Open the confirmation gate for task cancellation**

```tsx
const requestTaskCancellation = () => {
  setPendingOperation({
    title: 'Cancel active mission?',
    message: 'The runtime will stop the current task. Completed stages remain in the mission archive.',
    confirmLabel: 'CONFIRM CANCEL',
    execute: async () => {
      await cancelTask()
      recordAudit('TASK CANCELLED', 'Operator cancelled the active mission.', 'danger')
    },
  })
}
```

- [ ] **Step 3: Open the confirmation gate for queue removal**

```tsx
const requestQueueRemoval = (task: TaskSnapshot) => {
  setPendingOperation({
    title: 'Remove queued mission?',
    message: `${task.profileId.replace(/-/g, ' ')} will be removed before launch.`,
    confirmLabel: 'REMOVE FROM QUEUE',
    execute: async () => {
      await actOnTask(task.id, { requestId: crypto.randomUUID(), action: 'cancel' })
      recordAudit('QUEUED TASK REMOVED', `${task.profileId.replace(/-/g, ' ')} removed before launch.`, 'warning')
    },
  })
}
```

- [ ] **Step 4: Render the gate and include it in the foreground layer**

```tsx
const foregroundLayerOpen = /* existing layers */ || Boolean(pendingOperation)

<OperationConfirmGate
  operation={pendingOperation}
  onDismiss={() => setPendingOperation(null)}
  onComplete={() => setPendingOperation(null)}
/>
```

### Task 3: Simplify panel emitters and verify

**Files:**
- Modify: `src/components/layout/AgentTaskPanel.tsx`
- Modify: `src/components/layout/MissionQueueDrawer.tsx`
- Test: `tests/ui/operation-confirmation.test.ts`

**Interfaces:**
- `AgentTaskPanel.onCancelTask` remains a callback but opens the page-level gate.
- `MissionQueueDrawer.onRemove` remains a callback but opens the page-level gate.

- [ ] **Step 1: Remove AgentTaskPanel second-click state**

```tsx
{presentation.canCancel && <button className="danger" type="button" onClick={onCancelTask}>CANCEL</button>}
```

- [ ] **Step 2: Remove MissionQueueDrawer per-row second-click state**

```tsx
<button className="queue-remove" type="button" onClick={() => onRemove(task.id)} aria-label={`Remove queued task ${index + 1}`}>
  <Trash2 size={13} />
</button>
```

- [ ] **Step 3: Test operation request labels**

```ts
it('keeps destructive operation labels explicit', () => {
  expect(operationConfirmLabels.cancel).toBe('CONFIRM CANCEL')
  expect(operationConfirmLabels.removeQueued).toBe('REMOVE FROM QUEUE')
})
```

- [ ] **Step 4: Run full verification**

Run: `npm.cmd test; npm.cmd run lint; npm.cmd run build`
Expected: all tests pass, lint has no findings, production build succeeds. The existing WebGL chunk-size warning may remain.

## Self-Review

- Scope is limited to cancel and queue removal.
- All destructive requests await the existing runtime adapter.
- Component, page, and caller types are consistent.
- No protocol or backend behavior changes are introduced.

