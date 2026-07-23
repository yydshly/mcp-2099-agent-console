export type ThemeDirection = 'to-light' | 'to-dark' | null

export interface ThemeTransitionSignal {
  blend: number
  pulse: number
  lightArrival: number
}

interface ThemeTransitionInput {
  lightTheme: boolean
  transitioning: boolean
  direction: ThemeDirection
  reducedMotion: boolean
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export function advanceThemeTransition(current: ThemeTransitionSignal, input: ThemeTransitionInput, delta: number): ThemeTransitionSignal {
  const target = input.transitioning ? (input.direction === 'to-light' ? 1 : 0) : (input.lightTheme ? 1 : 0)
  if (input.reducedMotion) return { blend: target, pulse: 0, lightArrival: 0 }

  const rate = input.transitioning ? 1.9 : 4.2
  const blend = clamp01(current.blend + (target - current.blend) * (1 - Math.exp(-Math.min(delta, 0.05) * rate)))
  const pulse = input.transitioning ? Math.sin(Math.PI * blend) : 0
  return { blend, pulse, lightArrival: input.direction === 'to-light' ? pulse : 0 }
}
