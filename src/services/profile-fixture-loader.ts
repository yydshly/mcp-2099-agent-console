import customerRefundFixture from '../../contracts/agent-platform/v1/fixtures/customer-refund.profile.json'
import type { AgentProfile } from '../domain/agent-contract'

const contractFixtures: AgentProfile[] = [customerRefundFixture as unknown as AgentProfile]

export function loadContractProfileFixtures(): AgentProfile[] {
  return contractFixtures.map((profile) => structuredClone(profile))
}
