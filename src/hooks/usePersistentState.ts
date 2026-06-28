import { useCallback, useEffect, useState } from 'react'

/**
 * useState mirrored to localStorage. Used for unit prefs, theme mode, the active
 * location and saved favorites so the dashboard remembers the user's setup.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* storage full or blocked — non-fatal */
    }
  }, [key, state])

  const set = useCallback((value: T | ((prev: T) => T)) => setState(value), [])

  return [state, set]
}
