import { describe, expect, it } from 'vitest'
import { createLocalMockScenarioState, localMockScenarioOptions } from '../../src/services/local-mock-scenarios'

describe('local mock scenarios', () => {
  it.each(['queued', 'running', 'paused', 'waiting_approval', 'completed', 'failed', 'cancelled'] as const)('creates a deterministic %s fixture', (scenario) => {
    const state = createLocalMockScenarioState(scenario)
    expect(state.activeTask.status).toBe(scenario)
    expect(state.events).toHaveLength(2)
    expect(state.auditRecords[0].type).toBe('SCENARIO LOADED')
  })

  it('keeps the queue scenario visible in the queue snapshot', () => {
    expect(createLocalMockScenarioState('queued').queue.tasks).toHaveLength(1)
    expect(localMockScenarioOptions).toHaveLength(7)
  })
})
