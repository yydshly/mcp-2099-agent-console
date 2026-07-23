# Interactive Frontend Refinement Skill Design

## 1. Objective

Distill the successful frontend refinement process demonstrated by MCP 2099 into a reusable Codex Skill that can guide future frontend work from an initial prompt to a polished, operable, browser-verified delivery.

The Skill must teach a process, not reproduce this project's Agent domain, red neural-core visual language, component names, or backend protocol.

The target capability is:

```text
Understand intent
→ establish a visual direction
→ create a runnable page
→ observe the real browser result
→ refine by layer
→ regress adjacent surfaces
→ close delivery
```

## 2. Problem Statement

The current `interactive-frontend-refinement` Skill provides sound principles and checklists, but it does not sufficiently control execution order.

Observed failure modes in other sessions include:

- Starting implementation without a verifiable design contract.
- Drifting into business architecture, backend protocols, or unrelated features.
- Treating a reference as a color sample instead of decomposing composition and hierarchy.
- Declaring success before opening the real page in a browser.
- Applying isolated CSS fixes without checking adjacent themes, viewports, states, or overlays.
- Interpreting “continue optimizing” as permission to invent new work.
- Lacking a clear boundary between a completed stage and optional refinement.

The revised Skill must convert the refinement method from advisory guidance into a stage-gated execution system.

## 3. Scope

The Skill applies to:

- Frontends created from a text prompt.
- Frontends created from screenshots, videos, URLs, or other visual references.
- Existing frontends that need systematic visual, interaction, responsive, accessibility, performance, or delivery refinement.
- Product pages, workspaces, dashboards, operations interfaces, cinematic pages, WebGL/Canvas experiences, and other interactive web surfaces.

The Skill does not define:

- Domain business workflows.
- Agent orchestration.
- Backend protocols or production API contracts.
- A fixed visual style.
- A fixed React, WebGL, or component-library template.

## 4. Dual Entry Model

### 4.1 Reference-led entry

Use when screenshots, videos, URLs, mockups, or an existing visual target are available.

Extract:

- Composition and focal hierarchy.
- Typography and density.
- Color and material system.
- Spatial depth and surface treatment.
- Motion character and timing.
- Information and operation placement.

The output is a gap-oriented design contract. A reference is a target for character, hierarchy, and interaction quality, not a pixel map.

### 4.2 Brief-led entry

Use when only a text request, product goal, or incomplete idea exists.

Establish:

- Target user and use context.
- Desired first impression.
- Primary visual, information, and operation layers.
- Typography, palette, spacing, material, and motion direction.
- Minimum user journey.
- Theme, device, performance, and accessibility boundaries.

If multiple design directions have materially different consequences, present two or three concise alternatives. If the brief already determines the direction, choose one distinctive direction and proceed.

### 4.3 Convergence

Both entry modes must produce the same design-contract shape before implementation:

```text
Visual constraints
Information constraints
Operation constraints
State constraints
Environment constraints
Observable completion criteria
```

## 5. Ten-Stage Delivery Pipeline

### Stage 0: Goal lock

Purpose: turn the input into a verifiable design contract.

Required output:

- Entry mode.
- Design direction.
- Primary user journey.
- Target environments.
- Observable completion criteria.

Exit condition: the expected user-visible result and minimum interaction loop can be described without relying on implementation details.

### Stage 1: Runnable baseline

Purpose: create or restore a real browser-accessible page.

Required output:

- Working entry route.
- Closed root viewport layout.
- Primary visual, information, and operation regions.
- One minimum interaction loop.

Exit condition: the user can open the real page and exercise its primary path.

### Stage 2: Primary visual calibration

Purpose: align first-impression quality before polishing secondary controls.

Inspect:

- Composition.
- Focal hierarchy.
- Typography.
- Color and material.
- Lighting and depth.
- Density.
- Motion.

Exit condition: the first screen communicates the intended character and hierarchy without compromising readability.

### Stage 3: Information and layout calibration

Purpose: make static and dynamic content coexist without clipping, overflow, or accidental competition.

