# Frontend Optimization Backlog

## Current baseline

The frontend interaction layer is considered complete for the Local Mock stage.
Day/night readability, responsive panel layout, task flow feedback, exports,
keyboard focus, and static Chinese/English UI copy are in place.

## Deferred until a concrete trigger

| Item | Trigger |
| --- | --- |
| Full viewport regression | A release candidate or a reported layout issue |
| Softer dark-to-light particle transition | A confirmed visual direction or production motion review |
| WebGL FPS monitor and static fallback control | Performance evidence from target devices |
| CSS token consolidation | A larger visual revision or a second product surface |
| Rich export formats and attachments | A backend artifact contract |

## Deferred until backend integration

| Item | Dependency |
| --- | --- |
| Runtime error and retry experiences | Real API errors, timeout semantics, and reconnect policy |
| Streaming task progress | Task event and snapshot protocol |
| Approval callbacks and permissions | Identity and authorization contract |
| Dynamic bilingual Agent data | `label`, `labelI18nKey`, and fallback-label fields in API payloads |
| Multi-agent topology display | Parent/child task and delegation event contract |

## Working rule

Do not implement backlog items speculatively. Promote an item only when a user
report, acceptance requirement, measured performance issue, or backend
contract makes the expected behavior concrete.
