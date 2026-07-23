import { describe, expect, it, vi } from 'vitest'
import { AgentGatewayError } from '../../src/services/agent-gateway'
import { MockAgentGateway } from '../../src/services/mock-agent-gateway'

describe('MockAgentGateway', () => {
  it('exposes profile configuration only through the generic gateway boundary', async () => {
    const gateway = new MockAgentGateway()
    const profiles = await gateway.listProfiles()
    expect(profiles.length).toBeGreaterThan(0)
    expect(profiles.every((profile) => profile.inputSchema && profile.workflow.id)).toBe(true)
    profiles[0].name = 'mutated by caller'
    expect((await gateway.listProfiles())[0].name).not.toBe('mutated by caller')
    const refundFixture = (await gateway.listProfiles()).find((profile) => profile.id === 'customer-refund')
    expect(refundFixture?.inputSchema).toMatchObject({ required: ['customerId', 'orderId', 'request', 'channel'] })
  })

  it('validates commands and preserves idempotent requests', async () => {
    const gateway = new MockAgentGateway()
    await expect(gateway.createTask({ requestId: '', profileId: 'profile', input: {} })).rejects.toMatchObject<Partial<AgentGatewayError>>({ code: 'INVALID_COMMAND' })
    const command = { requestId: 'request-1', profileId: 'profile', input: { reference: 'value' } }
    const first = await gateway.createTask(command)
    const second = await gateway.createTask(command)
    expect(first.id).toBe(second.id)
    expect(first.status).toBe('running')
  })

  it('enforces generic task actions and emits ordered events', async () => {
    const gateway = new MockAgentGateway()
    const events: number[] = []
    const task = await gateway.createTask({ requestId: 'request-2', profileId: 'profile', input: {} })
    const unsubscribe = gateway.eventStream.subscribe(task.id, (event) => events.push(event.sequence), () => undefined)
    await gateway.actOnTask(task.id, { requestId: 'action-1', action: 'cancel' })
    await expect(gateway.actOnTask(task.id, { requestId: 'action-2', action: 'approve' })).rejects.toMatchObject<Partial<AgentGatewayError>>({ code: 'INVALID_ACTION' })
    unsubscribe()
    expect(events).toEqual([3])
  })

  it('supports backend-owned pause and resume transitions', async () => {
    const gateway = new MockAgentGateway()
    const task = await gateway.createTask({ requestId: 'request-3', profileId: 'profile', input: {}, options: { approvalPolicy: 'auto' } })
    const paused = await gateway.actOnTask(task.id, { requestId: 'action-3', action: 'pause' })
    const resumed = await gateway.actOnTask(task.id, { requestId: 'action-4', action: 'resume' })
    expect(paused.status).toBe('paused')
    expect(resumed.status).toBe('running')
  })

  it('owns one-active-task scheduling, queue hold, resume, and ordering', async () => {
    const gateway = new MockAgentGateway()
    const first = await gateway.createTask({ requestId: 'queue-1', profileId: 'operations', input: { objective: 'First' } })
    const second = await gateway.createTask({ requestId: 'queue-2', profileId: 'operations', input: { objective: 'Second' } })
    const third = await gateway.createTask({ requestId: 'queue-3', profileId: 'operations', input: { objective: 'Third' } })
    expect(first.status).toBe('running')
    expect(second.status).toBe('queued')
    expect((await gateway.getQueue()).tasks.map((task) => task.id)).toEqual([second.id, third.id])

    await gateway.actOnTask(third.id, { requestId: 'queue-move', action: 'reprioritize', queuePosition: 0 })
    expect((await gateway.getQueue()).tasks.map((task) => task.id)).toEqual([third.id, second.id])

    await gateway.actOnQueue({ requestId: 'queue-pause', action: 'pause' })
    await gateway.actOnTask(first.id, { requestId: 'queue-cancel', action: 'cancel' })
    expect((await gateway.getTask(third.id)).status).toBe('queued')
    await gateway.actOnQueue({ requestId: 'queue-resume', action: 'resume' })
    expect((await gateway.getTask(third.id)).status).toBe('running')
  })

  it('stores ordered task events and operator audit records behind the gateway', async () => {
    const gateway = new MockAgentGateway()
    const task = await gateway.createTask({ requestId: 'ledger-task', profileId: 'operations', input: { objective: 'Inspect ledger' } })
    const record = await gateway.recordAudit({ requestId: 'ledger-audit', type: 'TASK VIEWED', message: 'Operator opened the task.', tone: 'info', taskId: task.id })
    expect((await gateway.listTaskEvents(task.id)).map((event) => event.sequence)).toEqual([1, 2])
    expect(await gateway.listAuditRecords()).toEqual([record])
  })

  it('replaces Local Mock projections when a scenario is loaded', async () => {
    const gateway = new MockAgentGateway()
    const loaded = await gateway.loadScenario('failed')
    expect(loaded.status).toBe('failed')
    expect((await gateway.getQueue()).tasks).toEqual([])
    expect((await gateway.listTaskEvents(loaded.id)).at(-1)?.type).toBe('agent.failed')
    expect((await gateway.listAuditRecords())[0].type).toBe('SCENARIO LOADED')
  })

  it('executes a business fixture through the generic profile runtime', async () => {
    vi.useFakeTimers()
    try {
      const gateway = new MockAgentGateway()
      const task = await gateway.createTask({
        requestId: 'refund-fixture',
        profileId: 'customer-refund',
        input: {
          customerId: 'CUS-2049',
          orderId: 'ORD-8821',
          request: 'Refund the duplicate charge and prepare a customer response.',
          channel: 'email',
        },
        options: { approvalPolicy: 'auto', priority: 'standard' },
      })

      await vi.runAllTimersAsync()

      const completedTask = await gateway.getTask(task.id)
      expect(completedTask.status).toBe('completed')
      expect(completedTask.result?.data).toMatchObject({ decision: 'approved' })
      expect(completedTask.result?.actions.map((action) => action.id)).toEqual(['send-response', 'create-ticket'])
    } finally {
      vi.useRealTimers()
    }
  })
})
