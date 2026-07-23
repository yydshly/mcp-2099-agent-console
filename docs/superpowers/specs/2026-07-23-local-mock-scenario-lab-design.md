# Local Mock Scenario Lab Design

## Goal

Provide a front-end-only way to inspect every agent task state without a backend. The lab exists solely to validate the interface and must not appear when the application uses a remote adapter.

## Scope

The `PROTOCOL` workspace displays a `SCENARIO LAB` section only when `transport` is `local-mock`. Operators can load a deterministic Local Mock snapshot for:

- queued
- running
- paused
- waiting approval
- completed
- failed
- cancelled

Each scenario supplies one selected task, task agents, queue state, ordered task events, and an audit record. It must drive the existing UI through the normal Gateway and runtime projection flow rather than adding parallel page-level state.

## Architecture

`MockAgentGateway` gains a local-only scenario loading capability. The capability is exposed only by the Local Mock runtime adapter and is intentionally absent from the generic `AgentGateway` contract used by real HTTP and SSE adapters.

The runtime hook detects whether the active adapter exposes the optional scenario capability and returns a safe `loadScenario` callback only in Local Mock mode. `NeuralNetPage` passes that callback into `WorkspacePanel`. The panel renders the lab inside the `PROTOCOL` workspace and hides it for remote transport.

## Interaction

Selecting a scenario replaces the in-memory Local Mock data set with a deterministic fixture. The selected task becomes active, the Protocol panel stays open, and a concise status line confirms the loaded state. Existing actions continue to work where they are valid: paused tasks can resume or cancel, approval tasks can approve or decline, terminal tasks can retry, and queued tasks remain manageable through Mission Queue.

## Boundaries

The lab is not part of Contract v1 and is never sent to a backend. It must not add business-specific fields or profile-specific conditions to shared UI components. A remote adapter must receive no scenario UI, no scenario command, and no hidden request.

## Failure Handling

The UI disables scenario loading while a fixture is being applied. If loading fails, the existing runtime error banner reports the problem and the current valid task snapshot remains visible.

## Verification

Unit tests cover each scenario fixture, task state presentation, queue visibility, and optional capability detection. Browser acceptance covers all seven scenarios in dark and light themes at desktop and mobile widths.

## Verification Record

Completed on 2026-07-23:

- Local Mock Scenario Lab rendered in the `PROTOCOL` workspace with queued, running, paused, approval, complete, failed, and cancelled controls.
- Each local scenario loaded a unique active-state confirmation and refreshed the task projection.
- The failed scenario showed `MISSION FAILED`, failed telemetry, a `FAILED` mission trace, and the failed agent step together.
- A remote-adapter browser instance rendered the remote Protocol workspace without the Scenario Lab, including when its backend connection was unavailable.
