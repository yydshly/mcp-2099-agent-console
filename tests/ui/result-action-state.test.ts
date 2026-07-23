import { describe, expect, it } from 'vitest'
import { getResultActionStatus, setResultActionStatus } from '../../src/ui/result-action-state'

describe('result action state', () => {
  it('defaults missing actions to idle and updates immutably', () => {
    const initial = new Map<string, 'idle' | 'requesting' | 'requested' | 'failed'>()
    const requesting = setResultActionStatus(initial, 'export', 'requesting')

    expect(getResultActionStatus(initial, 'export')).toBe('idle')
    expect(getResultActionStatus(requesting, 'export')).toBe('requesting')
    expect(initial).not.toBe(requesting)
  })
})
