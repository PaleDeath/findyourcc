import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const DISCLAIMER_TEXT =
  "FindYourCC is an independent financial education and comparison index. We are not a bank, NBFC, financial advisor, or RBI-regulated intermediary, and we earn zero commissions on card applications. Product names, logos, and card visuals belong to their respective issuers and are displayed strictly for user identification. Fees, reward rates, interest rates (APR), milestone criteria, and airport lounge rules are updated regularly but remain subject to change by issuing banks. Reward projections and valuation figures are estimates based on stated spend breakdowns. Always consult the official Most Important Terms and Conditions (MITC) and Key Fact Statement (KFS) on the issuer's website before applying.";

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
      aria-label="Compliance & Legal Disclaimer"
      className={cn(
        "flex gap-3 rounded-xl border border-border/80 bg-surface/60 p-4 text-xs leading-relaxed text-muted-foreground backdrop-blur-xs",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p>{DISCLAIMER_TEXT}</p>
    </aside>
  );
}
