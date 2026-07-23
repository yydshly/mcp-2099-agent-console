import type { AgentEvent, AgentProfile, AuditRecord, CreateAuditRecordCommand, CreateTaskCommand, QueueActionCommand, QueueSnapshot, TaskActionCommand, TaskSnapshot } from '../domain/agent-contract'
import { AgentGatewayError, type AgentGateway, type AgentGatewayErrorCode } from './agent-gateway'

interface HttpAgentGatewayOptions {
  baseUrl: string
  timeoutMs?: number
  fetcher?: typeof fetch
  getAccessToken?: () => Promise<string | null>
}

const errorCodeForStatus = (status: number): AgentGatewayErrorCode => {
  if (status === 401 || status === 403) return 'PERMISSION_DENIED'
  if (status === 404) return 'NOT_FOUND'
  if (status === 408 || status === 504) return 'TIMEOUT'
  if (status === 409) return 'INVALID_ACTION'
  if (status >= 400 && status < 500) return 'INVALID_COMMAND'
  return 'UNAVAILABLE'
}

export class HttpAgentGateway implements AgentGateway {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly fetcher: typeof fetch
  private readonly getAccessToken?: () => Promise<string | null>

  constructor(options: HttpAgentGatewayOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.timeoutMs = options.timeoutMs ?? 12_000
    this.fetcher = options.fetcher ?? fetch
    this.getAccessToken = options.getAccessToken
  }

  listProfiles(): Promise<AgentProfile[]> { return this.request('/v1/profiles') }
  createTask(command: CreateTaskCommand): Promise<TaskSnapshot> { return this.request('/v1/tasks', { method: 'POST', body: JSON.stringify(command) }) }
  getTask(taskId: string): Promise<TaskSnapshot> { return this.request(`/v1/tasks/${encodeURIComponent(taskId)}`) }
  listTasks(): Promise<TaskSnapshot[]> { return this.request('/v1/tasks') }
  listTaskEvents(taskId: string): Promise<AgentEvent[]> { return this.request(`/v1/tasks/${encodeURIComponent(taskId)}/logs`) }
  listAuditRecords(): Promise<AuditRecord[]> { return this.request('/v1/audit') }
  recordAudit(command: CreateAuditRecordCommand): Promise<AuditRecord> { return this.request('/v1/audit', { method: 'POST', body: JSON.stringify(command) }) }
  getQueue(): Promise<QueueSnapshot> { return this.request('/v1/queue') }
  actOnQueue(command: QueueActionCommand): Promise<QueueSnapshot> { return this.request('/v1/queue/actions', { method: 'POST', body: JSON.stringify(command) }) }
  actOnTask(taskId: string, command: TaskActionCommand): Promise<TaskSnapshot> { return this.request(`/v1/tasks/${encodeURIComponent(taskId)}/actions`, { method: 'POST', body: JSON.stringify(command) }) }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const token = await this.getAccessToken?.()
      const response = await this.fetcher(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
      })
      if (!response.ok) {
        const message = await response.text().catch(() => '')
        throw new AgentGatewayError(errorCodeForStatus(response.status), message || `Agent API returned ${response.status}`)
      }
      return await response.json() as T
    } catch (error) {
      if (error instanceof AgentGatewayError) throw error
      if (error instanceof DOMException && error.name === 'AbortError') throw new AgentGatewayError('TIMEOUT', `Agent API request timed out after ${this.timeoutMs}ms`)
      throw new AgentGatewayError('NETWORK_UNAVAILABLE', error instanceof Error ? error.message : 'Agent API is unavailable')
    } finally {
      clearTimeout(timeout)
    }
  }
}
