# Workflow Stages

Use one active stage at a time. A stage advances only when its exit condition is supported by the required evidence.

## Stage 0: Goal lock

**Purpose:** Establish the design contract and delivery boundary.

**Required inputs:** Request, available references or brief, and current environment constraints.

**Actions:** Identify the entry mode, complete the design contract, and separate in-scope user-observable outcomes from speculative work.

**Evidence:** An inspectable contract with observable completion criteria.

**Required output:** Approved or recorded design contract and named next stage.

**Exit condition:** The target, constraints, primary journey, and completion criteria are explicit enough to inspect.

**Adjacent regression:** Confirm the contract does not introduce unrelated business, backend, orchestration, or fixed-style requirements.

## Stage 1: Runnable baseline

**Purpose:** Establish the starting behavior before refinement.

**Required inputs:** Design contract, runnable surface or documented runtime block.

**Actions:** Run the page through an allowed route, capture baseline browser evidence, and record blocking conditions if it cannot run.

**Evidence:** Browser capture, DOM/state observation, or an explicit reproducible runtime block.

**Required output:** Baseline record and named next stage or verification defer.

**Exit condition:** A runnable baseline is preserved, or the run block is formally the highest-priority unresolved item.

**Adjacent regression:** Confirm the chosen run route does not mask the target surface or state.

## Stage 2: Primary visual calibration

**Purpose:** Align the first-view hierarchy with the design contract.

**Required inputs:** Runnable baseline, focal and visual constraints, viewport target.

**Actions:** Inspect the first view, record one hierarchy issue, apply the smallest visual intervention, and re-inspect.

**Evidence:** Before/after browser evidence tied to the recorded issue.

**Required output:** One linked visual refinement record.

**Exit condition:** The focal hierarchy and desired first impression meet the contract at the target viewport.

**Adjacent regression:** Check the immediately neighboring content, overlays, and viewport edges.

## Stage 3: Information and layout calibration

**Purpose:** Make information order, density, and layout support the primary journey.

**Required inputs:** Stage 2 evidence, information constraints, target viewports.

**Actions:** Inspect reading order and layout collisions, refine one issue minimally, and re-check the affected layout.

**Evidence:** Browser evidence showing the prior issue and the resulting information flow.

**Required output:** One linked layout refinement record.

**Exit condition:** Required information is legible, ordered, and unobstructed for the primary journey.

**Adjacent regression:** Check neighboring sections, overflow, and breakpoint transitions.

## Stage 4: Control-system calibration

**Purpose:** Make controls discoverable, placed intentionally, and consistent with the contract.

**Required inputs:** Stage 3 output, operation constraints, supported input methods.

**Actions:** Inspect control placement and affordance, refine one control-system issue minimally, and verify its expected state.

**Evidence:** Browser evidence of control visibility, targetability, and resulting state.

**Required output:** One linked control refinement record.

**Exit condition:** Required controls are reachable and their placement supports the primary journey.

**Adjacent regression:** Check neighboring controls, focus order, and layout changes caused by the intervention.

## Stage 5: Foreground interaction

**Purpose:** Verify the primary interactive journey in the foreground surface.

**Required inputs:** Stage 4 output, primary journey, and operation/state constraints.

**Actions:** Exercise the journey in a real browser, record one observed interaction issue if present, and apply the minimal fix.

**Evidence:** Browser interaction evidence for trigger, intermediate state, result, and dismissal or recovery where applicable.

**Required output:** Verified primary-journey record or an explicit unresolved interaction item.

**Exit condition:** The primary journey completes observably without a user-observable defect.

**Adjacent regression:** Check the initiating surface, focus return, and neighboring interactions.

## Stage 6: State and feedback calibration

**Purpose:** Make meaningful states and feedback understandable and coherent.

**Required inputs:** Stage 5 output, state constraints, known success, loading, empty, error, or recovery states.

**Actions:** Inspect applicable states, refine one unclear or inconsistent feedback issue minimally, and verify transition evidence.

**Evidence:** Browser observations of applicable states and transitions.

**Required output:** State/feedback refinement record or explicit non-applicability record.

**Exit condition:** Applicable states communicate status and recovery without contradicting the visual system.

**Adjacent regression:** Check state persistence, control availability, and return to the primary surface.

## Stage 7: Cross-surface adaptation

**Purpose:** Preserve the contract across required viewport and input surfaces.

**Required inputs:** Prior-stage evidence, environment constraints, and target surface matrix.

**Actions:** Inspect each required surface, prioritize the highest-impact observed defect, apply a minimal adaptation, and re-check it.

**Evidence:** Browser evidence for each required viewport or input surface.

**Required output:** Cross-surface coverage record with unresolved items named.

**Exit condition:** The primary journey and visual constraints hold across all required surfaces.

**Adjacent regression:** Check intermediate breakpoints, orientation changes, and shared component states.

## Stage 8: Performance and fallback

**Purpose:** Address user-observable performance risks and fallback behavior when evidence requires it.

**Required inputs:** Performance data, fallback requirements, or a user-observable performance defect.

**Actions:** Investigate only evidenced risks, make the minimal intervention, and observe the relevant fallback or performance result.

**Evidence:** Measured data, browser observation, or explicit absence of applicable evidence.

**Required output:** Performance/fallback record or an evidence-based defer.

**Exit condition:** Evidenced performance and fallback criteria are met, or no applicable evidence remains and work is deferred.

**Adjacent regression:** Check that the intervention preserves primary rendering, interaction, and required states.

## Stage 9: Engineering and delivery closure

**Purpose:** Make an evidence-grounded completion or handoff decision.

**Required inputs:** Stage outputs, unresolved-item list, and observable completion criteria.

**Actions:** Evaluate each criterion, summarize browser evidence, and explicitly defer anything unverified.

**Evidence:** Traceable stage records, final browser evidence when runnable, and documented blocks.

**Required output:** Delivery status with verified completion and explicit concerns or handoff items.

**Exit condition:** Every observable completion criterion is verified or explicitly deferred without a misleading readiness claim.

**Adjacent regression:** Confirm final claims remain consistent across the checked surfaces and states.
