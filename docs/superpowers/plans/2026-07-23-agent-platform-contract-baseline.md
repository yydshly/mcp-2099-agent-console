# Agent Platform Contract Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish executable, versioned, business-neutral Agent Platform v1 contracts that frontend Local Mock and future backend implementations can both validate against.

**Architecture:** Keep contracts outside UI and backend implementation folders. Use JSON Schema 2020-12 for domain payloads, OpenAPI 3.1 for REST commands and snapshots, and a JSON event catalog for SSE messages. A customer-refund profile is a fixture that proves extension behavior; no customer fields are permitted in common schemas.

**Tech Stack:** JSON Schema 2020-12, OpenAPI 3.1, Node.js ESM, Vitest 4, TypeScript 6, Vite 8.

## Global Constraints

- Public contracts live under `contracts/agent-platform/v1/` and use ASCII JSON.
- All command payloads require `requestId` for idempotency.
- All events require `id`, `sequence`, `taskId`, `occurredAt`, `type`, and `payload`.
- The platform task model must not define business-domain fields such as `orderId`, `ticketId`, or `leadId`.
- Customer refund is a fixture profile only; it must not be imported by generic UI or task state code.
- API namespace is `/v1`; breaking changes require a new contract directory.
- Do not add runtime dependencies for contract validation.

---

## File structure

```text
contracts/agent-platform/v1/
  openapi.json                       REST command and query contract
  schemas/
    task-request.schema.json         CreateTaskCommand validation
    task-action.schema.json          Approve, reject, cancel, retry validation
    task-snapshot.schema.json        TaskSnapshot validation
    agent-run.schema.json            Child-agent run validation
    agent-event.schema.json          Ordered SSE event validation
    task-result.schema.json          Result packet validation
    agent-profile.schema.json        Profile registration validation
  fixtures/
    customer-refund.profile.json     Extension fixture only
  README.md                          Contract use, versioning, and compatibility rules

scripts/
  validate-agent-contracts.mjs       Built-in Node structural validation

tests/contracts/
  agent-platform-contracts.test.ts   Contract invariant tests
```

### Task 1: Create the shared contract schemas

**Files:**
- Create: `contracts/agent-platform/v1/schemas/task-request.schema.json`
- Create: `contracts/agent-platform/v1/schemas/task-action.schema.json`
- Create: `contracts/agent-platform/v1/schemas/task-snapshot.schema.json`
- Create: `contracts/agent-platform/v1/schemas/agent-run.schema.json`
- Create: `contracts/agent-platform/v1/schemas/agent-event.schema.json`
- Create: `contracts/agent-platform/v1/schemas/task-result.schema.json`
- Create: `contracts/agent-platform/v1/schemas/agent-profile.schema.json`
- Test: `tests/contracts/agent-platform-contracts.test.ts`

**Interfaces:**
- Produces: JSON Schema documents with stable `$id` values under `https://mcp-2099.local/contracts/agent-platform/v1/`.
- Consumes: No application code or business-domain profile.

- [ ] **Step 1: Write failing contract invariant tests**