Inspect:

- Root viewport closure.
- Navigation and footer boundaries.
- Primary content priority.
- Dynamic panel appearance.
- Worst-case content length.
- Desktop, narrow desktop, tablet, and mobile layout.

Exit condition: primary information remains visible or intentionally reachable after dynamic content appears.

### Stage 4: Control-system calibration

Purpose: make all controls visually coherent and operationally understandable.

Inspect:

- Buttons.
- Inputs.
- Selectors.
- Checkboxes and toggles.
- Hover, focus, active, disabled, loading, and error states.
- Labels and supporting text.

Exit condition: controls are readable, discoverable, keyboard reachable, and consistent with the visual system.

### Stage 5: Foreground interaction

Purpose: govern drawers, dialogs, popovers, menus, detail cards, and confirmation layers as one foreground system.

Inspect:

- Layer priority.
- Mutual exclusion.
- Visible close actions.
- Escape behavior.
- Focus entry, containment, and return.
- Click-away behavior.
- Narrow-screen workspace behavior.

Exit condition: users can open, operate, close, and return from every foreground surface without escaping through unrelated UI.

### Stage 6: State and feedback calibration

Purpose: make data, status, color, labels, and actions agree across the interface.

Inspect:

- Idle.
- Loading.
- Running.
- Paused.
- Success.
- Failure.
- Cancelled.
- Empty and unavailable.
- Async progress, success, and recovery feedback.

Exit condition: one presentation mapping determines labels, colors, icons, visibility, and allowed actions for each state.

### Stage 7: Cross-surface adaptation

Purpose: verify the same user journey across variation axes.

Inspect:

- Dark and light themes.
- Desktop, tablet, and mobile sizes.
- Locales.
- Keyboard navigation.
- Reduced motion.
- Long and empty content.

Exit condition: the primary journey remains legible and operable across declared targets.

### Stage 8: Performance and fallback

Purpose: productize expensive visual layers.

Inspect:

- Lazy loading.
- Render quality levels.
- Pixel-ratio and animation budgets.
- Capability detection.
- Reduced-motion and power preferences.
- WebGL, Canvas, media, or filter fallback.

Exit condition: loss or reduction of the enhancement layer does not make the product unusable.

### Stage 9: Engineering and delivery closure

Purpose: create a reproducible, maintainable checkpoint.

Required output:

- Relevant build, lint, test, and project-specific validation evidence.
- Accurate run instructions.
- Repository hygiene.
- Completed and deferred work.
- Trigger conditions for deferred items.
- Session handoff.

Exit condition: another developer or Codex session can run, understand, verify, and safely continue the project.

## 6. Browser Evidence Gate

When the page can run, actual browser observation is mandatory before visual or interaction completion can be claimed.

Accepted evidence:

- Screenshot.
- Recorded interaction.
- DOM or computed-style inspection.
- Reproduced keyboard path.
- Runtime or build error tied to the visible behavior.

When browser access is unavailable, implementation may continue only as an unverified baseline. The work must be labeled “visual verification pending.”

## 7. Refinement Ledger

Every refinement item must use this record:

```text
Current stage:
User goal:
Browser environment: viewport / theme / locale / state
Observed evidence:
Problem category:
Root cause:
Minimal intervention:
Adjacent regression surfaces:
Observed result:
Decision: pass / continue / defer / blocked
```

The ledger converts user feedback into reusable diagnostic logic and prevents unrelated changes from entering the same loop.

## 8. Issue Priority

Process issues in this order:

```text
Page cannot run
→ primary journey cannot complete
→ content invisible or control unreachable
→ state contradiction
→ clipping or overlap
→ theme, responsive, keyboard, or locale failure
→ performance and capability fallback
→ visual refinement
→ optional enhancement
```

When the user says “continue,” select the highest-priority unresolved item in the current stage. Do not invent a new feature.

## 9. Adjacent Regression Matrix

Choose relevant axes after each change:

