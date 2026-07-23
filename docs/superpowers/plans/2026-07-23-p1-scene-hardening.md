# P1 Scene Hardening Implementation Plan

**Goal:** Make existing quality controls cover all scene layers and make theme transitions directionally consistent.

**Architecture:** The existing performance profile remains the authority. Low-power flags flow from `NeuralSceneRuntime` to decorative components; the theme signal retains one blend path with symmetric scheduling.

### Task 1: Quality propagation

- Modify `DataFragments`, `BackgroundField`, `WireSphere`, and `NeuralSceneRuntime`.
- Reduce decorative counts and tessellation under `lowPower`.

### Task 2: Symmetric theme timing

- Modify `theme-transition`, its tests, and `NeuralNetPage` transition timers.

### Task 3: Verify

- Run tests, lint, build, and breakpoint inspection.
