import type { AgentEvent, AgentProfile, AuditRecord, CreateAuditRecordCommand, CreateTaskCommand, QueueActionCommand, QueueSnapshot, TaskActionCommand, TaskSnapshot } from '../domain/agent-contract'

export class AgentGatewayError extends Error {
  readonly code: AgentGatewayErrorCode
  readonly retryAfterMs?: number

  constructor(code: AgentGatewayErrorCode, message: string, retryAfterMs?: number) {
    super(message)
    this.name = 'AgentGatewayError'
    this.code = code
    this.retryAfterMs = retryAfterMs
  }
}

export type AgentGatewayErrorCode = 'INVALID_COMMAND' | 'NOT_FOUND' | 'INVALID_ACTION' | 'UNAVAILABLE' | 'NETWORK_UNAVAILABLE' | 'TIMEOUT' | 'PERMISSION_DENIED' | 'TASK_FAILED'

export interface AgentGateway {
  listProfiles(): Promise<AgentProfile[]>
  createTask(command: CreateTaskCommand): Promise<TaskSnapshot>
  getTask(taskId: string): Promise<TaskSnapshot>
  listTasks(): Promise<TaskSnapshot[]>
  listTaskEvents(taskId: string): Promise<AgentEvent[]>
  listAuditRecords(): Promise<AuditRecord[]>
  recordAudit(command: CreateAuditRecordCommand): Promise<AuditRecord>
  getQueue(): Promise<QueueSnapshot>
  actOnQueue(command: QueueActionCommand): Promise<QueueSnapshot>
  actOnTask(taskId: string, command: TaskActionCommand): Promise<TaskSnapshot>
}
