# Visual Calibration

Use this reference after a design contract exists. Calibrate observable choices against the contract before adding decoration or declaring visual completion.

## Comparison order

Assess the page in this order. Do not use a lower-order change to mask an unresolved higher-order problem.

```text
Composition
-> focal hierarchy
-> typography
-> palette
-> material
-> depth
-> density
-> motion
```

| Layer | Inspect | Evidence-backed decision |
| --- | --- | --- |
| Composition | regions, alignment, proportion, and reading path | Correct the primary arrangement before tuning components. |
| Focal hierarchy | first attention, primary action, and competing emphasis | Strengthen or reduce emphasis so the intended task is apparent. |
| Typography | role contrast, measure, wrapping, and readability | Adjust type roles and spacing only after the hierarchy is sound. |
| Palette | semantic contrast, states, and theme legibility | Preserve meaning and readable contrast in each supported theme. |
| Material | surfaces, borders, texture, and visual weight | Add only material cues that clarify containment or interaction. |
| Depth | stacking, elevation, overlays, and focus | Make layer order and active context unambiguous. |
| Density | information load, whitespace, and control grouping | Remove or regroup content that impedes the primary journey. |
| Motion | transition purpose, timing, and reduced-motion behavior | Use motion to explain state change, not to manufacture emphasis. |

## Choose the calibration frame

| Entry mode | Design input | Calibration question | Record before implementation |
| --- | --- | --- | --- |
| Reference-led | supplied visual target | What differs from the target in each comparison layer? | A gap table with observable evidence and acceptance criteria. |
| Brief-led | product outcome without a visual target | Which direction best supports the user goal and constraints? | A design-direction table with intentional choices and testable consequences. |
| Repair-led | existing page plus observed defect | Which existing invariants must remain while the defect is corrected? | A repair contract with preserved behavior, defect evidence, and acceptance criteria. |

### Reference-led gap table

| Comparison layer | Reference evidence | Current evidence | Gap | Smallest next experiment | Acceptance criterion |
| --- | --- | --- | --- | --- | --- |
| Focal hierarchy | Primary task is visually dominant. | Secondary metric draws first attention. | Competing emphasis. | Reduce metric weight before changing layout. | Primary task receives first attention at the target viewport. |

Populate this table from screenshots, inspection, or an explicit reference annotation. Do not infer a gap from personal taste alone.

### Brief-led design-direction table

| Decision | Chosen direction | Why it serves the user goal | Observable constraint | Acceptance criterion |
| --- | --- | --- | --- | --- |
| Information hierarchy | One clear primary action with supporting context. | It shortens the primary journey. | One element must lead at narrow and wide viewports. | First scan identifies the action without relying on color alone. |
| Theme behavior | Semantic tokens with complete light and dark evaluation. | It preserves state meaning across contexts. | Text, controls, and surfaces remain legible in both directions. | Each supported theme passes its relevant contrast and interaction checks. |

Record selected typography roles, palette semantics, material and depth rules, density limits, responsive behavior, interaction states, and motion intent as part of the design contract. A direction is not a fixed aesthetic; it is a set of verifiable decisions.

## Product UI and enhancement layers

Keep the readable product interface complete without optional visual effects. High-cost enhancement layers can include large imagery, video, canvas or WebGL, shader effects, heavy blur, elaborate masking, or continuous animation. Treat them as progressive enhancements with a capability and performance fallback.

| Layer | Must provide | May add | Must not do |
| --- | --- | --- | --- |
| Readable product UI | Content, primary controls, state, hierarchy, keyboard access, and legible contrast | Simple layout and semantic state changes | Depend on expensive rendering to expose meaning or complete the journey. |
| Enhancement layer | A perceivable improvement backed by evidence | Atmosphere, illustration, spatial context, or subtle feedback | Delay, obscure, or replace essential content, controls, or feedback. |

Evaluate the enhancement separately: verify the base UI first, then confirm the enhanced path, fallback path, reduced-motion behavior, and constrained-device behavior when relevant.

## Theme transitions

Evaluate both directions, not merely the theme selected at load:

| Transition | Check |
| --- | --- |
| Light to dark | Text, icons, borders, focus indicators, disabled states, overlays, and content hierarchy remain legible through and after the transition. |
| Dark to light | Surfaces do not wash out, muted text remains readable, controls retain boundaries, and any image or effect does not reduce contrast. |

Check the settled state and the transition itself. Honor user motion preferences; a non-animated token change is valid when motion would distract or be unavailable.

## Worked diagnosis: weak visual hierarchy

A dashboard places a saturated status card, a large page title, and the primary "Review requests" control in the same top row. Screenshot evidence shows the card is seen first, while the control is visually similar to secondary buttons. Diagnose the issue at **focal hierarchy**, not palette alone: the status card has disproportionate size and saturation, and the primary action lacks distinction. First reduce the card's prominence and give the primary control a unique role treatment. Then check the adjacent narrow layout to ensure the revised card does not push the primary action below the initial viewport. Do not add gradients, animation, or new panels unless later evidence shows they are necessary.

## Stop rule

Defer further visual work when no new evidence, acceptance criterion, performance data, or user-observable defect exists. Record the pending question and the evidence needed to reopen calibration.
