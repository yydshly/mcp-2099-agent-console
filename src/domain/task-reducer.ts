import type { AgentEvent, AgentRun, TaskEventGap, TaskProjection, TaskResult, TaskSnapshot } from './agent-contract'

export type EventDisposition = 'apply' | 'duplicate' | 'gap'

export function replaceTaskSnapshot(snapshot: TaskSnapshot): TaskProjection {
  return { snapshot, lastSequence: 0, eventIds: new Set() }
}

export function getEventDisposition(projection: TaskProjection, event: AgentEvent): EventDisposition {
  if (projection.eventIds.has(event.id)) return 'duplicate'
  if (projection.lastSequence > 0 && event.sequence > projection.lastSequence + 1) return 'gap'
  return 'apply'
}

export function getTaskEventGap(projection: TaskProjection, event: AgentEvent): TaskEventGap | null {
  return getEventDisposition(projection, event) === 'gap'
    ? { taskId: event.taskId, expectedSequence: projection.lastSequence + 1, receivedSequence: event.sequence }
    : null
}

const asRecord = (value: unknown): Record<string, unknown> => typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
const asAgent = (value: unknown): AgentRun | null => {
  const candidate = asRecord(value)
  return typeof candidate.id === 'string' && typeof candidate.status === 'string' ? candidate as unknown as AgentRun : null
}
const asResult = (value: unknown): TaskResult | null => {
  const candidate = asRecord(value)
  return typeof candidate.summary === 'string' && typeof candidate.data === 'object' ? candidate as unknown as TaskResult : null
}

export function applyTaskEvent(projection: TaskProjection, event: AgentEvent): TaskProjection {
  if (event.taskId !== projection.snapshot.id || getEventDisposition(projection, event) !== 'apply') return projection

  const payload = event.payload
  const snapshot = { ...projection.snapshot, updatedAt: event.occurredAt }
  const agent = asAgent(payload.agent)

  if (event.type === 'task.status_changed') {
    const status = payload.status
    if (typeof status === 'string') snapshot.status = status as TaskSnapshot['status']
    if (typeof payload.progress === 'number') snapshot.progress = payload.progress
  }
  if (event.type === 'approval.required') snapshot.status = 'waiting_approval'
  if (agent) {
    const index = snapshot.agents.findIndex((entry) => entry.id === agent.id)
    snapshot.agents = index < 0 ? [...snapshot.agents, agent] : snapshot.agents.map((entry, entryIndex) => entryIndex === index ? agent : entry)
  }
  if (event.type === 'result.ready') {
    const result = asResult(payload.result)
    if (result) snapshot.result = result
    snapshot.status = 'completed'
    snapshot.progress = 100
  }

  return { snapshot, lastSequence: event.sequence, eventIds: new Set([...projection.eventIds, event.id]) }
}
