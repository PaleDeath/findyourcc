import { AlertCircle } from "lucide-react";
import type { OverlapWarning, FeeOverlapWarning } from "@/components/wallet/wallet-analysis";
import { formatINR } from "@/lib/format";

interface OverlapWarningsProps {
  categoryOverlaps: OverlapWarning[];
  feeOverlap: FeeOverlapWarning | null;
}

export function OverlapWarnings({ categoryOverlaps, feeOverlap }: OverlapWarningsProps) {
  if (categoryOverlaps.length === 0 && !feeOverlap) return null;

  return (
    <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
        <AlertCircle className="size-4" aria-hidden="true" />
        <p className="text-sm font-semibold">Overlap in your wallet</p>
      </div>
      <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200/90">
        {categoryOverlaps.map((w) => (
          <li key={w.categoryLabel}>
            Both {w.cardNames.join(" and ")} are strong on <strong>{w.categoryLabel}</strong> —
            you're duplicating.
          </li>
        ))}
        {feeOverlap && (
          <li>
            You're paying annual fees on {feeOverlap.cardNames.length} overlapping premium cards (
            {feeOverlap.cardNames.join(", ")}) — about {formatINR(feeOverlap.totalFee)}/year
            combined. Check whether both sets of benefits are worth keeping.
          </li>
        )}
      </ul>
    </div>
  );
}
