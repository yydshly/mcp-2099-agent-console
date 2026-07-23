import type { TaskSnapshot } from '../domain/agent-contract'
import type { AgentActivity, AgentPhase, AgentTask, DispatchRequest, TaskPriority } from '../domain/agent'

const legacyPriority: Record<TaskSnapshot['options']['priority'], TaskPriority> = { standard: 'standard', high: 'priority', urgent: 'critical' }

function phaseForSnapshot(task: TaskSnapshot): AgentPhase {
  if (task.status === 'queued') return 'idle'
  if (task.status === 'waiting_approval' || task.status === 'paused') return 'paused'
  if (task.status === 'completed') return 'complete'
  if (task.status === 'failed') return 'failed'
  if (task.status === 'cancelled') return 'cancelled'
  const completed = task.agents.filter((agent) => agent.status === 'completed').length
  if (completed === 0) return 'calibrating'
  if (completed === 1) return 'routing'
  if (completed === 2) return 'executing'
  return 'synthesizing'
}

function requestForSnapshot(task: TaskSnapshot): DispatchRequest {
  const { objective, ...contextInput } = task.input
  const fallbackObjective = Object.values(task.input)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .sort((left, right) => right.trim().length - left.trim().length)[0]
  return {
    profile: task.profileId as DispatchRequest['profile'],
    objective: typeof objective === 'string' ? objective : typeof fallbackObjective === 'string' ? fallbackObjective : 'Execute the selected Profile workflow.',
    priority: legacyPriority[task.options.priority],
    requiresApproval: task.options.approvalPolicy === 'required',
    context: Object.fromEntries(Object.entries(contextInput).flatMap(([key, value]) => typeof value === 'string' ? [[key, value]] : [])),
  }
}

function activitiesForSnapshot(task: TaskSnapshot): AgentActivity[] {
  return [...task.agents].reverse().slice(0, 5).map((agent) => ({
    id: agent.id,
    time: (agent.finishedAt ?? agent.startedAt ?? task.updatedAt).slice(11, 19),
    label: agent.label,
    detail: agent.summary ?? `${agent.role.replace(/[_-]/g, ' ')} ${agent.status}`,
    tone: agent.status === 'completed' ? 'success' : agent.status === 'failed' ? 'signal' : 'neutral',
  }))
}

export function createLegacyAgentTask(snapshot: TaskSnapshot | null): AgentTask {
  if (!snapshot) return { phase: 'idle', progress: 0, activities: [], request: null }
  const phase = phaseForSnapshot(snapshot)
  const checkpointPhase = snapshot.status === 'paused' ? phaseForSnapshot({ ...snapshot, status: 'running' }) : undefined
  return { phase, checkpointPhase: checkpointPhase === 'calibrating' || checkpointPhase === 'routing' || checkpointPhase === 'executing' || checkpointPhase === 'synthesizing' ? checkpointPhase : undefined, progress: snapshot.progress, activities: activitiesForSnapshot(snapshot), request: requestForSnapshot(snapshot) }
}
