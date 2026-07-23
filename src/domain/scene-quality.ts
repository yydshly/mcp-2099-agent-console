export type SceneQuality = 'auto' | 'eco' | 'cinema'

export interface SceneCapabilities {
  hardwareConcurrency?: number
  deviceMemory?: number
  saveData?: boolean
  effectiveType?: string
}

export interface ScenePerformanceProfile {
  lowPower: boolean
  maxDpr: number
  antialias: boolean
  powerPreference: 'low-power' | 'high-performance'
}

const qualityOrder: SceneQuality[] = ['auto', 'eco', 'cinema']

export function isSceneQuality(value: string | null): value is SceneQuality {
  return value !== null && qualityOrder.includes(value as SceneQuality)
}

export function cycleSceneQuality(current: SceneQuality): SceneQuality {
  return qualityOrder[(qualityOrder.indexOf(current) + 1) % qualityOrder.length]
}

export function resolveScenePerformanceProfile(quality: SceneQuality, capabilities: SceneCapabilities): ScenePerformanceProfile {
  if (quality === 'eco') return { lowPower: true, maxDpr: 1.15, antialias: false, powerPreference: 'low-power' }
  if (quality === 'cinema') return { lowPower: false, maxDpr: 2, antialias: true, powerPreference: 'high-performance' }

  const constrainedNetwork = capabilities.saveData === true || capabilities.effectiveType === 'slow-2g' || capabilities.effectiveType === '2g'
  const lowPower = constrainedNetwork || (capabilities.hardwareConcurrency ?? 8) <= 4 || (capabilities.deviceMemory ?? 8) <= 4
  return {
    lowPower,
    maxDpr: lowPower ? 1.35 : 1.75,
    antialias: !lowPower,
    powerPreference: lowPower ? 'low-power' : 'high-performance',
  }
}
