import { describe, expect, it } from 'vitest'

describe('formatMetricValue', () => {
  it('formats precision and unit for the neural HUD', async () => {
    const { formatMetricValue } = await import('./neuralMetrics')

    expect(formatMetricValue(94.23, 'percentage')).toBe('94.2%')
    expect(formatMetricValue(401.7, 'frequency')).toBe('402 THz')
    expect(formatMetricValue(8.24, 'millions')).toBe('8.2M')
  })
})
