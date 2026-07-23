import type { AgentEvent, AgentProfile, AgentRun, AuditRecord, CreateAuditRecordCommand, CreateTaskCommand, QueueActionCommand, QueueSnapshot, TaskActionCommand, TaskResult, TaskSnapshot } from '../domain/agent-contract'
import { AgentGatewayError, type AgentGateway } from './agent-gateway'
import { InMemoryEventStream } from './event-stream'
import { localProfileCatalog } from './local-profile-catalog'
import { createLocalMockScenarioState, type LocalMockScenario } from './local-mock-scenarios'

const now = () => new Date().toISOString()

export class MockAgentGateway implements AgentGateway {
  readonly eventStream = new InMemoryEventStream()
  private taskIndex = 0
  private eventIndex = 0
  private readonly tasks = new Map<string, TaskSnapshot>()
  private readonly requests = new Map<string, string>()
  private readonly sequences = new Map<string, number>()
  private readonly taskEvents = new Map<string, AgentEvent[]>()
  private readonly auditRecords: AuditRecord[] = []
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly queueOrder: string[] = []
  private queuePaused = false

  async listProfiles(): Promise<AgentProfile[]> { return localProfileCatalog.map((profile) => structuredClone(profile)) }
  async listTasks(): Promise<TaskSnapshot[]> { return [...this.tasks.values()].map((task) => structuredClone(task)) }
  async listTaskEvents(taskId: string): Promise<AgentEvent[]> { return structuredClone(this.taskEvents.get(taskId) ?? []) }
  async listAuditRecords(): Promise<AuditRecord[]> { return structuredClone(this.auditRecords) }
  async recordAudit(command: CreateAuditRecordCommand): Promise<AuditRecord> {
    if (!command.requestId || !command.type || !command.message) throw new AgentGatewayError('INVALID_COMMAND', 'requestId, type, and message are required')
    const record: AuditRecord = { id: `audit-local-${command.requestId}`, occurredAt: now(), actor: command.actor ?? 'local-operator', type: command.type, message: command.message, tone: command.tone ?? 'info', taskId: command.taskId, metadata: command.metadata }
    this.auditRecords.unshift(record)
    if (this.auditRecords.length > 100) this.auditRecords.length = 100
    return structuredClone(record)
  }
  async getQueue(): Promise<QueueSnapshot> { return { paused: this.queuePaused, tasks: this.queueOrder.flatMap((taskId) => { const task = this.tasks.get(taskId); return task?.status === 'queued' ? [structuredClone(task)] : [] }), updatedAt: now() } }
  async actOnQueue(command: QueueActionCommand): Promise<QueueSnapshot> {
    if (!command.requestId) throw new AgentGatewayError('INVALID_COMMAND', 'requestId is required')
    this.queuePaused = command.action === 'pause'
    if (!this.queuePaused) this.scheduleNext()
    return this.getQueue()
  }

  async getTask(taskId: string): Promise<TaskSnapshot> {
    const task = this.tasks.get(taskId)
    if (!task) throw new AgentGatewayError('NOT_FOUND', `Task ${taskId} was not found`)
    return structuredClone(task)
  }

  async loadScenario(scenario: LocalMockScenario): Promise<TaskSnapshot> {
    const state = createLocalMockScenarioState(scenario)
    this.timers.forEach((timer) => clearTimeout(timer))
    this.timers.clear()
    this.tasks.clear()
    this.requests.clear()
    this.sequences.clear()
    this.taskEvents.clear()
    this.auditRecords.length = 0
    this.queueOrder.length = 0
    this.queuePaused = state.queue.paused
    state.tasks.forEach((task) => this.tasks.set(task.id, structuredClone(task)))
    state.queue.tasks.forEach((task) => this.queueOrder.push(task.id))
    state.events.forEach((event) => {
      this.sequences.set(event.taskId, event.sequence)
      this.taskEvents.set(event.taskId, [...(this.taskEvents.get(event.taskId) ?? []), structuredClone(event)])
      this.eventStream.publish(structuredClone(event))
    })
    this.auditRecords.push(...state.auditRecords.map((record) => structuredClone(record)))
    return this.getTask(state.activeTask.id)
  }

