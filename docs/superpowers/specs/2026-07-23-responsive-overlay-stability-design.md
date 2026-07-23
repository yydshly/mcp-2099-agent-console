+# Responsive Overlay Stability Design

## Goal

Keep MCP-2099 controls readable and reachable across desktop, tablet, mobile, low-height windows, and both supported locales.

## Scope

Stabilize front-end layout for:

- Top navigation controls after Chinese text expansion.
- Dispatch drawer, queue, history, result, timeline, approval, and operation confirmation surfaces.
- Bottom status bar and mobile safe spacing.
- Simultaneous overlay states without control overlap.

## Architecture

Use CSS constraints, intrinsic sizing, safe viewport units, and breakpoint-specific stacking. No component state, protocol, runtime, WebGL, or task behavior changes are required.

## Rules

- Modal confirmation and approval gates always remain centered, scrollable, and above drawers.
- Right-side drawers start below the top navigation and end above the status bar.
- Result and timeline panels become full-width stacked surfaces before they can overlap.
- The navigation retains task creation and language controls; lower-priority visual controls collapse first.
- Use `100dvh` bounds and `overscroll-behavior: contain` for low-height environments.

## Validation

Check desktop, tablet, narrow mobile, and low-height CSS breakpoints through build and existing automated coverage. Browser visual checks can follow when a target viewport is available.

## Constraints

- No dependencies or Agent Contract changes.
- Preserve light and dark theme contrast.
- Do not use Git commands, commits, branches, or worktree changes.