| Change category | Required adjacent checks |
| --- | --- |
| Theme or color | opposite theme, disabled, hover, focus, overlay |
| Layout | nearby viewport, dynamic content, scroll, safe areas |
| Foreground layer | close, Escape, focus return, competing layers, mobile |
| State mapping | related labels, colors, actions, result and queue surfaces |
| Form value | displayed, validated, submitted, reset, default |
| Localization | status, empty, fallback, export, aria, control width |
| Expensive visual | low quality, reduced motion, failure fallback |

Full-matrix verification is reserved for delivery closure. Local changes use the smallest relevant adjacent set.

## 10. Stop Conditions

Stop active refinement when:

- The declared primary journey is complete.
- The current stage exit condition is met.
- No new screenshot, acceptance criterion, performance data, or user-observable defect exists.
- The next proposed change cannot name the user-visible outcome it improves.
- Expected benefit is lower than the regression risk.

Record optional work with a trigger instead of implementing it.

## 11. Skill Package Design

```text
interactive-frontend-refinement/
├─ SKILL.md
├─ agents/openai.yaml
└─ references/
   ├─ design-contract.md
   ├─ workflow-stages.md
   ├─ visual-calibration.md
   ├─ browser-refinement-loop.md
   ├─ cross-surface-matrix.md
   └─ delivery-handoff.md
```

Responsibilities:

- `SKILL.md`: trigger, entry routing, stage controller, hard gates, and reference routing.
- `design-contract.md`: reference-led and brief-led intake templates.
- `workflow-stages.md`: detailed stage inputs, actions, outputs, and exit conditions.
- `visual-calibration.md`: composition, hierarchy, typography, material, density, and motion diagnosis.
- `browser-refinement-loop.md`: evidence ledger, root-cause loop, priority, and one worked example.
- `cross-surface-matrix.md`: themes, viewports, states, overlays, locale, keyboard, accessibility, performance.
- `delivery-handoff.md`: validation, repository hygiene, stop rules, backlog triggers, and session handoff.

No fixed frontend template or project-specific case is bundled.

## 12. Validation Strategy

### 12.1 RED: baseline tests

Run independent tasks without the revised Skill:

1. Reference-led cinematic product page.
2. Brief-led high-density operations workspace.
3. Existing frontend with contrast, overlap, state, and mobile defects.

Record:

- Stage skipping.
- Business or feature drift.
- Missing browser evidence.
- Random patch ordering.
- Missing adjacent regression.
- Premature completion.
- Infinite optional refinement.

### 12.2 GREEN: revised-Skill tests

Run the same tasks with the revised Skill.

Required execution shape:

```text
Entry identification
→ design contract
→ current stage
→ browser evidence
→ refinement ledger
→ minimal intervention
→ adjacent regression
→ stage exit
→ next stage
```

### 12.3 Critical failures

Any of the following fails the test:

- Claims visual completion without browser evidence when the page can run.
- Performs visual polish before establishing a runnable baseline.
- Skips a required stage without an observable reason.
- Interprets “continue” as permission to invent features.
- Turns a case-specific business model or visual style into a generic rule.

### 12.4 Wording micro-tests

Test the following instructions against no-guidance controls with multiple fresh-context repetitions:

- Observe before changing.
- “Continue” advances the current stage.
- No evidence means defer and stop.

The wording passes only when responses converge on the required execution shape.

### 12.5 Forward test

Use a non-Agent, non-MCP frontend that includes:

- Autonomous visual design.
- One primary interaction loop.
- One foreground surface.
- Dark and light themes.
- Desktop and mobile layouts.
- Loading, success, and failure states.
- Browser observation and refinement evidence.
- Final handoff.

The forward test validates actual transfer, not resemblance to MCP 2099.

## 13. Success Criteria

The revised Skill is complete when:

- It passes structural Skill validation.
- Baseline failures are recorded.
- The same test scenarios follow the required shape with the Skill loaded.
- One non-Agent frontend completes the forward test.
- The Skill remains generic and does not prescribe a fixed visual style or business model.
- A future session can identify the current stage and next action without reading this project's conversation history.
