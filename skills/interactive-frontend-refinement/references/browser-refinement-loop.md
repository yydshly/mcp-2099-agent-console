# Browser Refinement Loop

Use this reference when a runnable frontend needs visual or interaction refinement. A design contract is required before implementation; browser evidence is required before claiming visual or interaction completion when the page can run.

## Accepted evidence

Record at least one evidence type appropriate to the active claim:

- Screenshot.
- Recorded interaction.
- DOM or computed-style inspection.
- Reproduced keyboard path.
- Runtime or build error tied to visible behavior.

Source evidence from the real browser environment whenever the page can run. A code reading, implementation intention, or a successful build alone is not browser evidence.

## Refinement ledger

Create one ledger entry for each active refinement item. Keep the fields linked so another agent can reproduce the decision.

```text
Current stage:
User goal:
Browser environment:
Observed evidence:
Problem category:
Root cause:
Minimal intervention:
Adjacent regression surfaces:
Observed result:
Decision:
```

Name the current stage and its exit condition. The decision vocabulary is exactly `pass`, `continue`, `defer`, or `blocked`. Use `pass` only when the active stage exit is evidenced. Use `continue` for a named unresolved item in the current stage. Use `defer` only for non-blocking work that lacks an acceptance criterion, new evidence, performance data, or a user-observable defect; record the missing evidence and next evidence source. Use `blocked` when a reproducible environment or browser route prevents required browser evidence; record the failed route or environment condition and keep visual or interaction verification pending.

## Resolve in priority order

```text
Page cannot run
-> primary journey cannot complete
-> content invisible or control unreachable
-> state contradiction
-> clipping or overlap
-> theme, responsive, keyboard, or locale failure
-> performance and capability fallback
-> visual refinement
-> optional enhancement
```

Within the current stage, use observed severity and user impact to order items at the same priority. Do not add unrelated features while a higher-priority item remains unresolved.

## Five-step minimal-fix loop

1. Capture a reproducible browser observation and classify it using the priority order.
2. State the causal hypothesis and the narrowest intervention that can disprove or correct it.
3. Apply only that intervention; preserve the design contract and existing working behavior.
4. Reproduce the original path and inspect the declared adjacent regression surfaces, such as a nearby layout, alternate theme, viewport, keyboard path, locale, or fallback.
5. Record the observed result and select `pass`, `continue`, `defer`, or `blocked` according to the ledger definitions.

`Continue` selects the highest-priority unresolved item in the current stage. It does not restart the stage, expand scope, or choose optional polish without new evidence.

## Browser availability gate

If the page can run but a browser route is blocked, try an allowed route that can produce real evidence. If browser access is unavailable, record the environment and the failed or unavailable route in the ledger with the `blocked` decision. Visual and interaction verification remains pending; do not claim visual or interaction completion. A `defer` decision is different: use it only for non-blocking work that lacks new evidence, an acceptance criterion, performance data, or a user-observable defect, and record what would make it actionable.

## Compact repair example: light-theme contrast

**Observed evidence:** In the light theme, computed style inspection shows muted helper text at insufficient contrast against a white surface; a screenshot confirms it is difficult to read.

**Root cause:** A dark-theme neutral token was reused for light-theme secondary text without a light-theme contrast token.

**Minimal intervention:** Define a semantic muted-text token for the light theme and apply it to the helper text; do not change layout, typography scale, or unrelated colors.

**Adjacent regression surfaces:** Check the same helper text in dark theme, disabled controls that use the token family, narrow layout wrapping, and focus-visible states.

**Decision:** `continue` with the highest-priority unresolved theme failure until the browser confirms readable contrast in both theme directions; then record `pass`.
