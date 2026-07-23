# Agent Platform Contract v1 Design

## 1. Purpose

Transform the current MCP-2099 interface from a Local Mock visual prototype into a generic Agent Operations Console. The console must support multiple business domains without embedding customer-service, sales, or operations rules in frontend or platform core code.

The first real business module will be used only as a compatibility test fixture. Customer refund handling is the initial recommended fixture because it exercises multi-agent coordination, tool access, approval, result delivery, and audit records. It is not a built-in platform scenario.

## 2. Design principles

- Contract first: API and event contracts are approved before frontend or backend implementation.
- Platform core is business-neutral: the core must not contain domain fields such as order number, ticket number, or CRM lead ID.
- Profiles carry business variation: profiles, workflows, schemas, tools, and result renderers are registered extensions.
- Backend owns execution: the backend validates input, schedules agents, calls tools, enforces policy, and persists audit records.
- Frontend owns operation: the frontend gathers configured inputs, sends commands, displays task state, accepts human actions, and presents results.
- Events are authoritative: frontend state is derived from task snapshots plus ordered backend events.
- Versioned compatibility: all public contracts use an explicit `v1` namespace and additive changes are preferred.

## 3. Platform boundary

### 3.1 Frontend responsibilities

- Discover available profiles and their UI schemas.
- Render a profile-driven task form.
- Submit a generic task command.
- Subscribe to task and agent execution events.
- Display queue, task graph, logs, approval prompts, results, and history.
- Never decide agent routing, tool permissions, retry policy, or business outcomes.

### 3.2 Backend responsibilities

- Register profiles, workflows, tools, policies, and input/output schemas.
- Validate submitted task input against the selected profile schema.
- Create task records and enforce the shared task state machine.
- Schedule the orchestrator and child agents.
- Manage tool calls, credentials, authorization, retry, timeout, cancellation, and audit persistence.
- Publish ordered task events and return task snapshots.

### 3.3 Extension responsibilities

- Define business-specific input and result schemas.
- Define workflow steps and eligible agent roles.
- Provide adapters for business systems such as CRM, ticketing, ERP, or knowledge bases.
- Optionally register narrowly scoped frontend extensions for complex domain-specific input or result views.

## 4. Reference architecture

```text
Generic Operations Console
  -> Agent Gateway (HTTP commands and queries)
  -> Event Stream (SSE first, WebSocket optional)
  -> Agent Platform API
       -> Profile Registry
       -> Task Service and State Machine
       -> Orchestrator and Child Agents
       -> Policy, Approval, Audit, Retry
       -> Tool Adapter Registry
       -> Business Systems

Profile Package
  -> profile metadata
  -> input schema and UI schema
  -> workflow definition
  -> result schema and allowed actions
  -> tool adapters
```

## 5. Contract model

### 5.1 Core resources

| Resource | Meaning | Business-neutral requirement |
| --- | --- | --- |
| Profile | A registered capability package | Declares schemas, workflow, actions, and display metadata |
| Workflow | A versioned execution definition | Describes allowed agent roles and dependencies |
| Task | One submitted unit of work | Contains profile reference, generic input, status, and timestamps |
| AgentRun | One orchestrator or child-agent execution | Contains role, progress, dependency, status, and summary |
| Event | Ordered state change emitted by the backend | Has event ID, sequence, task ID, type, timestamp, and payload |
| Result | Final structured output | Contains summary, typed data, evidence, artifacts, and allowed actions |

### 5.2 Task lifecycle

```text
draft -> queued -> running -> paused -> running -> waiting_approval -> running -> completed
                                  |                    |
                                  v                    v
                              cancelled             failed

queued -> cancelled
running -> cancelled
paused -> cancelled
failed -> queued (only through an explicit retry command)
```

The backend is the sole authority for transitions. The frontend may request an action but must wait for a task snapshot or event before changing the displayed final state.

### 5.3 Command envelope

```ts
type CreateTaskCommand = {
  requestId: string
  profileId: string
  workflowId?: string
  input: Record<string, unknown>
  options?: {
    priority?: 'standard' | 'high' | 'urgent'
    approvalPolicy?: 'auto' | 'required'
  }
}

type TaskActionCommand = {
  requestId: string
  action: 'approve' | 'reject' | 'cancel' | 'retry'
  reason?: string
}
```

`requestId` is required for idempotency. A duplicate command with the same requester identity and `requestId` must return the original accepted outcome.

### 5.4 Snapshot envelope

```ts
type TaskSnapshot = {
  id: string
  profileId: string
  workflowId?: string
  status: 'queued' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'
  progress: number
  input: Record<string, unknown>
  agents: AgentRun[]
  result?: TaskResult
  createdAt: string
  updatedAt: string
  version: number
}
```

### 5.5 Event envelope

