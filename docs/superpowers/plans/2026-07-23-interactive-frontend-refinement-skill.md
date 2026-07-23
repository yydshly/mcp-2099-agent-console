# Interactive Frontend Refinement Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the advisory frontend-refinement Skill with a tested, stage-gated capability that reliably guides reference-led, brief-led, and repair-led frontend delivery from design contract through browser evidence and handoff.

**Architecture:** Keep a canonical, versioned Skill package in this repository and synchronize its validated contents to the global Codex Skills directory. Use a concise `SKILL.md` as the entry router and stage controller, with six focused references for design intake, stage gates, visual calibration, browser refinement, cross-surface regression, and delivery closure. Validate behavior through RED/GREEN subagent scenarios, wording micro-tests, and one isolated non-Agent forward-test page.

**Tech Stack:** Markdown Agent Skills, Codex subagents, official `quick_validate.py`, PowerShell, Git, browser-based frontend inspection.

## Global Constraints

- Support reference-led, brief-led, and existing-page repair entry modes.
- Require a design contract before implementation.
- Require real browser evidence before claiming visual or interaction completion when the page can run.
- Keep business workflows, Agent orchestration, backend protocols, and fixed visual styles outside the generic Skill.
- Interpret “continue” as advancing the highest-priority unresolved item in the current stage.
- Defer speculative work when there is no new evidence, acceptance criterion, performance data, or user-observable defect.
- Preserve unrelated changes under `.superpowers/sdd/`, `skill-validation/`, and `docs/AGENT_CONSOLE_DELIVERY_PLAYBOOK.md`.

---

## File Structure

Create the canonical package:

```text
skills/interactive-frontend-refinement/
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

Create isolated validation evidence:

```text
skill-validation/staged-refinement/
├─ scenarios.md
├─ rubric.md
├─ baseline-report.md
├─ treatment-report.md
├─ microtest-report.md
└─ forward-test-report.md
```

Synchronize the validated package to:

```text
C:\Users\yun68\.codex\skills\interactive-frontend-refinement\
```

Do not commit the temporary forward-test application created under:

```text
C:\tmp\interactive-frontend-refinement-forward-test\
```

---

### Task 1: Capture RED Baseline Behavior

**Files:**

- Create: `skill-validation/staged-refinement/scenarios.md`
- Create: `skill-validation/staged-refinement/rubric.md`
- Create: `skill-validation/staged-refinement/baseline-report.md`

**Interfaces:**

- Consumes: design requirements from `docs/superpowers/specs/2026-07-23-interactive-frontend-refinement-skill-design.md`
- Produces: three scenario prompts, a fixed scoring rubric, and verbatim baseline failure evidence used by Tasks 2 through 7

- [ ] **Step 1: Write the three baseline scenarios**

Create `scenarios.md` with these scenario contracts:

```markdown
# Validation Scenarios

## Scenario A: Reference-led cinematic product page

Give the worker a visual reference and ask for a runnable, interactive product page. The prompt must require a strong focal composition, one foreground interaction, desktop/mobile support, and a polished result without naming the desired workflow.

## Scenario B: Brief-led operations workspace

Give the worker only a text brief for a non-Agent operations workspace. Require autonomous visual direction, a dense but readable information hierarchy, dark/light themes, one primary workflow, and responsive behavior.

## Scenario C: Existing-page repair

Give the worker a small existing frontend with known contrast, overlap, state-consistency, focus, and mobile-overflow defects. Ask the worker to “continue optimizing” after the first repair.
```

- [ ] **Step 2: Write the fixed rubric**

Create `rubric.md` with nine binary criteria:

```markdown
# Validation Rubric

1. Identifies the entry mode.
2. Establishes a verifiable design contract.
3. Creates or confirms a runnable baseline before polish.
4. Uses browser evidence before claiming visual completion.
5. Names the current stage and exit condition.
6. Records root cause, minimal intervention, and adjacent regression.
7. Keeps business and unrelated feature work out of scope.
8. Interprets “continue” as current-stage progress.
9. Stops or defers when no new evidence exists.

Critical failure: claiming visual completion without browser evidence, polishing before a runnable baseline, inventing features after “continue,” or generalizing case-specific business/style as a universal rule.
```

- [ ] **Step 3: Run each scenario without the revised Skill**

Dispatch fresh subagents with only the scenario prompt and task-local artifact. Do not mention the intended workflow, known failures, or scoring rubric.

Expected result: at least one scenario demonstrates stage skipping, missing browser evidence, random patch order, feature drift, missing adjacent regression, premature completion, or endless optional refinement.

- [ ] **Step 4: Record verbatim baseline behavior**

Write `baseline-report.md` with:

```markdown
# Baseline Report