```ts
import { describe, expect, it } from 'vitest'
import agentEvent from '../../contracts/agent-platform/v1/schemas/agent-event.schema.json'
import taskRequest from '../../contracts/agent-platform/v1/schemas/task-request.schema.json'

describe('Agent Platform v1 contracts', () => {
  it('requires idempotency for task creation', () => {
    expect(taskRequest.required).toContain('requestId')
  })

  it('requires ordered event metadata', () => {
    expect(agentEvent.required).toEqual(expect.arrayContaining([
      'id', 'sequence', 'taskId', 'occurredAt', 'type', 'payload',
    ]))
  })
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: FAIL because contract JSON files do not exist.

- [ ] **Step 3: Create minimal business-neutral schemas**

Use this required shape in `task-request.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mcp-2099.local/contracts/agent-platform/v1/task-request.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["requestId", "profileId", "input"],
  "properties": {
    "requestId": { "type": "string", "minLength": 1 },
    "profileId": { "type": "string", "minLength": 1 },
    "workflowId": { "type": "string", "minLength": 1 },
    "input": { "type": "object", "additionalProperties": true },
    "options": { "type": "object", "additionalProperties": false }
  }
}
```

Define every core schema with `additionalProperties: false` at the envelope level. Keep business-specific data only beneath `input`, `data`, or profile-owned JSON Schema references.

- [ ] **Step 4: Run the contract test**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: PASS with task creation and event envelope invariants satisfied.

- [ ] **Step 5: Commit the schema foundation**

```bash
git add contracts/agent-platform/v1/schemas tests/contracts/agent-platform-contracts.test.ts
git commit -m "feat: add agent platform v1 schemas"
```

### Task 2: Define REST and SSE transport contracts

**Files:**
- Create: `contracts/agent-platform/v1/openapi.json`
- Modify: `tests/contracts/agent-platform-contracts.test.ts`
- Modify: `contracts/agent-platform/v1/schemas/agent-event.schema.json`

**Interfaces:**
- Consumes: Schema `$id` values from Task 1.
- Produces: `/v1/profiles`, `/v1/tasks`, `/v1/tasks/{taskId}`, `/v1/tasks/{taskId}/actions`, `/v1/tasks/{taskId}/events`, and `/v1/tasks/{taskId}/logs` definitions.

- [ ] **Step 1: Add failing endpoint coverage test**

```ts
import openapi from '../../contracts/agent-platform/v1/openapi.json'

