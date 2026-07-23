import { describe, expect, it } from 'vitest'
import { AgentGatewayError } from '../../src/services/agent-gateway'
import { getRuntimeErrorPresentation } from '../../src/ui/runtime-error-presentation'

describe('getRuntimeErrorPresentation', () => {
  it.each([
    ['TIMEOUT', 'runtime.timeout', 'runtime.timeoutDetail'],
    ['NETWORK_UNAVAILABLE', 'runtime.network', 'runtime.networkDetail'],
    ['PERMISSION_DENIED', 'runtime.permission', 'runtime.permissionDetail'],
    ['TASK_FAILED', 'runtime.taskFailed', 'runtime.taskFailedDetail'],
  ] as const)('maps %s to stable locale keys', (code, title, detail) => {
    expect(getRuntimeErrorPresentation(new AgentGatewayError(code, 'internal detail'))).toEqual({ title, detail })
  })

  it('falls back to a safe interruption message for unknown errors', () => {
    expect(getRuntimeErrorPresentation(new Error('fetch implementation detail'))).toEqual({ title: 'runtime.interrupted', detail: 'runtime.unavailableDetail' })
  })
})
