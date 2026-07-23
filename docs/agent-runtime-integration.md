# Agent Runtime Integration

The frontend consumes Agent Platform Contract v1 through `AgentGateway` and `EventStream`. Business Profiles remain server-provided configuration; customer support, sales, operations, and analysis are examples rather than platform branches.

## Runtime selection

The default remains a self-contained local demonstration:

```env
VITE_AGENT_TRANSPORT=local-mock
```

Select a Contract v1 backend without changing UI components:

```env
VITE_AGENT_TRANSPORT=remote
VITE_AGENT_BASE_URL=https://agent-api.example.com
VITE_AGENT_TIMEOUT_MS=12000
```

The remote runtime uses:

- `HttpAgentGateway` for Profile, Task, Queue, History and Audit commands/queries.
- `SseEventStream` for ordered `AgentEvent` updates and sequence-gap recovery.
- The same `TaskSnapshot`, `QueueSnapshot`, `AuditRecord` and Profile-driven UI used by Local Mock.

## Authentication boundary

Bearer tokens are acquired outside React components and are never persisted in task data or browser storage:

```ts
import { configureAgentAccessTokenProvider } from './config/auth-provider'

configureAgentAccessTokenProvider(async () => authSession.getAccessToken())
```

Configure the provider before rendering the application. If no provider is configured, HTTP requests omit the Authorization header.

Native `EventSource` does not support custom Authorization headers. Deploy SSE on the same authenticated origin with an `HttpOnly`, `Secure`, `SameSite` cookie, or route it through a backend-for-frontend proxy. Do not put bearer tokens in SSE query parameters.

## Required backend behavior

- Honor `requestId` idempotency for task, queue and audit commands.
- Allow one active task per configured execution lane and return queue order from `/v1/queue`.
- Emit monotonically increasing event sequences per task.
- Support snapshot recovery when the frontend reports or detects a sequence gap.
- Keep business fields inside Profile input/result schemas, not generic Task fields.
- Return stable permission, timeout, invalid-action and unavailable errors.

## Integration sequence

1. Implement the endpoints in `contracts/agent-platform/v1/openapi.json`.
2. Serve Profile definitions from `/v1/profiles`.
3. Configure cookie or bearer authentication.
4. Enable `remote` transport in a non-production environment.
5. Verify task creation, approval, queue ordering, pause/resume, cancellation, result, history and audit.
6. Verify SSE reconnect and sequence-gap snapshot recovery.
