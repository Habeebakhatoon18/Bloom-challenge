import { useCallback, useEffect, useRef, useState } from 'react';

// try/catch around all localStorage access; falls back to in-memory state.
function readLS<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return initial;
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

function writeLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode errors
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => readLS(key, initial));
  const keyRef = useRef(key);
  keyRef.current = key;

  // autosave on every change
  useEffect(() => {
    writeLS(key, state);
  }, [key, state]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState((prev) => (next instanceof Function ? (next as (p: T) => T)(prev) : next));
  }, []);

  return [state, set];
}

// Replace the entire stored value (used for import/reset) and persist immediately.
export function replaceStored<T>(key: string, value: T): void {
  writeLS(key, value);
}
