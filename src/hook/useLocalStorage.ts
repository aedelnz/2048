import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const set = useCallback((v: T | ((prev: T) => T)) => {
    const next = typeof v === 'function' ? (v as (prev: T) => T)(value) : v;
    setValue(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  }, [key, value]);

  const remove = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, set, remove] as const;
}