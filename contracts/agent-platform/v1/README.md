# Agent Platform Contract v1

This directory is the source of truth for the business-neutral Agent Platform v1 contract.

## Transport

- Commands use REST `POST`.
- Queries use REST `GET`.
- Live task updates use Server-Sent Events in v1.
- Every request command contains `requestId` and is idempotent per caller identity.

## Event processing

- Events are deduplicated by `id`.
- Events are ordered by `sequence` within one `taskId`.
- A client ignores a duplicate event.
- A client fetches a fresh `TaskSnapshot` after reconnecting or detecting a sequence gap.
- The backend remains authoritative for every task state transition.
- `pause` and `resume` are generic operator actions. They are valid only when the backend policy permits the current task transition.

## Compatibility

- Additive optional fields are compatible within v1.
- Removing a required field, changing a field type, changing action semantics, or changing task-state meaning requires v2.
- Profiles own business fields. Common task, event, agent-run, and result envelopes never own fields such as `orderId`, `ticketId`, or `leadId`.

## Fixture profiles

`fixtures/customer-refund.profile.json` is an extension compatibility fixture. It is not a platform default and must not be imported by generic task UI, task state, or agent orchestration code.
