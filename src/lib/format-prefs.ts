import { useSyncExternalStore } from "react";

export type NumberFormatMode = "full" | "compact";

const STORAGE_KEY = "cc:number-format";
const listeners = new Set<() => void>();

let mode: NumberFormatMode = "compact";

if (typeof window !== "undefined") {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "full" || stored === "compact") mode = stored;
}

export function getNumberFormatMode(): NumberFormatMode {
  return mode;
}

export function setNumberFormatMode(next: NumberFormatMode): void {
  if (next === mode) return;
  mode = next;
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNumberFormatMode(): [NumberFormatMode, (next: NumberFormatMode) => void] {
  const value = useSyncExternalStore(
    subscribe,
    getNumberFormatMode,
    () => "compact" as NumberFormatMode,
  );
  return [value, setNumberFormatMode];
}
