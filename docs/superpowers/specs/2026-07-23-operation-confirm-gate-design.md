+# Operation Confirm Gate Design

## Goal

Prevent accidental destructive front-end operations while preserving the existing MCP-2099 console visual language and agent runtime boundaries.

## Scope

This work covers two existing actions:

- Cancel the active task from the task stream panel.
- Remove a queued task from the mission queue drawer.

It does not change Agent Contract v1, task lifecycle behavior, backend APIs, or business-specific profiles.

## Options Considered

### Browser confirmation

Use `window.confirm()`.

- Fast but inconsistent with the application visual system.
- Cannot provide contextual copy, request feedback, or accessible focus behavior.

### Per-panel confirmation logic

Embed distinct confirmation UI and state in each caller.

- Works for the immediate actions.
- Duplicates behavior and creates inconsistent keyboard handling.

### Shared confirmation gate

Render one application-level `OperationConfirmGate` and pass an explicit confirmation request from the task or queue surface.

- Preserves one visual and accessibility implementation.
- Keeps panels responsible only for requesting an operation.
- Lets the page execute the existing adapter action after operator confirmation.

This is the selected approach.

## Architecture

`NeuralNetPage` owns a nullable `pendingOperation` request. A request includes the operation id, title, context message, destructive tone, and an async `execute` callback. The existing cancel and queue-removal handlers open this request instead of directly invoking their adapter action.

`OperationConfirmGate` is a presentational modal that receives the request plus confirm and dismiss callbacks. It traps the existing foreground focus scope, supports `Escape`, and displays submitting state while the async callback runs. A callback resolution closes the gate. A callback rejection preserves the gate and shows a retryable error message.

The runtime remains the sole authority that changes task or queue state. The gate only controls when a front-end request is sent.

## Interaction Contract

- The trigger opens the gate without changing task or queue state.
- `Escape`, `CLOSE`, and `KEEP TASK` dismiss the gate without invoking an adapter.
- `CONFIRM CANCEL` and `REMOVE FROM QUEUE` disable while their request is in flight.
- A resolved adapter request closes the gate and emits the existing audit record.
- A rejected adapter request keeps the gate open, displays `REQUEST FAILED. RETRY WHEN READY.`, and restores the confirm control.
- The gate is part of `foregroundLayerOpen`, so background overlays remain suppressed.

## Accessibility

- The gate uses `role="dialog"`, `aria-modal="true"`, and an explicit accessible label.
- Initial focus lands on the non-destructive dismissal action.
- Keyboard navigation remains scoped to the gate by the existing page focus handler.
- The failure copy uses `role="status"`.

## Testing

- Add a pure test for operation-request construction defaults and destructive operation labels.
- Run the full Vitest suite, lint, and production build.
- Manually verify that cancel and queue removal make no state change before confirmation.

## Constraints

- No new dependencies.
- No contract schema changes.
- Keep all operator copy in the existing concise console style.
- Do not use Git commands, commits, branches, or worktree changes for this task.