```ts
type AgentEvent = {
  id: string
  sequence: number
  taskId: string
  occurredAt: string
  type:
    | 'task.created'
    | 'task.status_changed'
    | 'agent.started'
    | 'agent.progressed'
    | 'agent.completed'
    | 'agent.failed'
    | 'approval.required'
    | 'result.ready'
  payload: Record<string, unknown>
}
```

Events must be replayable for a task. The frontend stores the latest sequence per task, ignores duplicates, and requests a fresh snapshot after reconnection or a sequence gap.

## 6. Transport standards

| Capability | Standard |
| --- | --- |
| Commands | REST `POST` |
| Queries | REST `GET` |
| Live events | SSE in v1 |
| Bidirectional live control | Optional WebSocket after v1 |
| HTTP definition | OpenAPI 3.1 |
| Input and result definitions | JSON Schema 2020-12 |
| Event definition | JSON Schema plus an AsyncAPI-compatible event catalog |
| Authentication | Bearer token supplied by platform identity layer |

Initial endpoints:

```text
GET  /v1/profiles
GET  /v1/profiles/{profileId}
POST /v1/tasks
GET  /v1/tasks
GET  /v1/tasks/{taskId}
POST /v1/tasks/{taskId}/actions
GET  /v1/tasks/{taskId}/events
GET  /v1/tasks/{taskId}/logs
```

## 7. Profile and workflow standard

A profile is configuration and registration metadata, not a frontend route or backend branch statement.

```ts
type AgentProfile = {
  id: string
  version: string
  name: string
  description: string
  inputSchema: JsonSchema
  uiSchema?: Record<string, unknown>
  resultSchema: JsonSchema
  workflow: {
    id: string
    version: string
    allowedRoles: string[]
  }
  metrics?: MetricDefinition[]
  actions?: ProfileAction[]
}
```

Profile examples are fixtures. A `customer-refund` profile may declare `customerId` and `orderId`; a `sales-lead` profile may declare `leadId` and `company`. Neither field belongs in the platform task model.

## 8. Frontend target architecture

```text
src/domain/
  contract types, state transitions, event normalization

src/services/
  AgentGateway interface
  MockAgentGateway
  HttpAgentGateway
  EventStream interface
  SseEventStream

src/state/
  task store and event reducer
  profile registry state
  connection state

src/components/
  common task lifecycle UI
  profile-driven form and result renderer
  optional profile extension slots

src/components/scene/
  visual state mapping only
```

The existing Local Mock remains during development, but it must implement the same `AgentGateway` and event contract as the future backend. Page components must not import simulation logic directly.

## 9. Backend target architecture

```text
API layer
  -> Task command and query services
  -> Profile registry
  -> Orchestrator
  -> Agent runtime and tool adapters
  -> Event publisher
  -> Task, result, and audit persistence
```

The backend maps `profileId` and optional `workflowId` to registered configuration and adapters. It does not rely on frontend-specific labels, animation states, or component names.

## 10. Consistency and release rules

- Contract files are the single source of truth.
- Frontend types and HTTP clients are generated or checked from OpenAPI and schemas.
- Backend responses and events are validated against the same schemas in CI.
- A profile cannot be published until its input and result schemas validate.
- Contract-breaking changes require a new major API version.
- Additive optional fields are allowed in v1.
- Every event must carry a stable event ID and monotonically increasing task sequence.

## 11. Delivery sequence

### Phase 1: Contract baseline

- Publish this design.
- Create executable OpenAPI, event schema, profile schema, and example fixture contracts.
- Review and approve the contract with frontend and backend owners.

### Phase 2: Frontend contract migration

- Introduce domain types and gateway interfaces.
- Move Local Mock behind the gateway.
- Replace direct simulation state with snapshot and event reducer state.
- Render profiles, forms, traces, metrics, and results from contracts.

### Phase 3: Backend platform and fixture integration

- Implement the task service, registry, orchestrator boundary, persistence, and SSE feed.
- Register a customer-refund fixture profile as an integration test only.
- Replace MockAgentGateway with HttpAgentGateway and SseEventStream.

## 12. Acceptance criteria

- A new profile can be registered without modifying common task UI code.
- A frontend task is created using only the generic command envelope.
- The frontend can display arbitrary child agent runs supplied by the backend.
- The frontend can recover from event reconnect by fetching a task snapshot.
- Task approval, cancellation, retry, logs, results, and history are driven by backend state.
- Customer refund fields exist only in the customer-refund fixture profile.
- The current WebGL scene maps generic task state only and contains no domain rules.

## 13. Non-goals for v1

- A universal visual builder for every possible workflow.
- Frontend-side agent orchestration.
- Frontend storage of model credentials or direct tool access.
- A full production customer-service implementation before the platform contract is validated.