## Scenario A
Observed execution shape:
Verbatim failure evidence:
Rubric score:

## Scenario B
Observed execution shape:
Verbatim failure evidence:
Rubric score:

## Scenario C
Observed execution shape:
Verbatim failure evidence:
Rubric score:

## Failure patterns the revised Skill must address
```

- [ ] **Step 5: Commit baseline evidence**

```powershell
git add -- skill-validation/staged-refinement/scenarios.md skill-validation/staged-refinement/rubric.md skill-validation/staged-refinement/baseline-report.md
git commit -m "test: capture frontend refinement skill baseline"
```

Expected: one commit containing only the three staged-refinement validation files.

---

### Task 2: Implement the Skill Router and Design Contract

**Files:**

- Create: `skills/interactive-frontend-refinement/SKILL.md`
- Create: `skills/interactive-frontend-refinement/agents/openai.yaml`
- Create: `skills/interactive-frontend-refinement/references/design-contract.md`
- Create: `skills/interactive-frontend-refinement/references/workflow-stages.md`

**Interfaces:**

- Consumes: baseline failure patterns from Task 1
- Produces: entry-mode routing, the required design-contract schema, and the ten-stage controller used by all later references

- [ ] **Step 1: Write the failing document assertions**

Before creating the Skill package, verify these commands fail because the files or required phrases do not exist:

```powershell
rg -n "^description: Use when" skills/interactive-frontend-refinement/SKILL.md
rg -n "Reference-led|Brief-led|Repair-led" skills/interactive-frontend-refinement/references/design-contract.md
rg -n "Stage 0|Stage 9|Exit condition" skills/interactive-frontend-refinement/references/workflow-stages.md
```

Expected: file-not-found or no-match failures.

- [ ] **Step 2: Write the concise Skill router**

Create `SKILL.md` with:

- YAML `name: interactive-frontend-refinement`.
- A third-person description beginning with `Use when` and containing trigger symptoms only.
- A two-sentence overview defining browser-evidence-led, stage-gated refinement.
- Entry routing for reference-led, brief-led, and repair-led tasks.
- The mandatory execution shape:

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

- Hard gates for runnable baseline, browser evidence, current-stage progress, and stop/defer behavior.
- Direct routing to all six references with exact reasons to load each file.
- A red-flags section addressing baseline rationalizations recorded in Task 1.

- [ ] **Step 3: Write the design-contract reference**

Create `design-contract.md` with two intake paths and one shared output:

```text
Entry mode:
Target user and context:
Desired first impression:
Visual constraints:
Information constraints:
Operation constraints:
State constraints:
Environment constraints:
Primary journey:
Observable completion criteria:
```

Reference-led intake must extract composition, focal hierarchy, typography, color/material, depth, motion, and operation placement.

Brief-led intake must establish those properties autonomously and present alternatives only when the trade-off materially changes implementation.

Repair-led intake must preserve the existing visual system unless the user explicitly requests a redesign.

- [ ] **Step 4: Write the ten-stage reference**

Create `workflow-stages.md` with Stage 0 through Stage 9. Every stage must contain exactly:

```text
Purpose
Required inputs
Actions
Evidence
Required output
Exit condition
Adjacent regression
```

Use the stage definitions from the approved design specification without adding project-specific names.

- [ ] **Step 5: Write UI metadata**

Create `agents/openai.yaml`:

```yaml
interface:
  display_name: "Interactive Frontend Refinement"
  short_description: "Stage-gated browser-led frontend delivery workflow"
  default_prompt: "Use $interactive-frontend-refinement to turn this frontend request into a browser-verified, polished delivery."
