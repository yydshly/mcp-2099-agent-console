export type TaskStatus = 'queued' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'
export type AgentRunStatus = 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled'
export type TaskAction = 'approve' | 'reject' | 'cancel' | 'retry' | 'pause' | 'resume' | 'reprioritize'
export type AgentEventType = 'task.created' | 'task.status_changed' | 'agent.started' | 'agent.progressed' | 'agent.completed' | 'agent.failed' | 'approval.required' | 'result.ready'

export interface CreateTaskCommand {
  requestId: string
  profileId: string
  workflowId?: string
  input: Record<string, unknown>
  options?: { priority?: 'standard' | 'high' | 'urgent'; approvalPolicy?: 'auto' | 'required' }
}

export interface TaskActionCommand { requestId: string; action: TaskAction; reason?: string; queuePosition?: number }
export interface AgentRun { id: string; taskId: string; parentId?: string; role: string; label: string; status: AgentRunStatus; progress: number; dependsOn: string[]; summary?: string; startedAt?: string; finishedAt?: string }
export interface TaskResult { summary: string; data: Record<string, unknown>; evidence: Array<{ label: string; source: string; url?: string }>; artifacts: Array<{ id: string; name: string; mediaType: string; url?: string }>; actions: Array<{ id: string; label: string; kind?: 'primary' | 'secondary' | 'danger' }> }
export interface TaskSnapshot { id: string; profileId: string; workflowId?: string; status: TaskStatus; progress: number; input: Record<string, unknown>; options: { priority: 'standard' | 'high' | 'urgent'; approvalPolicy: 'auto' | 'required' }; agents: AgentRun[]; result?: TaskResult; createdAt: string; updatedAt: string; version: number }
export interface AgentEvent { id: string; sequence: number; taskId: string; occurredAt: string; type: AgentEventType; payload: Record<string, unknown> }
export interface AgentProfile { id: string; version: string; name: string; description: string; inputSchema: Record<string, unknown>; uiSchema?: Record<string, unknown>; resultSchema: Record<string, unknown>; workflow: { id: string; version: string; allowedRoles: string[] }; metrics?: Array<Record<string, unknown>>; actions?: Array<Record<string, unknown>> }
export interface TaskEventGap { taskId: string; expectedSequence: number; receivedSequence: number }
export interface TaskProjection { snapshot: TaskSnapshot; lastSequence: number; eventIds: ReadonlySet<string> }
export interface QueueSnapshot { paused: boolean; tasks: TaskSnapshot[]; updatedAt: string }
export interface QueueActionCommand { requestId: string; action: 'pause' | 'resume' }
export type AuditTone = 'info' | 'success' | 'warning' | 'danger'
export interface AuditRecord { id: string; occurredAt: string; actor: string; type: string; message: string; tone: AuditTone; taskId?: string; metadata?: Record<string, unknown> }
export interface CreateAuditRecordCommand { requestId: string; actor?: string; type: string; message: string; tone?: AuditTone; taskId?: string; metadata?: Record<string, unknown> }
