import { describe, expect, it } from 'vitest'
import type { AgentProfile, TaskSnapshot } from '../../src/domain/agent-contract'
import { createIdleTaskViewModel, createTaskViewModel, getTaskStatePresentation } from '../../src/domain/task-view-model'

const profile: AgentProfile = {
  id: 'profile-1', version: '1.0.0', name: 'Operations profile', description: 'Generic fixture', inputSchema: {}, resultSchema: {}, workflow: { id: 'workflow-1', version: '1.0.0', allowedRoles: ['planner'] },
}

const task: TaskSnapshot = {
  id: 'task-1', profileId: 'profile-1', status: 'completed', progress: 100,
  input: { objective: 'Prepare an operator-ready outcome', referenceCode: 'REF-1', ignoredObject: { unsafe: true } }, options: { priority: 'standard', approvalPolicy: 'auto' },
  agents: [{ id: 'agent-1', taskId: 'task-1', role: 'planner', label: 'Route plan', status: 'completed', progress: 100, dependsOn: [] }],
  result: { summary: 'Outcome ready', data: {}, evidence: [], artifacts: [], actions: [{ id: 'acknowledge', label: 'Acknowledge', kind: 'primary' }] },
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', version: 1,
}

describe('task view model', () => {
  it('creates an empty business-neutral idle model', () => {
    expect(createIdleTaskViewModel()).toMatchObject({ id: null, state: 'idle', agents: [], inputSummary: [] })
  })

  it('maps a snapshot without inheriting business fields into its contract', () => {
    const model = createTaskViewModel(task, profile)
    expect(model).toMatchObject({ profileLabel: 'Operations profile', state: 'complete', objective: 'Prepare an operator-ready outcome', resultSummary: 'Outcome ready' })
    expect(model.inputSummary).toEqual([{ label: 'REFERENCE CODE', value: 'REF-1' }])
    expect(model.agents).toEqual([expect.objectContaining({ role: 'planner', status: 'completed' })])
  })

  it('uses the most descriptive text input when a profile has no objective field', () => {
    const model = createTaskViewModel({ ...task, input: { customerId: 'CUS-1', request: 'Refund the duplicate customer charge.', channel: 'email' } }, profile)
    expect(model.objective).toBe('Refund the duplicate customer charge.')
    expect(model.inputSummary).toEqual([{ label: 'CUSTOMER ID', value: 'CUS-1' }, { label: 'CHANNEL', value: 'email' }])
  })

  it.each([
    ['queued', 'QUEUED', false, true],
    ['running', 'LIVE', true, true],
    ['paused', 'HOLD', false, true],
    ['waiting_approval', 'APPROVAL', false, true],
    ['completed', 'COMPLETE', false, false],
    ['failed', 'FAILED', false, false],
    ['cancelled', 'CANCELLED', false, false],
  ] as const)('keeps %s controls and labels consistent across panels', (status, traceLabel, isActive, canCancel) => {
    const presentation = getTaskStatePresentation({ ...task, status })
    expect(presentation).toMatchObject({ traceLabel, isActive, canCancel })
  })
})
