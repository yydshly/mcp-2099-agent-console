import type { TaskSnapshot } from '../domain/agent-contract'
import type { LocalMockScenario } from './local-mock-scenarios'

export interface LocalMockScenarioCapability {
  loadScenario: (scenario: LocalMockScenario) => Promise<TaskSnapshot>
}

export function getLocalMockScenarioCapability(value: unknown): LocalMockScenarioCapability | null {
  if (typeof value !== 'object' || value === null || !('loadScenario' in value)) return null
  return typeof value.loadScenario === 'function' ? value as LocalMockScenarioCapability : null
}
