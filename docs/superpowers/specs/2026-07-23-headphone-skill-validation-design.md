# Headphone Skill Validation Design

## Purpose

Validate whether `interactive-frontend-refinement` improves completion of a real, independent frontend delivery—not merely the quality of a written plan.

## Experiment

Create two sibling React/Vite applications beneath `skill-validation/` from the same user brief:

- `headphone-baseline/`: implement the brief without reading or invoking the skill.
- `headphone-with-skill/`: implement the brief while following `interactive-frontend-refinement` and its relevant references.

Both applications receive the same product requirement and are evaluated against the same independent acceptance rubric. The only intentional variable is access to the skill.

## Product brief

Deliver a high-end wireless headphone launch page with:

- an immersive first-screen product visual and three selectable colorways;
- a specification drawer;
- a comparison surface;
- a back-in-stock reminder form;
- light and dark themes;
- desktop, tablet, and mobile layouts;
- keyboard operation and a reduced-motion experience.

The hero may use a lightweight canvas treatment. If canvas is unavailable, the static product image and all user actions must remain usable.

## Architecture

Each sample is a self-contained Vite application with its own source, tests, and package manifest. It may resolve existing dependencies from the repository root `node_modules`, but must not import application code from `src/` or modify MCP 2099 configuration.

Each application owns:

- `src/main.tsx` for mounting;
- `src/App.tsx` for the page composition and state orchestration;
- focused components for the hero, specifications, comparison, and reminder flow;
- token-based CSS for themes and responsive rules;
- unit tests for pure form/state behavior.

## Acceptance rubric

An evaluator records evidence for each application at 1440px, 768px, and 375px.

1. The primary route loads and the first product action is visible without accidental outer scrolling.
2. Colorway selection updates the visible product treatment and selected state.
3. Specifications open and close through an explicit control; Escape closes the active overlay and focus returns to its trigger.
4. Comparison information is reachable and readable without covering the active close control.
5. The reminder form exposes idle, validation-error, submitting, failure, and success feedback.
6. All interactive surfaces remain legible in both themes, including disabled and temporary states.
7. Mobile layout has reachable actions and no overlapping fixed surfaces.
8. Keyboard navigation exposes visible focus and does not leave an open modal/drawer unexpectedly.
9. Reduced-motion disables nonessential hero motion; a canvas failure leaves a static, usable fallback.
10. Each sample reports actual build, lint, and test command results.

## Comparison and refinement

The final report will contain only observable evidence: screenshots, interaction outcomes, command output, rubric score, and specific behavior differences. A rule is added or changed in the skill only when a baseline failure is observed and the skill-guided version fixes it, or when the skill-guided version reveals a new rationalization or gap.

## Non-goals

- No real commerce backend, authentication, analytics, or payment flow.
- No external image assets or dependency installs.
- No modification of MCP 2099 source, configuration, contracts, or existing tests.
