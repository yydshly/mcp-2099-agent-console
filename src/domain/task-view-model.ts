import type { AgentProfile, AgentRun, TaskSnapshot } from './agent-contract'

export type TaskDisplayState = 'idle' | 'queued' | 'running' | 'paused' | 'waiting_approval' | 'complete' | 'failed' | 'cancelled'

export interface TaskStatePresentation {
  state: TaskDisplayState
  label: string
  traceLabel: string
  tone: string
  isActive: boolean
  isTerminal: boolean
  canPause: boolean
  canResume: boolean
  canCancel: boolean
  canRetry: boolean
}

export interface AgentRunViewModel {
  id: string
  label: string
  role: string
  status: AgentRun['status']
  progress: number
  summary?: string
  dependsOn: string[]
}

export interface TaskViewModel {
  id: string | null
  profileLabel: string
  workflowLabel: string | null
  state: TaskDisplayState
  progress: number
  objective: string | null
  inputSummary: Array<{ label: string; value: string }>
  agents: AgentRunViewModel[]
  resultSummary: string | null
  resultActions: Array<{ id: string; label: string; kind: 'primary' | 'secondary' | 'danger' }>
}

const displayState: Record<TaskSnapshot['status'], TaskDisplayState> = {
  queued: 'queued',
  running: 'running',
  paused: 'paused',
  waiting_approval: 'waiting_approval',
  completed: 'complete',
  failed: 'failed',
  cancelled: 'cancelled',
}

const statePresentation: Record<TaskDisplayState, Omit<TaskStatePresentation, 'state'>> = {
  idle: { label: 'STANDBY', traceLabel: 'IDLE', tone: 'idle', isActive: false, isTerminal: false, canPause: false, canResume: false, canCancel: false, canRetry: false },
  queued: { label: 'QUEUED', traceLabel: 'QUEUED', tone: 'queued', isActive: false, isTerminal: false, canPause: false, canResume: false, canCancel: true, canRetry: false },
  running: { label: 'COGNIZANT', traceLabel: 'LIVE', tone: 'active', isActive: true, isTerminal: false, canPause: true, canResume: false, canCancel: true, canRetry: false },
  paused: { label: 'SUSPENDED', traceLabel: 'HOLD', tone: 'paused', isActive: false, isTerminal: false, canPause: false, canResume: true, canCancel: true, canRetry: false },
  waiting_approval: { label: 'AWAITING APPROVAL', traceLabel: 'APPROVAL', tone: 'approval', isActive: false, isTerminal: false, canPause: false, canResume: false, canCancel: true, canRetry: false },
  complete: { label: 'RESULT READY', traceLabel: 'COMPLETE', tone: 'complete', isActive: false, isTerminal: true, canPause: false, canResume: false, canCancel: false, canRetry: true },
  failed: { label: 'MISSION FAILED', traceLabel: 'FAILED', tone: 'failed', isActive: false, isTerminal: true, canPause: false, canResume: false, canCancel: false, canRetry: true },
  cancelled: { label: 'MISSION HALTED', traceLabel: 'CANCELLED', tone: 'cancelled', isActive: false, isTerminal: true, canPause: false, canResume: false, canCancel: false, canRetry: true },
}

export function getTaskStatePresentation(task: TaskSnapshot | null): TaskStatePresentation {
  const state = task ? displayState[task.status] : 'idle'
  return { state, ...statePresentation[state] }
}

const formatValue = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

const title = (value: string): string => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').toUpperCase()

export function createIdleTaskViewModel(): TaskViewModel {
  return { id: null, profileLabel: 'NO PROFILE SELECTED', workflowLabel: null, state: 'idle', progress: 0, objective: null, inputSummary: [], agents: [], resultSummary: null, resultActions: [] }
}

export function createTaskViewModel(task: TaskSnapshot | null, profile?: AgentProfile): TaskViewModel {
  if (!task) return createIdleTaskViewModel()
  const textInputs = Object.entries(task.input).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
  const objectiveEntry = textInputs.find(([key]) => key === 'objective') ?? [...textInputs].sort((left, right) => right[1].trim().length - left[1].trim().length)[0]
  const objective = objectiveEntry?.[1] ?? null
  const inputSummary = Object.entries(task.input)
    .filter(([key]) => key !== objectiveEntry?.[0])
    .map(([key, value]) => ({ label: title(key), value: formatValue(value) }))
    .filter((entry): entry is { label: string; value: string } => entry.value !== null)

  return {
    id: task.id,
    profileLabel: profile?.name ?? task.profileId.replace(/[_-]/g, ' ').toUpperCase(),
    workflowLabel: task.workflowId ?? profile?.workflow.id ?? null,
    state: displayState[task.status],
    progress: task.progress,
    objective,
    inputSummary,
    agents: task.agents.map((agent) => ({ id: agent.id, label: agent.label, role: agent.role, status: agent.status, progress: agent.progress, summary: agent.summary, dependsOn: agent.dependsOn })),
    resultSummary: task.result?.summary ?? null,
    resultActions: task.result?.actions.map((action) => ({ id: action.id, label: action.label, kind: action.kind ?? 'secondary' })) ?? [],
  }
}
