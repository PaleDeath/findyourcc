import { AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react";
import type { CategoryBest } from "@/components/wallet/wallet-analysis";
import { formatINR, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

function tierFor(cat: CategoryBest): { label: string; classes: string; Icon: typeof CheckCircle2 } {
  if (cat.excludedOnAll || cat.bestRatePct <= 0) {
    return {
      label: "Excluded / no coverage",
      classes: "bg-red-500/15 text-red-700 dark:text-red-300",
      Icon: AlertTriangle,
    };
  }
  if (cat.bestRatePct > 3) {
    return {
      label: "Strong",
      classes: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      Icon: CheckCircle2,
    };
  }
  if (cat.bestRatePct >= 1.5) {
    return {
      label: "Okay",
      classes: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      Icon: MinusCircle,
    };
  }
  return {
    label: "Weak",
    classes: "bg-red-500/15 text-red-700 dark:text-red-300",
    Icon: AlertTriangle,
  };
}

export function CategoryHeatmap({ coverage }: { coverage: CategoryBest[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Category
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Your spend
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Best rate
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Winning card
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {coverage.map((cat) => {
            const tier = tierFor(cat);
            return (
              <tr key={cat.key}>
                <td className="px-3 py-2.5 font-medium">{cat.label}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formatINR(cat.monthlySpend)}/mo
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      tier.classes,
                    )}
                  >
                    <tier.Icon className="size-3.5" aria-hidden="true" />
                    {tier.label} · {formatPct(cat.bestRatePct)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {cat.winner ? cat.winner.name : "None of your cards"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
