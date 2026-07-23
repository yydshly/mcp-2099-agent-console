import { describe, expect, it } from 'vitest'
import { loadContractProfileFixtures } from '../../src/services/profile-fixture-loader'

describe('profile fixture loader', () => {
  it('loads business fixtures without leaking their fields into generic contracts', () => {
    const profile = loadContractProfileFixtures().find((candidate) => candidate.id === 'customer-refund')
    expect(profile).toBeDefined()
    expect(profile!.workflow.allowedRoles).toEqual(['context-retrieval', 'policy-validation', 'response-synthesis', 'approval-coordination'])
    expect((profile!.inputSchema as { properties?: Record<string, unknown> }).properties).toHaveProperty('orderId')
  })

  it('returns isolated copies for adapter consumers', () => {
    const first = loadContractProfileFixtures()
    first[0].name = 'mutated'
    expect(loadContractProfileFixtures()[0].name).not.toBe('mutated')
  })
})
