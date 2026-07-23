export type AgentTransport = 'local-mock' | 'remote'

export interface RuntimeConfig {
  transport: AgentTransport
  baseUrl: string
  requestTimeoutMs: number
}

const env = import.meta.env as Record<string, string | undefined>

export const runtimeConfig: RuntimeConfig = {
  transport: env.VITE_AGENT_TRANSPORT === 'remote' ? 'remote' : 'local-mock',
  baseUrl: (env.VITE_AGENT_BASE_URL ?? '').replace(/\/$/, ''),
  requestTimeoutMs: Number(env.VITE_AGENT_TIMEOUT_MS) > 0 ? Number(env.VITE_AGENT_TIMEOUT_MS) : 12_000,
}
