import type { TaskDisplayState } from '../domain/task-view-model'
import type { AgentTask } from '../hooks/useAgentSimulation'
import type { LocalMockScenario } from '../services/local-mock-scenarios'
import type { TranslationKey } from './locale-core'

const stateKeys: Record<TaskDisplayState, TranslationKey> = {
  idle: 'state.idle', queued: 'state.queued', running: 'state.running', paused: 'state.paused', waiting_approval: 'state.waitingApproval', complete: 'state.complete', failed: 'state.failed', cancelled: 'state.cancelled',
}

const phaseKeys: Record<AgentTask['phase'], TranslationKey> = {
  idle: 'task.idle', calibrating: 'task.calibrating', routing: 'task.routing', executing: 'task.executing', synthesizing: 'task.synthesizing', complete: 'task.complete', paused: 'task.paused', failed: 'task.failed', cancelled: 'task.cancelled',
}

const scenarioKeys: Record<LocalMockScenario, { label: TranslationKey; detail: TranslationKey }> = {
  queued: { label: 'scenario.queued', detail: 'scenario.queuedDetail' }, running: { label: 'scenario.running', detail: 'scenario.runningDetail' }, paused: { label: 'scenario.paused', detail: 'scenario.pausedDetail' }, waiting_approval: { label: 'scenario.waitingApproval', detail: 'scenario.waitingApprovalDetail' }, completed: { label: 'scenario.completed', detail: 'scenario.completedDetail' }, failed: { label: 'scenario.failed', detail: 'scenario.failedDetail' }, cancelled: { label: 'scenario.cancelled', detail: 'scenario.cancelledDetail' },
}

export const getTaskStateLabelKey = (state: TaskDisplayState) => stateKeys[state]
export const getAgentPhaseLabelKey = (phase: AgentTask['phase']) => phaseKeys[phase]
export const getLocalScenarioCopyKeys = (scenario: LocalMockScenario) => scenarioKeys[scenario]
