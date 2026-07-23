import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function usePersistentState<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) as T : fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage is optional; the console remains usable in private or restricted contexts.
    }
  }, [key, value])

  return [value, setValue]
}
