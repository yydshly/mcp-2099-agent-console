import { useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { advanceThemeTransition, type ThemeDirection, type ThemeTransitionSignal } from '../../domain/theme-transition'
import { ThemeTransitionContext } from './theme-transition-context'

interface ThemeTransitionSystemProps {
  lightTheme: boolean
  transitioning: boolean
  direction: ThemeDirection
  reducedMotion: boolean
  children: ReactNode
}

function ThemeTransitionDriver({ signal, lightTheme, transitioning, direction, reducedMotion }: Omit<ThemeTransitionSystemProps, 'children'> & { signal: MutableRefObject<ThemeTransitionSignal> }) {
  useFrame((_, delta) => {
    signal.current = advanceThemeTransition(signal.current, { lightTheme, transitioning, direction, reducedMotion }, delta)
  }, -100)
  return null
}

export function ThemeTransitionSystem({ lightTheme, transitioning, direction, reducedMotion, children }: ThemeTransitionSystemProps) {
  const initial = useMemo<ThemeTransitionSignal>(() => ({ blend: lightTheme ? 1 : 0, pulse: 0, lightArrival: 0 }), [lightTheme])
  const signal = useRef(initial)
  return <ThemeTransitionContext.Provider value={signal}><ThemeTransitionDriver signal={signal} lightTheme={lightTheme} transitioning={transitioning} direction={direction} reducedMotion={reducedMotion} />{children}</ThemeTransitionContext.Provider>
}
