import { describe, expect, it } from 'vitest'
import { getLocalMockScenarioCapability } from '../../src/services/local-mock-scenario-capability'

describe('local mock scenario capability', () => {
  it('detects an optional scenario loader without widening AgentGateway', () => {
    const loader = async () => ({})
    expect(getLocalMockScenarioCapability({ loadScenario: loader })?.loadScenario).toBe(loader)
    expect(getLocalMockScenarioCapability({})).toBeNull()
    expect(getLocalMockScenarioCapability(null)).toBeNull()
  })
})
