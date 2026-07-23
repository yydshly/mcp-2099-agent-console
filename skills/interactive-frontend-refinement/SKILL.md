---
name: interactive-frontend-refinement
description: Use when an agent must refine, build, or repair a runnable frontend from a visual reference, a product brief, or observed browser defects, with browser-verified visual and interaction completion.
---

# Interactive Frontend Refinement

Turn a frontend request into a staged, evidence-led delivery. The core rule is simple: advance one observable refinement at a time, and do not claim visual or interaction completion without the evidence required by the active stage.

## Route the request

| Entry mode | Use when | First action |
| --- | --- | --- |
| Reference-led | A visual reference, screenshot, mockup, or live visual target is supplied. | Extract the reference into the design contract. |
| Brief-led | The request defines outcomes but no visual target. | Establish the design contract before implementation. |
| Repair-led | An existing frontend has user-observable defects. | Capture the unedited browser baseline and preserve the existing system unless redesign is requested. |

## Execution contract

```text
Identify entry
→ produce design contract
→ identify current stage
→ gather browser evidence
→ record one refinement item
→ apply minimal intervention
→ check adjacent surfaces
→ evaluate stage exit
```

Load [the design contract](references/design-contract.md) at intake for every entry mode, and load [the workflow stages](references/workflow-stages.md) before selecting or exiting a stage. Load [visual calibration](references/visual-calibration.md) for visual decisions in Stages 2 and 3. Load [the browser refinement loop](references/browser-refinement-loop.md) whenever a runnable surface needs browser evidence, an interaction check, or a refinement decision. Load [the cross-surface matrix](references/cross-surface-matrix.md) for adjacent checks and for Stage 7 coverage. Load [delivery and handoff](references/delivery-handoff.md) when evaluating Stage 9, stopping work, or preparing a handoff.

## Hard gates

- **Runnable baseline:** Before broad polish or a completion claim, establish and preserve a runnable baseline when the environment permits it. If it cannot run, treat that as the highest-priority unresolved item.
- **Browser evidence:** When the page can run, gather real browser evidence for the active visual or interaction claim before declaring it complete. A blocked browser route requires an allowed alternative or a `blocked` ledger decision that retains the unverified handoff, never a readiness claim. Reserve `defer` for the non-blocking no-evidence condition defined in the browser refinement ledger.
- **Current-stage progress:** Name the current stage, its required evidence, and its exit condition. `continue` advances the highest-priority unresolved item in that stage, not unrelated feature work.
- **Stop or defer:** Stop and defer when there is no new evidence, acceptance criterion, performance data, or user-observable defect. Record what is unverified, why, and the next evidence needed; do not speculate.

## Scope guardrails

Keep the Skill focused on frontend execution shape. Do not introduce business workflows, Agent orchestration, backend protocols, or a fixed visual style unless the request independently requires them.

## Red flags

- Treating a chronological task list as a current stage with an exit condition.
- Declaring a runnable frontend visually or interactively complete after a failed or absent browser inspection.
- Adding broad polish or features before preserving a runnable baseline.
- Recording a repair without its observed issue, causal hypothesis, minimal intervention, and adjacent-surface check.
- Continuing with unrelated work when browser verification is the highest-priority unresolved item.
- Calling a result ready while known verification evidence is absent instead of explicitly deferring it.
