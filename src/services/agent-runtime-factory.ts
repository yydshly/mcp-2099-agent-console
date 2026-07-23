import { runtimeConfig } from '../config/runtime-config'
import { getAgentAccessToken } from '../config/auth-provider'
import type { AgentGateway } from './agent-gateway'
import type { EventStream } from './event-stream'
import { HttpAgentGateway } from './http-agent-gateway'
import { MockAgentGateway } from './mock-agent-gateway'
import { SseEventStream } from './sse-event-stream'

export interface AgentRuntimeAdapters { gateway: AgentGateway; eventStream: EventStream; transport: 'local-mock' | 'remote' }

export function createAgentRuntimeAdapters(): AgentRuntimeAdapters {
  if (runtimeConfig.transport === 'remote') {
    return {
      gateway: new HttpAgentGateway({ baseUrl: runtimeConfig.baseUrl, timeoutMs: runtimeConfig.requestTimeoutMs, getAccessToken: getAgentAccessToken }),
      eventStream: new SseEventStream(runtimeConfig.baseUrl),
      transport: 'remote',
    }
  }
  const gateway = new MockAgentGateway()
  return { gateway, eventStream: gateway.eventStream, transport: 'local-mock' }
}