```

- [ ] **Step 6: Verify document assertions pass**

Run:

```powershell
rg -n "^description: Use when" skills/interactive-frontend-refinement/SKILL.md
rg -n "Reference-led|Brief-led|Repair-led" skills/interactive-frontend-refinement/references/design-contract.md
rg -n "Stage 0|Stage 9|Exit condition" skills/interactive-frontend-refinement/references/workflow-stages.md
```

Expected: matches in all three files.

- [ ] **Step 7: Commit router and stage controller**

```powershell
git add -- skills/interactive-frontend-refinement/SKILL.md skills/interactive-frontend-refinement/agents/openai.yaml skills/interactive-frontend-refinement/references/design-contract.md skills/interactive-frontend-refinement/references/workflow-stages.md
git commit -m "feat: add staged frontend refinement controller"
```

---

### Task 3: Implement Visual and Browser Refinement References

**Files:**

- Create: `skills/interactive-frontend-refinement/references/visual-calibration.md`
- Create: `skills/interactive-frontend-refinement/references/browser-refinement-loop.md`

**Interfaces:**

- Consumes: current-stage identity and design contract from Task 2
- Produces: a visual-difference diagnosis method and the mandatory per-issue evidence ledger

- [ ] **Step 1: Write failing content assertions**

```powershell
rg -n "Composition|Typography|Material|Motion" skills/interactive-frontend-refinement/references/visual-calibration.md
rg -n "Current stage|Observed evidence|Minimal intervention|Adjacent regression" skills/interactive-frontend-refinement/references/browser-refinement-loop.md
```

Expected: file-not-found or no-match failures.

- [ ] **Step 2: Write visual calibration guidance**

Create `visual-calibration.md` with:

- A comparison order: composition, focal hierarchy, typography, palette, material, depth, density, motion.
- A reference-led gap table.
- A brief-led design-direction table.
- Explicit separation between high-cost enhancement layers and readable product UI.
- A rule to evaluate both directions of theme transitions.
- One compact worked example that diagnoses a weak visual hierarchy without using MCP 2099 terminology.

- [ ] **Step 3: Write the browser refinement loop**

Create `browser-refinement-loop.md` with:

- Accepted evidence types.
- The required ledger:

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

- The fixed priority order from the design specification.
- A five-step minimal-fix loop.
- A rule that “continue” selects the highest-priority unresolved item in the current stage.
- A rule that unavailable browser access leaves visual verification pending.
- One compact repair example using a light-theme contrast defect.

- [ ] **Step 4: Verify content assertions pass**

Run the same `rg` commands from Step 1.

Expected: all required concepts match.

- [ ] **Step 5: Commit refinement references**

```powershell
git add -- skills/interactive-frontend-refinement/references/visual-calibration.md skills/interactive-frontend-refinement/references/browser-refinement-loop.md
git commit -m "feat: add browser-led frontend refinement loop"
```

---

### Task 4: Implement Cross-Surface and Delivery Gates

**Files:**

- Create: `skills/interactive-frontend-refinement/references/cross-surface-matrix.md`
- Create: `skills/interactive-frontend-refinement/references/delivery-handoff.md`

**Interfaces:**

- Consumes: completed local refinement items from Task 3
- Produces: adjacent regression selection, full delivery verification, stop rules, backlog triggers, and session handoff

- [ ] **Step 1: Write failing content assertions**

```powershell
rg -n "Theme|Viewport|State|Foreground|Locale|Performance" skills/interactive-frontend-refinement/references/cross-surface-matrix.md
rg -n "Stop conditions|Deferred work|Session handoff|Repository" skills/interactive-frontend-refinement/references/delivery-handoff.md
```

Expected: file-not-found or no-match failures.

- [ ] **Step 2: Write the cross-surface matrix**

Create `cross-surface-matrix.md` with exact change-to-regression mappings for:

- Theme/color.
- Layout.
- Foreground layers.
- State mapping.
- Form values.
- Localization.
- High-cost visuals.

Separate local adjacent checks from the full delivery matrix. Include dark/light, desktop/tablet/mobile, primary states, open/close/focus, locale, reduced motion, and capability fallback.

- [ ] **Step 3: Write delivery and handoff guidance**

Create `delivery-handoff.md` with:

- Product readiness.
- Engineering validation chosen in proportion to changed scope.
- Repository hygiene.
- Stop conditions.
- Deferred-work entries that require a trigger.
- A five-question session handoff:

```text
What is the project and current stage?
What was completed?
What remains or was deliberately deferred?
What evidence and validation exist?
What should the next session do first?
```

- [ ] **Step 4: Verify content assertions pass**

Run the same `rg` commands from Step 1.

Expected: all required concepts match.

- [ ] **Step 5: Commit closure references**

```powershell
git add -- skills/interactive-frontend-refinement/references/cross-surface-matrix.md skills/interactive-frontend-refinement/references/delivery-handoff.md
git commit -m "feat: add frontend regression and delivery gates"
```

---

### Task 5: Validate and Install the Canonical Skill

**Files:**

- Modify: `C:\Users\yun68\.codex\skills\interactive-frontend-refinement\`

**Interfaces:**

- Consumes: canonical package from Tasks 2 through 4
- Produces: a structurally valid, globally discoverable Skill identical to the repository source

- [ ] **Step 1: Run official validation against the canonical package**

```powershell
$env:PYTHONUTF8 = '1'
python 'C:\Users\yun68\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'skills\interactive-frontend-refinement'
```

Expected: `Skill is valid!`

- [ ] **Step 2: Compare canonical and installed file lists**

```powershell
Get-ChildItem -LiteralPath 'skills\interactive-frontend-refinement' -Recurse -File | ForEach-Object { $_.FullName.Substring((Resolve-Path 'skills\interactive-frontend-refinement').Path.Length) }
Get-ChildItem -LiteralPath 'C:\Users\yun68\.codex\skills\interactive-frontend-refinement' -Recurse -File | ForEach-Object { $_.FullName.Substring('C:\Users\yun68\.codex\skills\interactive-frontend-refinement'.Length) }
```

Expected before synchronization: the installed package lacks some newly designed references.

- [ ] **Step 3: Synchronize only the explicit Skill directory**

Resolve both paths and verify the destination equals:

```text
C:\Users\yun68\.codex\skills\interactive-frontend-refinement
```

Run:

```powershell
$canonicalSkill = (Resolve-Path -LiteralPath 'skills\interactive-frontend-refinement').Path
$installedSkill = (Resolve-Path -LiteralPath 'C:\Users\yun68\.codex\skills\interactive-frontend-refinement').Path
$expectedInstalledSkill = 'C:\Users\yun68\.codex\skills\interactive-frontend-refinement'
if ($installedSkill -ne $expectedInstalledSkill) {
    throw "Unexpected Skill destination: $installedSkill"
}
Copy-Item -LiteralPath "$canonicalSkill\SKILL.md" -Destination "$installedSkill\SKILL.md" -Force
Copy-Item -LiteralPath "$canonicalSkill\agents\openai.yaml" -Destination "$installedSkill\agents\openai.yaml" -Force
Get-ChildItem -LiteralPath "$canonicalSkill\references" -File | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination "$installedSkill\references\$($_.Name)" -Force
}
```

Expected: only files inside the explicit installed Skill directory are updated; sibling Skills are untouched.

- [ ] **Step 4: Run official validation against the installed package**

```powershell
$env:PYTHONUTF8 = '1'
python 'C:\Users\yun68\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'C:\Users\yun68\.codex\skills\interactive-frontend-refinement'
```

Expected: `Skill is valid!`

- [ ] **Step 5: Verify canonical and installed hashes**

Compute SHA-256 hashes for each relative file in both directories.

Expected: every canonical relative path exists in the installed directory with the same hash.

---

### Task 6: Run GREEN Scenario and Wording Tests

**Files:**

- Create: `skill-validation/staged-refinement/treatment-report.md`
- Create: `skill-validation/staged-refinement/microtest-report.md`

**Interfaces:**

- Consumes: scenarios and rubric from Task 1, installed revised Skill from Task 5
- Produces: behavioral evidence that the Skill changes execution shape

- [ ] **Step 1: Re-run all three scenarios with the revised Skill**

Dispatch fresh subagents using:

```text
Use $interactive-frontend-refinement to complete the following task:
[unchanged scenario prompt]
```

Do not include the rubric, expected failures, or prior reports.

- [ ] **Step 2: Score and record treatment behavior**

Create `treatment-report.md` with the same report structure as `baseline-report.md`, plus:

```markdown
## Baseline-to-treatment comparison

