import { describe, expect, it } from 'vitest'
import { AgentGatewayError } from '../../src/services/agent-gateway'
import { runGatewayRequest } from '../../src/services/gateway-request'

describe('runGatewayRequest', () => {
  it('returns successful gateway responses', async () => {
    await expect(runGatewayRequest(async () => 'ready', 'Test operation', 50)).resolves.toBe('ready')
  })

  it('normalizes request deadlines to a stable timeout code', async () => {
    const stalled = () => new Promise<string>(() => undefined)
    await expect(runGatewayRequest(stalled, 'Stalled operation', 5)).rejects.toMatchObject<Partial<AgentGatewayError>>({ code: 'TIMEOUT' })
  })

  it('normalizes transport TypeErrors without leaking implementation details', async () => {
    await expect(runGatewayRequest(async () => { throw new TypeError('fetch failed') }, 'Remote operation', 50)).rejects.toMatchObject<Partial<AgentGatewayError>>({ code: 'NETWORK_UNAVAILABLE' })
  })
})