  async createTask(command: CreateTaskCommand): Promise<TaskSnapshot> {
    if (!command.requestId || !command.profileId || !command.input) throw new AgentGatewayError('INVALID_COMMAND', 'requestId, profileId, and input are required')
    const originalTaskId = this.requests.get(command.requestId)
    if (originalTaskId) return this.getTask(originalTaskId)

    const timestamp = now()
    const approvalPolicy = command.options?.approvalPolicy ?? 'auto'
    const startsAutomatically = approvalPolicy === 'auto' && this.canStartTask()
    const entersQueue = approvalPolicy === 'auto' && !startsAutomatically
    const task: TaskSnapshot = {
      id: `task-local-${++this.taskIndex}`,
      profileId: command.profileId,
      workflowId: command.workflowId,
      status: startsAutomatically ? 'running' : entersQueue ? 'queued' : 'waiting_approval',
      progress: 0,
      input: structuredClone(command.input),
      options: { priority: command.options?.priority ?? 'standard', approvalPolicy },
      agents: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      version: 1,
    }
    this.tasks.set(task.id, task)
    this.requests.set(command.requestId, task.id)
    if (entersQueue) this.queueOrder.push(task.id)
    this.emit(task.id, 'task.created', { snapshot: task })
    if (startsAutomatically || entersQueue) this.emit(task.id, 'task.status_changed', { status: task.status, progress: 0 })
    if (startsAutomatically) this.deferExecution(task.id)
    return structuredClone(task)
  }

  async actOnTask(taskId: string, command: TaskActionCommand): Promise<TaskSnapshot> {
    if (!command.requestId) throw new AgentGatewayError('INVALID_COMMAND', 'requestId is required')
    const current = await this.getTask(taskId)
    if (command.action === 'reprioritize') {
      if (current.status !== 'queued' || command.queuePosition === undefined) throw new AgentGatewayError('INVALID_ACTION', 'reprioritize requires a queued task and queuePosition')
      this.removeFromQueue(taskId)
      const target = Math.max(0, Math.min(command.queuePosition, this.queueOrder.length))
      this.queueOrder.splice(target, 0, taskId)
      return this.getTask(taskId)
    }

    let nextStatus: TaskSnapshot['status']
    if (command.action === 'cancel' && ['queued', 'running', 'paused', 'waiting_approval'].includes(current.status)) nextStatus = 'cancelled'
    else if (command.action === 'pause' && current.status === 'running') nextStatus = 'paused'
    else if (command.action === 'resume' && current.status === 'paused') nextStatus = 'running'
    else if (command.action === 'approve' && current.status === 'waiting_approval') nextStatus = this.canStartTask() ? 'running' : 'queued'
    else if (command.action === 'reject' && current.status === 'waiting_approval') nextStatus = 'cancelled'
    else if (command.action === 'retry' && ['failed', 'cancelled'].includes(current.status)) nextStatus = this.canStartTask() ? 'running' : 'queued'
    else throw new AgentGatewayError('INVALID_ACTION', `${command.action} is not valid while task is ${current.status}`)

    const updated: TaskSnapshot = { ...current, status: nextStatus, updatedAt: now(), version: current.version + 1 }
    this.tasks.set(taskId, updated)
    if (nextStatus === 'queued') this.enqueue(taskId)
    else this.removeFromQueue(taskId)
    this.emit(taskId, 'task.status_changed', { status: nextStatus, progress: updated.progress, action: command.action })
    if (command.action === 'pause' || command.action === 'cancel') this.clearExecution(taskId)
    if (command.action === 'pause') this.replaceRunningAgents(taskId, 'waiting')
    if (command.action === 'resume') this.replaceWaitingAgents(taskId)
    if (nextStatus === 'running') this.deferExecution(taskId)
    if (command.action === 'cancel' || command.action === 'reject') this.scheduleNext()
    return this.getTask(taskId)
  }

  private canStartTask(): boolean { return !this.queuePaused && ![...this.tasks.values()].some((task) => task.status === 'running' || task.status === 'paused') }
  private enqueue(taskId: string): void { if (!this.queueOrder.includes(taskId)) this.queueOrder.push(taskId) }
  private removeFromQueue(taskId: string): void { const index = this.queueOrder.indexOf(taskId); if (index >= 0) this.queueOrder.splice(index, 1) }
  private scheduleNext(): void {
    if (!this.canStartTask()) return
    while (this.queueOrder.length > 0) {
      const taskId = this.queueOrder.shift()
      if (!taskId) return
      const task = this.tasks.get(taskId)
      if (!task || task.status !== 'queued') continue
      const running: TaskSnapshot = { ...task, status: 'running', updatedAt: now(), version: task.version + 1 }
      this.tasks.set(taskId, running)
      this.emit(taskId, 'task.status_changed', { status: 'running', progress: running.progress, action: 'queue.advance' })
      this.deferExecution(taskId)
      return
    }
  }

  private deferExecution(taskId: string): void {
    this.clearExecution(taskId)
    this.timers.set(taskId, setTimeout(() => this.runExecutionStep(taskId), 120))
  }

  private runExecutionStep(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== 'running') return
    const profile = localProfileCatalog.find((candidate) => candidate.id === task.profileId)
    const roles = profile?.workflow.allowedRoles ?? ['orchestrator']
    const completedCount = task.agents.filter((agent) => agent.status === 'completed').length
    if (completedCount >= roles.length) {
      this.completeTask(taskId)
      return
    }

