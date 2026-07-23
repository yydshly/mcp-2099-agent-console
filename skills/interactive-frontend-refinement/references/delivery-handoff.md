# Delivery and Handoff

## Product Readiness

Product readiness means the declared primary journey satisfies the agreed
design contract and its current-stage exit condition. The result must be
usable, intentional, and consistent at the affected surfaces; it is not
complete merely because the implementation looks plausible in source.

When the page can run, use real browser evidence before claiming visual or
interaction completion. Record the journey, states, Viewport coverage, and
any accepted boundaries or unsupported environments.

## Engineering Validation

Validate in proportion to the changed scope:

| Changed scope | Minimum validation |
| --- | --- |
| Single local visual adjustment | Matching local adjacent checks and browser evidence when runnable |
| Shared component, token, layout, or state change | Local checks plus affected entries from the full cross-surface matrix |
| Primary journey or multi-surface refinement | Full delivery matrix, including themes, Viewports, State transitions, Foreground behavior, Locale width, reduced motion, and capability fallback |
| High-cost visual or motion change | Applicable full matrix checks plus a Performance observation |

Run the repository's relevant automated checks when they exist and match the
changed scope. Treat a passing automated check as supporting evidence, not a
replacement for browser evidence for visual or interactive outcomes.

## Repository Hygiene

- Keep the change limited to the agreed scope and canonical files.
- Preserve existing conventions and avoid unrelated reformatting.
- Stage and commit only intentional delivery files.
- Document generated artifacts, migrations, environment assumptions, or manual
  setup when they are necessary to reproduce the result.
- Leave controller scratch files, external validation scenarios, plans, specs,
  and unrelated work untouched unless the task explicitly expands scope.

## Stop conditions

Stop active refinement when any of these conditions applies:

- The declared primary journey is complete.
- The current-stage exit condition is met.
- No new evidence or acceptance criterion exists.
- The next change cannot name a user-visible outcome.
- Expected benefit is lower than regression risk.

`Continue` means advance the highest-priority unresolved item in the current
stage. It does not authorize speculative expansion, a new business workflow,
Agent orchestration, backend protocol work, or a fixed visual style outside the
design contract.

## Deferred work

Defer work when it is speculative: there is no new evidence, acceptance
criterion, performance data, or user-observable defect. Every deferred item
must include a concrete trigger that would make it actionable.

| Deferred item | Required trigger |
| --- | --- |
| Possible visual polish | A reference mismatch, approved acceptance criterion, or user-observable defect |
| Possible performance work | Measured performance data or a reported user-visible slowdown |
| Additional state or workflow | New product requirement, journey evidence, or reproducible defect |
| New device, locale, or capability support | Declared support target, failing cross-surface check, or user report |

## Session handoff

End every active session with concise answers to these five questions:

1. What is the project and current stage?
2. What was completed?
3. What remains or was deliberately deferred?
4. What evidence and validation exist?
5. What should the next session do first?

The handoff should identify the next highest-priority unresolved item and its
user-visible outcome. If none exists, state that the stage is complete rather
than creating work to continue.
