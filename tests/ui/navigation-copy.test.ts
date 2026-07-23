import { describe, expect, it } from 'vitest'
import { translate } from '../../src/ui/locale'

describe('navigation display copy', () => {
  it('localizes scene-quality labels without changing quality identifiers', () => {
    expect(translate('zh-CN', 'nav.qualityAuto')).toBe('自动')
    expect(translate('zh-CN', 'nav.qualityEco')).toBe('节能')
    expect(translate('zh-CN', 'nav.qualityCinema')).toBe('影院')
    expect(translate('en', 'nav.qualityCinema')).toBe('CINEMA')
  })
})
