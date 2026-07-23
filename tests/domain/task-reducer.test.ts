import { describe, expect, it } from 'vitest'
import type { AgentEvent, TaskSnapshot } from '../../src/domain/agent-contract'
import { applyTaskEvent, getEventDisposition, getTaskEventGap, replaceTaskSnapshot } from '../../src/domain/task-reducer'

const snapshot: TaskSnapshot = { id: 'task-1', profileId: 'profile-1', status: 'queued', progress: 0, input: {}, options: { priority: 'standard', approvalPolicy: 'auto' }, agents: [], createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', version: 1 }
const event = (sequence: number, type: AgentEvent['type'], payload: Record<string, unknown> = {}): AgentEvent => ({ id: `event-${sequence}`, sequence, taskId: 'task-1', occurredAt: '2026-01-01T00:00:01.000Z', type, payload })

describe('task reducer', () => {
  it('applies ordered status events', () => {
    const result = applyTaskEvent(replaceTaskSnapshot(snapshot), event(1, 'task.status_changed', { status: 'running', progress: 25 }))
    expect(result.snapshot.status).toBe('running')
    expect(result.snapshot.progress).toBe(25)
  })

  it('ignores duplicate events', () => {
    const projection = applyTaskEvent(replaceTaskSnapshot(snapshot), event(1, 'task.status_changed', { status: 'running' }))
    expect(getEventDisposition(projection, event(1, 'task.status_changed', { status: 'running' }))).toBe('duplicate')
    expect(applyTaskEvent(projection, event(1, 'task.status_changed', { status: 'running' }))).toBe(projection)
  })

  it('detects a sequence gap without mutation', () => {
    const projection = applyTaskEvent(replaceTaskSnapshot(snapshot), event(1, 'task.status_changed', { status: 'running' }))
    const skipped = event(3, 'approval.required')
    expect(getTaskEventGap(projection, skipped)).toEqual({ taskId: 'task-1', expectedSequence: 2, receivedSequence: 3 })
    expect(applyTaskEvent(projection, skipped)).toBe(projection)
  })

  it('maps approval and result events to generic lifecycle state', () => {
    const waiting = applyTaskEvent(replaceTaskSnapshot(snapshot), event(1, 'approval.required'))
    const complete = applyTaskEvent(waiting, event(2, 'result.ready', { result: { summary: 'Complete', data: {}, evidence: [], artifacts: [], actions: [] } }))
    expect(waiting.snapshot.status).toBe('waiting_approval')
    expect(complete.snapshot.status).toBe('completed')
    expect(complete.snapshot.result?.summary).toBe('Complete')
  })
})
