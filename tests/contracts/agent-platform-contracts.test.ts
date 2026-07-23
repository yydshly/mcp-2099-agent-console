import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import agentEvent from '../../contracts/agent-platform/v1/schemas/agent-event.schema.json'
import customerRefundProfile from '../../contracts/agent-platform/v1/fixtures/customer-refund.profile.json'
import openapi from '../../contracts/agent-platform/v1/openapi.json'
import taskRequest from '../../contracts/agent-platform/v1/schemas/task-request.schema.json'
import taskSnapshot from '../../contracts/agent-platform/v1/schemas/task-snapshot.schema.json'
import taskAction from '../../contracts/agent-platform/v1/schemas/task-action.schema.json'

describe('Agent Platform v1 contracts', () => {
  it('requires idempotency for task creation', () => {
    expect(taskRequest.required).toContain('requestId')
  })

  it('requires ordered event metadata', () => {
    expect(agentEvent.required).toEqual(expect.arrayContaining([
      'id', 'sequence', 'taskId', 'occurredAt', 'type', 'payload',
    ]))
  })

  it('defines the v1 command, query, and event routes', () => {
    expect(Object.keys(openapi.paths)).toEqual(expect.arrayContaining([
      '/v1/profiles',
      '/v1/tasks',
      '/v1/tasks/{taskId}',
      '/v1/tasks/{taskId}/actions',
      '/v1/tasks/{taskId}/events',
      '/v1/tasks/{taskId}/logs',
    ]))
  })

  it('keeps customer fields inside the profile fixture', () => {
    expect(customerRefundProfile.inputSchema.properties).toHaveProperty('orderId')
    expect(taskSnapshot.properties).not.toHaveProperty('orderId')
    expect(taskSnapshot.properties).not.toHaveProperty('customerId')
  })

  it('defines pause and resume as generic operator actions', () => {
    expect(taskAction.properties.action.enum).toEqual(expect.arrayContaining(['pause', 'resume']))
    expect(taskSnapshot.properties.status.enum).toContain('paused')
  })

  it('persists task options in a snapshot for refresh recovery', () => {
    expect(taskSnapshot.required).toContain('options')
    expect(taskSnapshot.properties.options.required).toEqual(['priority', 'approvalPolicy'])
  })

  it('validates the published contract package', () => {
    expect(() => execFileSync(process.execPath, ['scripts/validate-agent-contracts.mjs'], { stdio: 'pipe' })).not.toThrow()
  })
})
