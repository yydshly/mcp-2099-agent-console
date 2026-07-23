import { describe, expect, it } from 'vitest'
import { cycleSceneQuality, resolveScenePerformanceProfile } from '../../src/domain/scene-quality'

describe('scene quality', () => {
  it('cycles through the persistent operator quality choices', () => {
    expect(cycleSceneQuality('auto')).toBe('eco')
    expect(cycleSceneQuality('eco')).toBe('cinema')
    expect(cycleSceneQuality('cinema')).toBe('auto')
  })

  it('adapts automatic quality to constrained devices', () => {
    expect(resolveScenePerformanceProfile('auto', { hardwareConcurrency: 4, deviceMemory: 4 })).toMatchObject({ lowPower: true, antialias: false, maxDpr: 1.35 })
    expect(resolveScenePerformanceProfile('auto', { hardwareConcurrency: 12, deviceMemory: 16 })).toMatchObject({ lowPower: false, antialias: true, maxDpr: 1.75 })
  })

  it('allows explicit eco and cinema overrides', () => {
    expect(resolveScenePerformanceProfile('eco', { hardwareConcurrency: 16 })).toMatchObject({ lowPower: true, powerPreference: 'low-power' })
    expect(resolveScenePerformanceProfile('cinema', { hardwareConcurrency: 2 })).toMatchObject({ lowPower: false, maxDpr: 2, powerPreference: 'high-performance' })
  })

  it('uses low power automatically when the browser requests data saving or reports a 2G connection', () => {
    expect(resolveScenePerformanceProfile('auto', { hardwareConcurrency: 16, deviceMemory: 16, saveData: true })).toMatchObject({ lowPower: true, powerPreference: 'low-power' })
    expect(resolveScenePerformanceProfile('auto', { hardwareConcurrency: 16, deviceMemory: 16, effectiveType: '2g' })).toMatchObject({ lowPower: true, maxDpr: 1.35 })
    expect(resolveScenePerformanceProfile('cinema', { saveData: true })).toMatchObject({ lowPower: false, powerPreference: 'high-performance' })
  })
})
