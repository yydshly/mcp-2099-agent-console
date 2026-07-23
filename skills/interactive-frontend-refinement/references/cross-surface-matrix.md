# Cross-Surface Matrix

Use this reference after the design contract is agreed and before claiming a
refinement is complete. It applies to reference-led, brief-led, and repair-led
work. Select checks from the local matrix first; use the full delivery matrix
when the changed scope or declared journey requires it.

## Pre-Implementation Gate

Before implementation begins in reference-led, brief-led, or repair-led work,
create or confirm a design contract that names the declared primary journey,
acceptance criteria, affected states and surfaces, and supported boundaries.
Without that contract, stop refinement and obtain it; do not begin an
implementation change or substitute a visual guess for an acceptance
criterion.

## Local Adjacent Checks

| Change category | Local adjacent checks | Evidence to capture |
| --- | --- | --- |
| Theme/color | Theme tokens, contrast, selected/disabled/error states, inherited surfaces and icons | Both intended theme variants or a documented supported-theme boundary |
| Layout | Parent and sibling alignment, overflow, scroll behavior, desktop/tablet/mobile breakpoints | Screenshots at the affected Viewport widths |
| Foreground layers | Stacking order, backdrop, scroll lock, click-outside behavior, open/close/Escape/focus return | Browser evidence for the layer and the page beneath it |
| State mapping | Loading, empty, populated, selected, error, success, and stale-data transitions | Each changed State and its transition trigger |
| Form values | Defaults, controlled values, validation, submit/reset, persistence, keyboard entry | Values before and after the relevant action |
| Localization | Translation expansion, truncation/wrapping, right-to-left support when applicable, date/number formatting | Locale screenshot and control-width evidence |
| High-cost visuals | Image/video/canvas loading, responsive assets, animation budget, reduced-motion behavior, Capability fallback | Performance observation plus fallback evidence |

Run only checks with a plausible adjacent regression. A visual-only color
change does not automatically require every form check, but it does require
checking any shared control states that consume the changed token.

## Full Delivery Matrix

Run this matrix for a declared primary journey, a multi-surface change, or any
change whose local checks expose a cross-surface risk. Use a real browser when
the page can run; source inspection is not completion evidence for visual or
interaction claims.

| Surface | Required check | Completion evidence |
| --- | --- | --- |
| Theme | Dark/light themes preserve hierarchy, legibility, and semantic State cues | Screenshots or browser observations for each supported theme |
| Viewport | Desktop/tablet/mobile maintain the intended journey without clipping, overlap, or inaccessible controls | Browser screenshots at representative widths |
| State | Primary states show correct content and controls, including loading, empty, error, and success where applicable | State-by-state browser observations |
| Foreground | Open/close/Escape/focus work for dialogs, menus, popovers, and other foreground layers | Browser interaction evidence, including focus return |
| Keyboard and accessibility | The declared journey is keyboard reachable in a logical focus order, shows a visible focus indicator, and each control or operation has semantic behavior | Stage 7 browser evidence: reproduced keyboard journey, observed focus order and visible focus, plus semantic operation evidence |
| Locale | Locale and control width accommodate translated labels, formatted values, and input affordances | Locale screenshot and measured/witnessed width behavior |
| Motion | Reduced motion removes or replaces nonessential motion without hiding information | Browser or OS preference evidence |
| Capability | Capability fallback remains usable when the enhanced API, media, or rendering path is unavailable | Browser/devtools evidence of an operable fallback when runnable; otherwise mark verification pending. Documentation may record an environment boundary, never completion evidence. |
| Performance | High-cost visuals do not make the primary journey perceptibly slower; inspect loading and animation cost when their scope changed | Performance observation appropriate to the changed asset or effect |

## Selection Rules

1. Begin with the declared primary journey and the design contract's acceptance
   criteria.
2. Run the matching local adjacent checks for every changed category.
3. Escalate to the full delivery matrix when the change crosses a shared token,
   breakpoint, state model, foreground layer, locale, motion preference, or
   capability boundary.
4. Record what was checked, what was not applicable, and why. Do not claim a
   visual or interaction result without real browser evidence when the page can
   run.
5. Interpret `continue` as advancing the highest-priority unresolved item in
   the current stage, not inventing a new refinement target.

Do not use this generic matrix to define business workflows, Agent
orchestration, backend protocols, or fixed visual styles. Those belong to the
project-specific contract and implementation context.
