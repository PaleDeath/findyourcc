import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const DISCLAIMER_TEXT =
  "FindYourCC is independent — not affiliated with, endorsed by, or paid by any bank or card issuer. Card images, names and logos are the property of their respective issuers and are shown for identification only. Card features, fees and eligibility change frequently, so always verify on the issuer's official website before applying. Nothing here is financial advice.";

export function Disclaimer({
  variant = "block",
  className,
}: {
  variant?: "block" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
        {DISCLAIMER_TEXT}
      </p>
    );
  }

  return (
    <aside
      aria-label="Disclaimer"
      className={cn(
        "flex gap-3 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p>{DISCLAIMER_TEXT}</p>
    </aside>
  );
}
