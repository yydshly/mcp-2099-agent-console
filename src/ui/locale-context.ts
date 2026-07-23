import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import { translate, type Locale, type TranslationKey } from './locale-core'

export interface LocaleContextValue {
  locale: Locale
  setLocale: Dispatch<SetStateAction<Locale>>
  t: (key: TranslationKey) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocaleText() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocaleText must be used within LocaleProvider')
  return value
}

export const createLocaleContextValue = (locale: Locale, setLocale: Dispatch<SetStateAction<Locale>>): LocaleContextValue => ({ locale, setLocale, t: (key) => translate(locale, key) })
