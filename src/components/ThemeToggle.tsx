import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light theme", Icon: Sun },
  { mode: "system", label: "System theme", Icon: Monitor },
  { mode: "dark", label: "Dark theme", Icon: Moon },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const cycleTheme = () => {
    if (mode === "light") setMode("dark");
    else if (mode === "dark") setMode("system");
    else setMode("light");
  };

  return (
    <>
      {/* Mobile single toggle button (36px width instead of 98px pill) */}
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Current theme: ${mode}. Tap to change theme.`}
        className="btn-tactile grid size-9 sm:hidden place-items-center rounded-xl border border-border bg-surface/60 text-foreground shadow-2xs transition-colors hover:bg-surface dark:border-white/10 dark:bg-white/[0.04]"
      >
        {mode === "dark" ? (
          <Moon className="size-4 text-foreground" />
        ) : mode === "light" ? (
          <Sun className="size-4 text-foreground" />
        ) : (
          <Monitor className="size-4 text-foreground" />
        )}
      </button>

      {/* Desktop 3-button pill */}
      <div
        role="group"
        aria-label="Colour theme"
        className="hidden sm:inline-flex items-center rounded-full border border-border bg-surface p-0.5 dark:border-white/10 dark:bg-white/[0.04]"
      >
        {OPTIONS.map(({ mode: value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-label={label}
            aria-pressed={mode === value}
            className={cn(
              "btn-tactile grid size-8 place-items-center rounded-full transition-colors duration-150",
              mode === value
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </>
  );
}
