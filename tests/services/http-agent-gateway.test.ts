import { describe, expect, it, vi } from 'vitest'
import { HttpAgentGateway } from '../../src/services/http-agent-gateway'

describe('HttpAgentGateway', () => {
  it('maps Contract v1 endpoints and injects externally acquired bearer tokens', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    const gateway = new HttpAgentGateway({ baseUrl: 'https://agent.example/', fetcher: fetcher as typeof fetch, getAccessToken: async () => 'token-value' })
    await gateway.listProfiles()
    expect(fetcher).toHaveBeenCalledWith('https://agent.example/v1/profiles', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token-value' }) }))
  })

  it('normalizes permission failures at the adapter boundary', async () => {
    const gateway = new HttpAgentGateway({ baseUrl: 'https://agent.example', fetcher: (async () => new Response('Forbidden', { status: 403 })) as typeof fetch })
    await expect(gateway.listTasks()).rejects.toMatchObject({ code: 'PERMISSION_DENIED' })
  })
})
