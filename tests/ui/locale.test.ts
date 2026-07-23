import { describe, expect, it } from 'vitest'
import { isLocale, translate } from '../../src/ui/locale'

describe('locale dictionary', () => {
  it('validates supported locales and resolves translated text', () => {
    expect(isLocale('zh-CN')).toBe(true)
    expect(isLocale('fr')).toBe(false)
    expect(translate('zh-CN', 'nav.newTask')).toBe('新建任务')
    expect(translate('en', 'nav.newTask')).toBe('NEW TASK')
    expect(translate('zh-CN', 'workspace.title')).toBe('工作台')
    expect(translate('en', 'result.ready')).toBe('RESULT READY')
  })
})
