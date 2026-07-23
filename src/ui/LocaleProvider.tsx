import { useMemo, type ReactNode } from 'react'
import { LocaleContext, createLocaleContextValue } from './locale-context'
import type { LocaleState } from './locale-core'

export function LocaleProvider({ value, children }: { value: LocaleState; children: ReactNode }) {
  const contextValue = useMemo(() => createLocaleContextValue(value.locale, value.setLocale), [value.locale, value.setLocale])
  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}
