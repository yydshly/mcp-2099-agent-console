import { useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'light' | 'auto'
export type ResolvedTheme = 'dark' | 'light'

function readStoredTheme(): ThemeMode {
  const stored = window.localStorage.getItem('mcp-2099-theme')
  return stored === 'light' || stored === 'auto' ? stored : 'dark'
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(readStoredTheme)
  const [systemLight, setSystemLight] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches)
  const theme: ResolvedTheme = mode === 'auto' ? (systemLight ? 'light' : 'dark') : mode

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const update = () => setSystemLight(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => window.localStorage.setItem('mcp-2099-theme', mode), [mode])
  // The visible control is intentionally binary: each click must change the rendered theme.
  const cycleTheme = () => setMode((current) => current === 'light' ? 'dark' : 'light')
  return { mode, theme, cycleTheme }
}