    const role = roles[completedCount]
    const runningAgent: AgentRun = {
      id: `${taskId}-agent-${completedCount + 1}`,
      taskId,
      role,
      label: role.replace(/[_-]/g, ' ').toUpperCase(),
      status: 'running',
      progress: 12,
      dependsOn: completedCount === 0 ? [] : [`${taskId}-agent-${completedCount}`],
      startedAt: now(),
    }
    this.replaceAgent(taskId, runningAgent)
    this.emit(taskId, 'agent.started', { agent: runningAgent })
    this.timers.set(taskId, setTimeout(() => this.completeExecutionStep(taskId, runningAgent.id, roles.length), 520))
  }

  private completeExecutionStep(taskId: string, agentId: string, totalSteps: number): void {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== 'running') return
    const existing = task.agents.find((agent) => agent.id === agentId)
    if (!existing) return
    const completedAgent: AgentRun = { ...existing, status: 'completed', progress: 100, summary: 'Bounded step completed by local mock runtime.', finishedAt: now() }
    const progress = Math.round((task.agents.filter((agent) => agent.status === 'completed').length + 1) / totalSteps * 92)
    this.replaceAgent(taskId, completedAgent, progress)
    this.emit(taskId, 'agent.completed', { agent: completedAgent })
    this.emit(taskId, 'task.status_changed', { status: 'running', progress })
    this.timers.set(taskId, setTimeout(() => this.runExecutionStep(taskId), 180))
  }

  private completeTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    const profile = localProfileCatalog.find((candidate) => candidate.id === task.profileId)
    const result: TaskResult = {
      summary: `${profile?.name ?? task.profileId} completed through the generic Local Mock runtime.`,
      data: this.createSchemaResult(profile),
      evidence: [{ label: 'Contract v1 execution trace', source: 'local-mock' }],
      artifacts: [],
      actions: profile?.actions?.flatMap((action, index) => typeof action.id === 'string' && typeof action.label === 'string' ? [{ id: action.id, label: action.label, kind: index === 0 ? 'primary' as const : 'secondary' as const }] : []) ?? [{ id: 'acknowledge', label: 'Acknowledge', kind: 'primary' }],
    }
    const completed: TaskSnapshot = { ...task, status: 'completed', progress: 100, result, updatedAt: now(), version: task.version + 1 }
    this.tasks.set(taskId, completed)
    this.emit(taskId, 'result.ready', { result })
    this.clearExecution(taskId)
    this.scheduleNext()
  }

  private createSchemaResult(profile: AgentProfile | undefined): Record<string, unknown> {
    const schema = profile?.resultSchema as { properties?: Record<string, { type?: unknown; enum?: unknown; default?: unknown }> }
    return Object.fromEntries(Object.entries(schema.properties ?? {}).map(([key, property]) => {
      if (property.default !== undefined) return [key, property.default]
      if (Array.isArray(property.enum) && property.enum.length > 0) return [key, property.enum[0]]
      if (property.type === 'boolean') return [key, true]
      if (property.type === 'number' || property.type === 'integer') return [key, 0]
      return [key, `${key.replace(/([a-z0-9])([A-Z])/g, '$1 $2')} generated by the selected Profile fixture.`]
    }))
  }

  private replaceRunningAgents(taskId: string, status: AgentRun['status']): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    const agents = task.agents.map((agent) => agent.status === 'running' ? { ...agent, status } : agent)
    this.tasks.set(taskId, { ...task, agents, updatedAt: now(), version: task.version + 1 })
  }

  private replaceWaitingAgents(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    const agents = task.agents.map((agent) => agent.status === 'waiting' ? { ...agent, status: 'running' as const } : agent)
    this.tasks.set(taskId, { ...task, agents, updatedAt: now(), version: task.version + 1 })
  }

  private replaceAgent(taskId: string, agent: AgentRun, progress?: number): void {
    const task = this.tasks.get(taskId)
    if (!task) return
    const index = task.agents.findIndex((entry) => entry.id === agent.id)
    const agents = index < 0 ? [...task.agents, agent] : task.agents.map((entry, entryIndex) => entryIndex === index ? agent : entry)
    this.tasks.set(taskId, { ...task, agents, progress: progress ?? task.progress, updatedAt: now(), version: task.version + 1 })
  }

  private clearExecution(taskId: string): void {
    const timer = this.timers.get(taskId)
    if (timer) clearTimeout(timer)
    this.timers.delete(taskId)
  }

  private emit(taskId: string, type: AgentEvent['type'], payload: Record<string, unknown>): void {
    const sequence = (this.sequences.get(taskId) ?? 0) + 1
    this.sequences.set(taskId, sequence)
    const event: AgentEvent = { id: `event-local-${++this.eventIndex}`, sequence, taskId, occurredAt: now(), type, payload }
    this.taskEvents.set(taskId, [...(this.taskEvents.get(taskId) ?? []), event])
    this.eventStream.publish(event)
  }
}
