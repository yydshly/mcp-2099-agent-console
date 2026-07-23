import { describe, expect, it } from 'vitest'
import { getAgentPhaseLabelKey, getLocalScenarioCopyKeys, getTaskStateLabelKey } from '../../src/ui/runtime-state-presentation'

describe('runtime state presentation', () => {
  it('maps display states to locale keys', () => {
    expect(getTaskStateLabelKey('running')).toBe('state.running')
    expect(getTaskStateLabelKey('complete')).toBe('state.complete')
    expect(getTaskStateLabelKey('cancelled')).toBe('state.cancelled')
  })

  it('maps legacy task phases without changing runtime values', () => {
    expect(getAgentPhaseLabelKey('routing')).toBe('task.routing')
    expect(getAgentPhaseLabelKey('failed')).toBe('task.failed')
  })

  it('maps local scenarios to localized copy keys', () => {
    expect(getLocalScenarioCopyKeys('waiting_approval')).toEqual({ label: 'scenario.waitingApproval', detail: 'scenario.waitingApprovalDetail' })
    expect(getLocalScenarioCopyKeys('completed')).toEqual({ label: 'scenario.completed', detail: 'scenario.completedDetail' })
  })
})