it('defines the v1 command, query, and event routes', () => {
  expect(Object.keys(openapi.paths)).toEqual(expect.arrayContaining([
    '/v1/profiles',
    '/v1/tasks',
    '/v1/tasks/{taskId}',
    '/v1/tasks/{taskId}/actions',
    '/v1/tasks/{taskId}/events',
    '/v1/tasks/{taskId}/logs',
  ]))
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: FAIL because `openapi.json` does not exist.

- [ ] **Step 3: Create the OpenAPI 3.1 document**

Define `POST /v1/tasks` with `CreateTaskCommand` request body and `TaskSnapshot` response. Define `POST /v1/tasks/{taskId}/actions` with `TaskActionCommand`. Define query endpoints as snapshot/profile responses. Define `GET /v1/tasks/{taskId}/events` as `text/event-stream` whose data payload references `AgentEvent`.

Include this security definition:

```json
"securitySchemes": {
  "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
}
```

Apply `bearerAuth` globally, while leaving authentication implementation outside this frontend repository.

- [ ] **Step 4: Run the transport coverage test**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: PASS with every v1 endpoint present.

- [ ] **Step 5: Commit transport contracts**

```bash
git add contracts/agent-platform/v1/openapi.json contracts/agent-platform/v1/schemas/agent-event.schema.json tests/contracts/agent-platform-contracts.test.ts
git commit -m "feat: define agent platform v1 transport"
```

### Task 3: Add a profile extension fixture and contract guidance

**Files:**
- Create: `contracts/agent-platform/v1/fixtures/customer-refund.profile.json`
- Create: `contracts/agent-platform/v1/README.md`
- Modify: `tests/contracts/agent-platform-contracts.test.ts`

**Interfaces:**
- Consumes: `agent-profile.schema.json` from Task 1.
- Produces: A non-core profile fixture demonstrating profile-owned input and result fields.

- [ ] **Step 1: Add failing fixture isolation test**

```ts
import customerRefundProfile from '../../contracts/agent-platform/v1/fixtures/customer-refund.profile.json'
import taskSnapshot from '../../contracts/agent-platform/v1/schemas/task-snapshot.schema.json'

it('keeps customer fields inside the profile fixture', () => {
  expect(customerRefundProfile.inputSchema.properties).toHaveProperty('orderId')
  expect(taskSnapshot.properties).not.toHaveProperty('orderId')
  expect(taskSnapshot.properties).not.toHaveProperty('customerId')
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: FAIL because the fixture profile does not exist.

- [ ] **Step 3: Create the fixture profile**

Use `id: "customer-refund"`, `version: "1.0.0"`, and a profile-owned input schema containing `customerId`, `orderId`, `request`, and `channel`. Declare workflow roles `context-retrieval`, `policy-validation`, `response-synthesis`, and `approval-coordination`.

Document that the fixture only proves extension compatibility. It must not be imported by `src/domain`, generic task UI, or the generic state reducer.

- [ ] **Step 4: Write compatibility guidance**

In `README.md`, document:

```text
Additive optional fields are compatible within v1.
Required field removal, type changes, and semantic changes require v2.
Events are deduplicated by id and ordered by sequence per task.
Clients fetch a fresh TaskSnapshot after a sequence gap or reconnect.
Profiles own business fields; core schemas never do.
```

- [ ] **Step 5: Run fixture isolation test**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: PASS, proving the fixture is isolated from the platform task model.

- [ ] **Step 6: Commit fixture and guidance**

```bash
git add contracts/agent-platform/v1/fixtures/customer-refund.profile.json contracts/agent-platform/v1/README.md tests/contracts/agent-platform-contracts.test.ts
git commit -m "docs: add profile fixture contract guidance"
```

### Task 4: Add dependency-free contract validation

**Files:**
- Create: `scripts/validate-agent-contracts.mjs`
- Modify: `package.json`
- Modify: `tests/contracts/agent-platform-contracts.test.ts`

**Interfaces:**
- Consumes: All contract JSON created by Tasks 1-3.
- Produces: `npm.cmd run validate:contracts`, which validates JSON parsing, required schema files, shared `$id` uniqueness, endpoint presence, and fixture isolation without adding dependencies.

- [ ] **Step 1: Add failing validation-command test**

```ts
import { execFileSync } from 'node:child_process'

it('validates the published contract package', () => {
  expect(() => execFileSync('node', ['scripts/validate-agent-contracts.mjs'], { stdio: 'pipe' })).not.toThrow()
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: FAIL because `scripts/validate-agent-contracts.mjs` does not exist.

- [ ] **Step 3: Implement the validator and package script**

The script must load every JSON document with `node:fs/promises`, fail when a required file is absent, assert that `$id` values are unique, assert required task/event fields, assert all v1 paths exist, and print exactly:

```text
Agent Platform v1 contracts are valid.
```

Add this script entry to `package.json`:

```json
"validate:contracts": "node scripts/validate-agent-contracts.mjs"
```

- [ ] **Step 4: Run validation and tests**

Run: `npm.cmd run validate:contracts`

Expected: `Agent Platform v1 contracts are valid.`

Run: `npm.cmd test -- tests/contracts/agent-platform-contracts.test.ts`

Expected: PASS.

- [ ] **Step 5: Run the existing production build**

Run: `npm.cmd run build`

Expected: PASS. Contract additions must not alter the existing Vite bundle behavior.

- [ ] **Step 6: Commit the validation package**

```bash
git add scripts/validate-agent-contracts.mjs package.json tests/contracts/agent-platform-contracts.test.ts
git commit -m "test: validate agent platform contracts"
```

## Phase 1 review gate

Before starting frontend migration, verify that:

- `npm.cmd run validate:contracts` passes.
- Contract tests pass.
- Frontend and backend owners approve the exact state machine, action semantics, and event ordering rules.
- The fixture profile is confirmed as a test module, not a platform default.

## Deferred plans

The following are intentionally excluded from this plan because they depend on the Phase 1 approved contract:

- Frontend migration from `Local Mock` to `AgentGateway`, `EventStream`, and event reducer.
- HTTP and SSE runtime implementations.
- Schema-driven New Task, Mission Trace, Result, Logs, Queue, and History components.
- Backend task service, orchestrator, persistence, profile registry, and tool adapters.
