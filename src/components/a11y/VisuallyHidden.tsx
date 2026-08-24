import type { ReactNode } from "react";

/**
 * Visually hides content while keeping it available to assistive tech.
 * Use for live-region announcements or extra context for screen readers.
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
