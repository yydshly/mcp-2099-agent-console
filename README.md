# MCP 2099 Agent Console

MCP 2099 is a cinematic React/WebGL console for operating a generic Agent
Platform. It is not tied to a fixed business domain: agent profiles, task input,
approval, queue, runtime events, results, and history are driven by the shared
Agent Platform contract.

The repository currently runs with a Local Mock adapter so the entire task flow
can be demonstrated without a backend. The same UI can later use the remote
adapter without changing page components.

## Quick start

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. The default transport is
`local-mock`.

## Useful commands

```bash
npm run build
npm run lint
npm test
npm run validate:contracts
```

Run these together before a release candidate or a backend integration change.

## Runtime modes

### Local demonstration

```env
VITE_AGENT_TRANSPORT=local-mock
```

### Remote Agent Platform

```env
VITE_AGENT_TRANSPORT=remote
VITE_AGENT_BASE_URL=https://agent-api.example.com
VITE_AGENT_TIMEOUT_MS=12000
```

Authentication, SSE constraints, required backend behavior, and the integration
sequence are documented in [docs/agent-runtime-integration.md](docs/agent-runtime-integration.md).

## Current frontend baseline

- Task dispatch, approval, pause/resume, cancellation, queue, result, history,
  export, and Local Mock scenario flows are available.
- Dark/light themes, responsive panels, WebGL quality modes, keyboard focus,
  and Chinese/English static UI copy are available.
- The frontend is intentionally frozen against speculative visual changes until
  a real business workflow, acceptance requirement, or production feedback
  makes a change concrete.

## Architecture and contracts

- API contract: [contracts/agent-platform/v1/openapi.json](contracts/agent-platform/v1/openapi.json)
- Frontend integration guide: [docs/agent-runtime-integration.md](docs/agent-runtime-integration.md)
- Deferred frontend work: [docs/FRONTEND_OPTIMIZATION_BACKLOG.md](docs/FRONTEND_OPTIMIZATION_BACKLOG.md)
- Deferred visual polish: [docs/optimization-backlog.md](docs/optimization-backlog.md)

Business-specific fields belong in Profile input and result schemas. The shared
runtime contract remains responsible for task lifecycle, events, approvals,
queue order, errors, and artifacts.

## Repository policy

Local snapshots in `backups/` are intentionally ignored by Git. Use Git history,
tags, and pull requests for repository history; keep temporary machine-local
backups outside committed source files.
