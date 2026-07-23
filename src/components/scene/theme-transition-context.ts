import { createContext, useContext, type MutableRefObject } from 'react'
import type { ThemeTransitionSignal } from '../../domain/theme-transition'

export const ThemeTransitionContext = createContext<MutableRefObject<ThemeTransitionSignal> | null>(null)

export function useThemeTransitionSignal(): MutableRefObject<ThemeTransitionSignal> {
  const signal = useContext(ThemeTransitionContext)
  if (!signal) throw new Error('WebGL theme consumers must render inside ThemeTransitionSystem')
  return signal
}
