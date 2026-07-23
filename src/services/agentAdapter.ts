import type { AgentPhase, AgentActivity, DispatchRequest } from '../domain/agent'

export interface AgentRuntimeStep {
  phase: AgentPhase
  progress: number
  delay: number
  label: string
  detail: string
  tone: AgentActivity['tone']
}

export interface AgentApiAdapter {
  id: string
  label: string
  transport: 'local-mock' | 'http'
  getExecutionPlan: (request: DispatchRequest) => AgentRuntimeStep[]
}

const localMockPlan: ReadonlyArray<AgentRuntimeStep> = [
  { phase: 'calibrating', progress: 8, delay: 0, label: 'CORE_LINK', detail: 'Agent profile and permission boundary loaded', tone: 'signal' },
  { phase: 'routing', progress: 26, delay: 760, label: 'TASK_ROUTE', detail: 'Objective routed to bounded workflow', tone: 'neutral' },
  { phase: 'executing', progress: 54, delay: 1540, label: 'TOOL_CHAIN', detail: 'Executing approved operational steps', tone: 'signal' },
  { phase: 'synthesizing', progress: 82, delay: 2420, label: 'SYNTHESIS', detail: 'Compiling operator-ready result', tone: 'neutral' },
  { phase: 'complete', progress: 100, delay: 3280, label: 'TASK_COMPLETE', detail: 'Result ready for review', tone: 'success' },
]

export const localMockAgentAdapter: AgentApiAdapter = {
  id: 'local-mock-v1',
  label: 'LOCAL MOCK AGENT ADAPTER',
  transport: 'local-mock',
  getExecutionPlan: (request) => {
    const speed = request.priority === 'critical' ? 0.72 : request.priority === 'priority' ? 0.86 : 1
    return localMockPlan.map((step) => ({ ...step, delay: Math.round(step.delay * speed) }))
  },
}