| Criterion | Baseline | Treatment | Evidence |
| --- | --- | --- | --- |
```

Expected: all nine criteria pass and no critical failure occurs.

- [ ] **Step 3: Run wording micro-tests**

For each instruction below, run at least five fresh-context samples with the Skill and five no-guidance controls:

```text
Observe before changing.
“Continue” advances the current stage.
No evidence means defer and stop.
```

Use prompts that tempt premature coding, feature invention, or endless polish. Manually read every response.

- [ ] **Step 4: Record convergence**

Create `microtest-report.md`:

```markdown
# Wording Microtest Report

## Observe before changing
Control outcomes:
Skill outcomes:
Variance:

## Continue advances current stage
Control outcomes:
Skill outcomes:
Variance:

## No evidence means defer and stop
Control outcomes:
Skill outcomes:
Variance:

## Wording changes required
```

Expected: Skill samples converge on the required execution shape more consistently than controls.

- [ ] **Step 5: Commit treatment evidence**

```powershell
git add -- skill-validation/staged-refinement/treatment-report.md skill-validation/staged-refinement/microtest-report.md
git commit -m "test: validate staged frontend refinement behavior"
```

---

### Task 7: Run the Non-Agent Forward Test and Refactor

**Files:**

- Create: `skill-validation/staged-refinement/forward-test-report.md`
- Modify if required: `skills/interactive-frontend-refinement/SKILL.md`
- Modify if required: `skills/interactive-frontend-refinement/references/*.md`
- Synchronize if modified: `C:\Users\yun68\.codex\skills\interactive-frontend-refinement\`

**Interfaces:**

- Consumes: the validated Skill from Task 6
- Produces: actual transfer evidence on a non-Agent frontend and the final deployable Skill

- [ ] **Step 1: Create an isolated forward-test workspace**

Create:

```text
C:\tmp\interactive-frontend-refinement-forward-test
```

Run:

```powershell
$forwardTestRoot = 'C:\tmp\interactive-frontend-refinement-forward-test'
if (-not (Test-Path -LiteralPath $forwardTestRoot)) {
    New-Item -ItemType Directory -Path $forwardTestRoot | Out-Null
}
```

Use a brief-led, non-Agent request for an interactive public-transit disruption workspace. The brief must require:

- Autonomous visual design.
- One route-triage interaction loop.
- One foreground detail surface.
- Dark and light themes.
- Desktop and mobile layouts.
- Loading, success, and failure states.
- No reference image.

- [ ] **Step 2: Execute the forward test with the revised Skill**

Use a fresh subagent with only this prompt:

```text
Use $interactive-frontend-refinement to create a runnable public-transit disruption workspace in C:\tmp\interactive-frontend-refinement-forward-test.

No reference image is provided. Establish a distinctive visual direction suitable for a metropolitan control room without borrowing MCP 2099 or Agent Console styling. The product must let an operator inspect a disrupted route, open a foreground incident detail, choose a mitigation action, and observe loading, success, and failure feedback. Include dark and light themes and usable desktop and mobile layouts. Work through the Skill stages, use real browser evidence when the page runs, and finish with a delivery handoff.
```

Expected execution:

```text
Brief-led design contract
→ runnable baseline
→ browser observation
→ stage-led refinement
→ adjacent regression
→ delivery handoff
```

- [ ] **Step 3: Inspect the actual page**

Use the browser to inspect:

- Primary desktop journey.
- Open and close behavior.
- Dark and light themes.
- Mobile layout.
- Loading, success, and failure states.

Capture only evidence needed to score the rubric.

- [ ] **Step 4: Record the forward-test report**

Create `forward-test-report.md` with:

```markdown
# Forward Test Report

## Brief
## Design contract produced
## Stage progression
## Browser evidence
## Refinement ledger quality
## Adjacent regression coverage
## Delivery and stop behavior
## Failures or rationalizations
## Required Skill revisions
## Final verdict
```

- [ ] **Step 5: Refactor only observed gaps**

If testing reveals a gap:

1. Add the smallest positive recipe, required field, or observable conditional that addresses the failure.
2. Re-run the exact failing scenario.
3. Re-run official structural validation.
4. Synchronize canonical and installed packages.
5. Re-check hashes.

Do not add hypothetical guidance unsupported by a test failure.

- [ ] **Step 6: Commit final Skill and validation evidence**

```powershell
git add -- skills/interactive-frontend-refinement skill-validation/staged-refinement/forward-test-report.md
git commit -m "feat: finalize reusable frontend refinement skill"
```

Expected: canonical Skill and forward-test evidence are versioned; temporary application remains outside Git.

- [ ] **Step 7: Final verification**

Run:

```powershell
$env:PYTHONUTF8 = '1'
python 'C:\Users\yun68\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'skills\interactive-frontend-refinement'
python 'C:\Users\yun68\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'C:\Users\yun68\.codex\skills\interactive-frontend-refinement'
git status --short
```

Expected:

- Both validations report `Skill is valid!`.
- Canonical and installed hashes match.
- Only pre-existing unrelated working-tree files remain.
