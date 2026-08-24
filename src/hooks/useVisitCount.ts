import { useEffect, useState } from "react";

const VISIT_COUNT_KEY = "cc_visit_count";
const SESSION_GUARD_KEY = "cc_visit_counted_session";

/**
 * SSR-safe, localStorage-backed visit counter. Increments once per browser
 * session (guarded by sessionStorage) inside a client-only effect.
 */
export function useVisitCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const already = window.sessionStorage.getItem(SESSION_GUARD_KEY);
      const stored = Number(window.localStorage.getItem(VISIT_COUNT_KEY) ?? "0");

      if (!already) {
        const next = stored + 1;
        window.localStorage.setItem(VISIT_COUNT_KEY, String(next));
        window.sessionStorage.setItem(SESSION_GUARD_KEY, "1");
        setCount(next);
      } else {
        setCount(stored);
      }
    } catch {
      // localStorage/sessionStorage unavailable (private mode, etc.) — no-op.
    }
  }, []);

  return count;
}
