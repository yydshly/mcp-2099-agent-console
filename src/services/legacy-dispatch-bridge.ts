import type { CreateTaskCommand } from '../domain/agent-contract'
import type { AgentProfile, DispatchRequest, TaskPriority } from '../domain/agent'

const legacyPriority: Record<'standard' | 'high' | 'urgent', TaskPriority> = {
  standard: 'standard',
  high: 'priority',
  urgent: 'critical',
}

export function createLegacyDispatchRequest(command: CreateTaskCommand): DispatchRequest {
  const { objective, ...contextInput } = command.input
  const fallbackObjective = Object.values(command.input)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .sort((left, right) => right.trim().length - left.trim().length)[0]
  return {
    profile: command.profileId as AgentProfile,
    objective: typeof objective === 'string' ? objective : typeof fallbackObjective === 'string' ? fallbackObjective : 'Execute the selected Profile workflow.',
    priority: legacyPriority[command.options?.priority ?? 'standard'],
    requiresApproval: command.options?.approvalPolicy === 'required',
    context: Object.fromEntries(Object.entries(contextInput).flatMap(([key, value]) => typeof value === 'string' ? [[key, value]] : [])),
  }
}
