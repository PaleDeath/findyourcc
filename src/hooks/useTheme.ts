import { useEffect } from "react";
import { usePersistentState } from "./usePersistentState";

export type ThemeMode = "light" | "dark" | "system";

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode !== "system") return mode;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [mode, setMode, hydrated] = usePersistentState<ThemeMode>("theme", "system");

  useEffect(() => {
    if (!hydrated) return;
    const apply = () => {
      const resolved = resolve(mode);
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.style.colorScheme = resolved;
    };
    apply();
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode, hydrated]);

  const resolved = hydrated ? resolve(mode) : "light";

  return { mode, setMode, resolved, hydrated };
}
