# Runtime recovery experience

## Goal

Make runtime failures understandable and recoverable without discarding the last valid agent task snapshot.

## Scope

- Translate gateway failure codes into stable Chinese and English operator messages.
- Keep `RuntimeStatusBanner` as the single application-level recovery surface.
- Preserve task, mission trace, queue, and result data during connection failures.
- Keep task retry in the task panel; use the runtime banner only for connection and snapshot recovery.

## Error presentation

`TIMEOUT`, `NETWORK_UNAVAILABLE`, `PERMISSION_DENIED`, `TASK_FAILED`, and unknown availability failures map to locale keys. The UI must not render raw gateway error messages as the primary operator explanation.

The banner communicates one of three states:

- Recovering: refresh is in progress and no duplicate action is available.
- Offline: the last valid snapshot remains visible; recovery waits for browser connectivity.
- Interrupted: a retry action refreshes task, profile, queue, and audit snapshots.

Dismiss only hides the transient failure message. It does not clear task data or change the active task state.

## Boundaries

The runtime hook owns failure normalization and recovery state. `RuntimeStatusBanner` only renders normalized presentation data and delegates retry or dismissal callbacks. Task-specific retries remain in `AgentTaskPanel`.

## Verification

Unit tests cover error-code normalization and localized banner content for timeout, network, permission, and generic failure paths. Existing tests, lint, and production build must remain green.
