import { describe, expect, it } from 'vitest'
import { createLegacyDispatchRequest } from '../../src/services/legacy-dispatch-bridge'

describe('legacy dispatch bridge', () => {
  it('keeps Contract v1 command semantics at the form boundary', () => {
    expect(createLegacyDispatchRequest({ requestId: 'request-1', profileId: 'operations', workflowId: 'workflow-1', input: { objective: 'Prepare outcome', reference: 'REF-1', ignored: 3 }, options: { priority: 'urgent', approvalPolicy: 'required' } })).toEqual({ profile: 'operations', objective: 'Prepare outcome', priority: 'critical', requiresApproval: true, context: { reference: 'REF-1' } })
  })
})
