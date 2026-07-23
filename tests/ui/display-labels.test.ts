import { describe, expect, it } from 'vitest'
import { getSceneQualityLabelKey, getTransportLabelKey, getVisualModeLabelKey } from '../../src/ui/display-labels'

describe('display labels', () => {
  it('keeps internal scene values separate from localized display keys', () => {
    expect(getSceneQualityLabelKey('auto')).toBe('nav.qualityAuto')
    expect(getSceneQualityLabelKey('cinema')).toBe('nav.qualityCinema')
    expect(getVisualModeLabelKey('feral')).toBe('nav.modeFeral')
  })

  it('maps adapter transport values to display keys', () => {
    expect(getTransportLabelKey('local-mock')).toBe('display.localMock')
    expect(getTransportLabelKey('remote')).toBe('display.remote')
  })
})
