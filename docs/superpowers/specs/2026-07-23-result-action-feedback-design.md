# Result Action Feedback Design

## Goal

Give operators clear, persistent feedback after clicking a result action while keeping the front-end demo honest about what has and has not been executed by a backend.

## Scope

`MissionResultPanel` owns a per-action UI state for the currently visible completed task:

- `idle`: action is available.
- `requesting`: the local UI is creating the action request; the button is disabled.
- `requested`: the action request has been handed to the active adapter; the button remains disabled and shows `REQUESTED`.
- `failed`: the request could not be handed to the adapter; the button shows `RETRY ACTION` and can be clicked again.

The action state resets only when the task result changes or the panel is closed and reopened for a different task.

## Architecture

The result panel receives an async `onAction(actionId, label)` callback. It owns visual state and awaits the callback. `NeuralNetPage` records the action request using the existing audit ledger. For `local-mock`, the audit write is the successful adapter handoff. For `remote`, the UI reports only that the request was submitted to the active adapter; it never presents a business outcome as confirmed.

## Boundaries

This feature does not change `TaskResult`, Contract v1 schemas, HTTP endpoints, SSE events, or task history. It is a front-end acknowledgement of action-request submission, not a representation of downstream business execution.

## Failure Handling

If the callback rejects, the panel sets the action to `failed`, restores the button, displays `RETRY ACTION`, and exposes a concise error status next to the action controls. Successful action requests remain locked for the lifetime of the result view to prevent accidental duplicate submissions.

## Verification

Unit tests cover idle, requesting, requested, failed, reset, and callback rejection behavior. Browser acceptance checks dark and light result cards for primary, secondary, and danger actions.
