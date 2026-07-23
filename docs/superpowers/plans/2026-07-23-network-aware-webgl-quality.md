# Network-Aware WebGL Quality Implementation Plan

**Goal:** Let automatic scene quality conserve rendering resources on constrained connections.

**Architecture:** Extend the existing scene capability input with optional network hints, evaluate them only in `auto`, and pass browser connection data from the scene runtime.

### Task 1: Extend quality capability mapping

- Modify `src/domain/scene-quality.ts` and `tests/domain/scene-quality.test.ts`.

### Task 2: Supply browser connection hints

- Modify `src/components/scene/NeuralSceneRuntime.tsx`.

### Task 3: Verify

- Run tests, lint, and production build.
