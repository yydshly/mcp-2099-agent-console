import { describe, expect, it } from 'vitest'
import type { TaskSnapshot } from '../../src/domain/agent-contract'
import { createLegacyAgentTask } from '../../src/services/legacy-task-bridge'

const snapshot: TaskSnapshot = { id: 'task-1', profileId: 'operations', status: 'running', progress: 67, input: { objective: 'Prepare outcome', reference: 'REF-1' }, options: { priority: 'high', approvalPolicy: 'auto' }, agents: [{ id: 'agent-1', taskId: 'task-1', role: 'planner', label: 'PLAN', status: 'completed', progress: 100, dependsOn: [], finishedAt: '2026-01-01T12:00:00.000Z' }, { id: 'agent-2', taskId: 'task-1', role: 'executor', label: 'EXECUTE', status: 'running', progress: 12, dependsOn: ['agent-1'], startedAt: '2026-01-01T12:01:00.000Z' }], createdAt: '2026-01-01T12:00:00.000Z', updatedAt: '2026-01-01T12:01:00.000Z', version: 1 }

describe('legacy task bridge', () => {
  it('maps a generic task snapshot into the temporary presentation compatibility model', () => {
    expect(createLegacyAgentTask(snapshot)).toMatchObject({ phase: 'routing', progress: 67, request: { profile: 'operations', objective: 'Prepare outcome', priority: 'priority', context: { reference: 'REF-1' } } })
  })
})
