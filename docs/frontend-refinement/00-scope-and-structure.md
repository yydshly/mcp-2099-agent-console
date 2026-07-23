# Frontend Refinement Knowledge Base: Scope and Structure

## Purpose

Capture the real process used to turn an initial prompt and visual prototype
into a usable, validated frontend. Preserve decisions, debugging paths, and
iteration evidence before extracting reusable guidance.

This knowledge base is about frontend refinement. It does not define business
logic, Agent orchestration, API contracts, or backend implementation.

## Scope

Include:

- Prompt and reference interpretation.
- Visual baseline construction and browser-driven comparison.
- Layout, panel, overlay, responsive, theme, typography, and control polish.
- Interactive state feedback, keyboard behavior, accessibility, and locale UI.
- WebGL presentation, quality fallback, and non-WebGL recovery.
- Runtime debugging, encoding mistakes, validation, repository hygiene, and
  delivery documentation.

Exclude:

- Domain workflows such as customer support or sales operations.
- Agent scheduling semantics and backend business execution.
- Backend endpoint implementation.

## Artifact sequence

1. `01-iteration-evidence-log.md`
   - Chronological evidence log.
   - Each entry records observation, diagnosis, action, side effect, outcome,
     and reusable rule.

2. `02-refinement-playbook.md`
   - Condenses validated patterns from the evidence log.
   - Separates reusable frontend practice from project-specific choices.

3. `03-skill-design.md`
   - Defines the trigger, scope, resources, and validation model for a generic
     frontend-refinement Skill.
   - The provisional Agent Console Skill is not the final artifact.

## Evidence model

Use this template for each material iteration:

```text
Context and user signal
Observed behavior or visual evidence
Diagnosis and decision rule
Minimal intervention
Regression or secondary effect
Verified outcome
Reusable / project-specific classification
```

## Completion criteria

The evidence log must cover the complete path from prompt to validated Git
checkpoint, including failed attempts and corrective debugging. The playbook
must remain applicable to product pages, dashboards, workbenches, and other
interactive frontends without requiring Agent-specific logic.
