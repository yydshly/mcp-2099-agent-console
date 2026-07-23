# Localized Runtime State Implementation Plan

**Goal:** Localize front-end-owned runtime states and local scenario labels without changing backend data.

**Architecture:** A pure UI mapping module returns locale keys for display states, legacy phases, and local scenario IDs. Components resolve them through the locale provider.

### Task 1: State mapping and tests

- Create `src/ui/runtime-state-presentation.ts`.
- Create `tests/ui/runtime-state-presentation.test.ts`.

### Task 2: UI integration

- Modify `LeftInfoPanel`, `AgentTaskPanel`, `WorkspacePanel`, and `locale-core`.
- Keep trace codes and backend business copy unchanged.

### Task 3: Verification

- Run targeted and full tests, lint, and production build.
