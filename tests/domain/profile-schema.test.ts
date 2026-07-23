import { describe, expect, it } from 'vitest'
import type { AgentProfile } from '../../src/domain/agent-contract'
import { getProfileInputFields } from '../../src/domain/profile-schema'

const profile: AgentProfile = { id: 'profile', version: '1.0.0', name: 'Profile', description: 'Fixture', inputSchema: { required: ['objective', 'region'], properties: { objective: { title: 'Task objective', format: 'textarea', default: 'Prepare outcome' }, region: { enum: ['APAC', 'EMEA'] }, freeText: { placeholder: 'Optional note' } } }, resultSchema: {}, workflow: { id: 'workflow', version: '1.0.0', allowedRoles: ['planner'] } }

describe('profile schema fields', () => {
  it('maps input schema metadata into generic form fields', () => {
    expect(getProfileInputFields(profile)).toEqual([
      expect.objectContaining({ key: 'objective', widget: 'textarea', required: true, defaultValue: 'Prepare outcome' }),
      expect.objectContaining({ key: 'region', widget: 'select', required: true, options: ['APAC', 'EMEA'] }),
      expect.objectContaining({ key: 'freeText', widget: 'input', required: false, placeholder: 'Optional note' }),
    ])
  })
})
