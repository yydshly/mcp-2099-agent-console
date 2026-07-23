import { describe, expect, it } from 'vitest'
import { advanceThemeTransition } from '../../src/domain/theme-transition'

describe('theme transition signal', () => {
  it('moves day and night transitions monotonically through one shared blend', () => {
    const night = { blend: 0, pulse: 0, lightArrival: 0 }
    const dawn = advanceThemeTransition(night, { lightTheme: false, transitioning: true, direction: 'to-light', reducedMotion: false }, 0.5)
    const laterDawn = advanceThemeTransition(dawn, { lightTheme: true, transitioning: true, direction: 'to-light', reducedMotion: false }, 0.5)
    expect(dawn.blend).toBeGreaterThan(0)
    expect(laterDawn.blend).toBeGreaterThan(dawn.blend)
    expect(dawn.lightArrival).toBeGreaterThan(0)

    const dusk = advanceThemeTransition({ blend: 1, pulse: 0, lightArrival: 0 }, { lightTheme: true, transitioning: true, direction: 'to-dark', reducedMotion: false }, 0.5)
    expect(dusk.blend).toBeLessThan(1)
    expect(dusk.lightArrival).toBe(0)
  })

  it('uses a symmetric transition rate in both directions', () => {
    const dawn = advanceThemeTransition({ blend: 0, pulse: 0, lightArrival: 0 }, { lightTheme: false, transitioning: true, direction: 'to-light', reducedMotion: false }, 0.25)
    const dusk = advanceThemeTransition({ blend: 1, pulse: 0, lightArrival: 0 }, { lightTheme: true, transitioning: true, direction: 'to-dark', reducedMotion: false }, 0.25)
    expect(dawn.blend).toBeCloseTo(1 - dusk.blend, 8)
  })

  it('switches immediately without transition energy for reduced motion', () => {
    expect(advanceThemeTransition({ blend: 0, pulse: 1, lightArrival: 1 }, { lightTheme: true, transitioning: false, direction: null, reducedMotion: true }, 0.016)).toEqual({ blend: 1, pulse: 0, lightArrival: 0 })
  })
})
