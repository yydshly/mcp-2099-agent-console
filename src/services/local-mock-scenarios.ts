import type { AgentEvent, AgentRun, AuditRecord, QueueSnapshot, TaskResult, TaskSnapshot } from '../domain/agent-contract'

export type LocalMockScenario = 'queued' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled'

export interface LocalMockScenarioState {
  activeTask: TaskSnapshot
  tasks: TaskSnapshot[]
  events: AgentEvent[]
  auditRecords: AuditRecord[]
  queue: QueueSnapshot
}

export const localMockScenarioOptions: ReadonlyArray<{ id: LocalMockScenario; label: string; detail: string }> = [
  { id: 'queued', label: 'QUEUED', detail: 'Queue visibility and priority controls' },
  { id: 'running', label: 'RUNNING', detail: 'Live agent telemetry and task stream' },
  { id: 'paused', label: 'PAUSED', detail: 'Resume and cancel control state' },
  { id: 'waiting_approval', label: 'APPROVAL', detail: 'Human approval waiting state' },
  { id: 'completed', label: 'COMPLETE', detail: 'Result review and history state' },
  { id: 'failed', label: 'FAILED', detail: 'Failure recovery and retry state' },
  { id: 'cancelled', label: 'CANCELLED', detail: 'Operator stop and retry state' },
]

const timestamp = '2026-07-23T00:00:00.000Z'

const createAgent = (taskId: string, status: AgentRun['status'], progress: number, index = 1): AgentRun => ({
  id: `${taskId}-agent-${index}`,
  taskId,
  role: index === 1 ? 'context-retrieval' : 'response-synthesis',
  label: index === 1 ? 'CONTEXT RETRIEVAL' : 'RESPONSE SYNTHESIS',
  status,
  progress,
  dependsOn: index === 1 ? [] : [`${taskId}-agent-1`],
  startedAt: timestamp,
  ...(status === 'completed' || status === 'failed' || status === 'cancelled' ? { finishedAt: timestamp } : {}),
  ...(status === 'completed' ? { summary: 'Scenario step completed.' } : {}),
  ...(status === 'failed' ? { summary: 'Scenario step stopped with a simulated runtime fault.' } : {}),
})

const createResult = (): TaskResult => ({
  summary: 'Scenario result is ready for operator review.',
  data: { outcome: 'accepted', scenario: 'completed' },
  evidence: [{ label: 'Local acceptance trace', source: 'scenario-lab' }],
  artifacts: [],
  actions: [{ id: 'acknowledge', label: 'Acknowledge', kind: 'primary' }],
})

const scenarioProgress: Record<LocalMockScenario, number> = {
  queued: 0,
  running: 48,
  paused: 48,
  waiting_approval: 0,
  completed: 100,
  failed: 48,
  cancelled: 48,
}

export function createLocalMockScenarioState(scenario: LocalMockScenario): LocalMockScenarioState {
  const taskId = `task-scenario-${scenario}`
  const agents = scenario === 'queued' || scenario === 'waiting_approval'
    ? []
    : scenario === 'completed'
      ? [createAgent(taskId, 'completed', 100), createAgent(taskId, 'completed', 100, 2)]
      : scenario === 'failed'
        ? [createAgent(taskId, 'completed', 100), createAgent(taskId, 'failed', 48, 2)]
        : scenario === 'cancelled'
          ? [createAgent(taskId, 'completed', 100), createAgent(taskId, 'cancelled', 48, 2)]
          : [createAgent(taskId, scenario === 'paused' ? 'waiting' : 'running', 48)]
  const activeTask: TaskSnapshot = {
    id: taskId,
    profileId: 'operations',
    workflowId: 'operations-workflow-v1',
    status: scenario,
    progress: scenarioProgress[scenario],
    input: { objective: 'Validate the current interface state without a business backend.', reference: 'SCENARIO-LAB' },
    options: { priority: 'standard', approvalPolicy: scenario === 'waiting_approval' ? 'required' : 'auto' },
    agents,
    ...(scenario === 'completed' ? { result: createResult() } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  }
  const eventType: AgentEvent['type'] = scenario === 'completed' ? 'result.ready' : scenario === 'failed' ? 'agent.failed' : 'task.status_changed'
  const events: AgentEvent[] = [
    { id: `event-${scenario}-1`, sequence: 1, taskId, occurredAt: timestamp, type: 'task.created', payload: { snapshot: activeTask } },
    { id: `event-${scenario}-2`, sequence: 2, taskId, occurredAt: timestamp, type: eventType, payload: { status: scenario, progress: activeTask.progress } },
  ]
  const queue: QueueSnapshot = { paused: false, tasks: scenario === 'queued' ? [activeTask] : [], updatedAt: timestamp }
  const auditRecords: AuditRecord[] = [{ id: `audit-${scenario}`, occurredAt: timestamp, actor: 'scenario-lab', type: 'SCENARIO LOADED', message: `${scenario.toUpperCase()} fixture loaded for local interface acceptance.`, tone: 'info', taskId }]
  return { activeTask, tasks: [activeTask], events, auditRecords, queue }
}
