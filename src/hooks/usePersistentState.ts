import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "cardcompass.v1.";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * SSR-safe persisted state. Renders `initial` on the server and during the
 * first client render, then hydrates from localStorage in an effect so markup
 * never mismatches.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  // Mirror of the latest value so updater functions run exactly once, outside
  // React's state reducer (which may replay updaters and would double-apply
  // non-idempotent updates such as toggles).
  const valueRef = useRef<T>(initial);

  const commit = useCallback((next: T) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  useEffect(() => {
    commit(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(valueRef.current) : next;
      commit(resolved);
      try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(resolved));
        window.dispatchEvent(new CustomEvent("cardcompass:storage", { detail: key }));
      } catch {
        /* storage full or unavailable — keep in-memory value */
      }
    },
    [commit, key],
  );

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail === key) commit(read<T>(key, initial));
    };
    const onNativeStorage = (event: StorageEvent) => {
      // Another tab wrote to the same key.
      if (event.key === PREFIX + key) commit(read<T>(key, initial));
    };
    window.addEventListener("cardcompass:storage", onChange);
    window.addEventListener("storage", onNativeStorage);
    return () => {
      window.removeEventListener("cardcompass:storage", onChange);
      window.removeEventListener("storage", onNativeStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, update, hydrated];
}

export function clearPersisted(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
    window.dispatchEvent(new CustomEvent("cardcompass:storage", { detail: key }));
  } catch {
    /* ignore */
  }
}
