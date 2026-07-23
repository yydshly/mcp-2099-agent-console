export type AgentPhase = 'idle' | 'calibrating' | 'routing' | 'executing' | 'synthesizing' | 'complete' | 'paused' | 'failed' | 'cancelled'
export type AgentProfile = string
export type TaskPriority = 'standard' | 'priority' | 'critical'

export interface DispatchRequest {
  profile: AgentProfile
  objective: string
  priority: TaskPriority
  requiresApproval: boolean
  context: Record<string, string>
}

export interface AgentActivity {
  id: string
  time: string
  label: string
  detail: string
  tone: 'neutral' | 'signal' | 'success'
}

export interface AgentTask {
  phase: AgentPhase
  checkpointPhase?: 'calibrating' | 'routing' | 'executing' | 'synthesizing'
  progress: number
  activities: AgentActivity[]
  request: DispatchRequest | null
}

export const profileLabels: Record<string, string> = {
  'customer-support': 'CUSTOMER SUPPORT',
  'sales-ops': 'SALES OPERATIONS',
  operations: 'OPERATIONS',
  'data-analysis': 'DATA ANALYSIS',
}
