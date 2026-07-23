import { describe, expect, it } from 'vitest'
import { operationConfirmLabels } from '../../src/ui/operation-confirmation'

describe('operation confirmation labels', () => {
  it('keeps destructive operation labels explicit', () => {
    expect(operationConfirmLabels.cancel).toBe('CONFIRM CANCEL')
    expect(operationConfirmLabels.removeQueued).toBe('REMOVE FROM QUEUE')
  })
})
